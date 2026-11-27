// Ohne npm-Abhängigkeiten: node tests/frontend-panels.cjs (Chrome muss installiert sein).
const {spawn} = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pause = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'glitch-panels-'));
let chrome, ws;
// Isolierte API-Testdaten: keine echten Bestzeiten oder Spielstände verändern.
let online = true;
let rankingMode = 'ready';
const rankingEntries = [{name:'Faruk',seconds:182},{name:'<img src=x onerror=alert(1)>',seconds:205},{name:'SehrLangerSpielernameOhneLeerzeichen',seconds:240}];
const server = http.createServer((req,res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if(name==='/api/bestzeiten' && req.method==='GET') {
        setTimeout(()=>{
            res.setHeader('Content-Type','application/json');
            if(rankingMode==='error') { res.writeHead(503).end('{}'); return; }
            res.end(JSON.stringify(rankingMode==='empty'?[]:rankingEntries));
        },180);
        return;
    }
    if(name.startsWith('/api/')) {res.setHeader('Content-Type','application/json');res.end('{}');return;}
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (name === '/favicon.ico') { res.writeHead(204).end(); return; }
    fs.readFile(file, (err,data) => {
        if (err) {res.writeHead(404).end(); return;}
        res.setHeader('Content-Type', ({'.html':'text/html','.css':'text/css','.js':'text/javascript'})[path.extname(file)] || 'application/octet-stream');
        if(path.extname(file)==='.html' && online) {
            res.end(data.toString().replace('</head>','<script>window.glitchServer=true;</script></head>'));
        } else {res.end(data);}
    });
});
(async () => {
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const base = `http://127.0.0.1:${server.address().port}`;
    chrome = spawn(chromePath, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], {windowsHide:true, stdio:'ignore'});
    let port;
    for(let i=0;i<100;i++) {
        try {port = fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]; break;} catch {}
        await pause(100);
    }
    assert.ok(port, 'Chrome debugging port');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
    await new Promise(r=>ws.addEventListener('open',r,{once:true}));
    let serial=0; const pending = new Map(); const errors=[]; const failed=[];
    ws.addEventListener('message',event=>{
        const msg=JSON.parse(event.data);
        if(msg.id) {const p=pending.get(msg.id); pending.delete(msg.id); msg.error?p.reject(msg.error):p.resolve(msg.result);}
        if(msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails);
        if(msg.method==='Runtime.consoleAPICalled' && msg.params.type==='error') errors.push(msg.params.args);
        if(msg.method==='Network.responseReceived' && msg.params.response.status>=400) failed.push(msg.params.response.url);
        if(msg.method==='Network.loadingFailed') failed.push(msg.params.errorText);
    });
    const cdp=(method,params={})=>new Promise((resolve,reject)=>{
        const id=++serial; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params}));
    });
    const evaluate = async expression=>{
        const result=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
        if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
    };
    const waitFor=async expression=>{
        for(let i=0;i<100;i++) {try{if(await evaluate(expression))return;}catch{} await pause(50);}
        throw new Error('Timeout: '+expression);
    };
    const click=async selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
    const fill=async(selector,value)=>evaluate(`document.querySelector(${JSON.stringify(selector)}).value=${JSON.stringify(value)}`);
    const object=name=>click(`[data-object="${name}"]`);
    const check=async(expression,label)=>{assert.ok(await evaluate(expression),label); console.log('PASS '+label);};
    await cdp('Runtime.enable'); await cdp('Network.enable');
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await cdp('Page.navigate',{url:base+'/index.html'});
    await waitFor("document.querySelectorAll('.ranking-row').length===3");
    await check("document.querySelectorAll('.ranking').length===1 && document.querySelector('.ranking-time').textContent==='03:02'",'Rangliste mit Platzierung und formatierter Serverzeit');
    await check("!document.querySelector('#rankingList img') && document.getElementById('rankingList').textContent.includes('<img')",'fremde Spielernamen bleiben sicherer Text');
    await fill('#playerName','Faruk');
    await evaluate("document.getElementById('playerName').dispatchEvent(new Event('input',{bubbles:true}))");
    await cdp('Page.reload'); await waitFor("document.querySelectorAll('.ranking-row').length===3");
    await check("document.getElementById('playerName').value==='Faruk' && getPlayerName()==='Faruk'",'Spielername bleibt nach Neuladen erhalten');
    const layout = async label => {
        for(const width of [1440,768,390,320]) {
            await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<400});
            await check('document.documentElement.scrollWidth<=innerWidth',`${label} bei ${width}px ohne Überlauf`);
            if(process.env.SCREENSHOT_PATH && [1440,390].includes(width)) {
                await evaluate('window.scrollTo(0,0)');
                const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
                fs.writeFileSync(process.env.SCREENSHOT_PATH.replace(/.png$/,`-${label}-${width}.png`),Buffer.from(shot.data,'base64'));
            }
        }
    };
    await layout('rangliste');
    rankingMode='empty'; await click('#refreshRanking');
    await check("document.getElementById('refreshRanking').disabled && document.getElementById('rankingList').getAttribute('aria-busy')==='true'",'Ladezustand ist erkennbar und verhindert parallele Aktualisierungen');
    await waitFor("document.getElementById('rankingList').dataset.state==='empty'");
    await check("document.getElementById('rankingList').textContent.includes('Noch keine Zeiten')",'leere Rangliste erklärt');
    rankingMode='error'; await click('#refreshRanking');
    await waitFor("document.getElementById('rankingList').dataset.state==='error'");
    await check("!document.getElementById('refreshRanking').disabled && document.getElementById('rankingList').textContent.includes('erneut')",'Serverfehler lässt erneutes Laden zu');
    rankingMode='ready'; await click('#refreshRanking'); await waitFor("document.querySelectorAll('.ranking-row').length===3");
    console.log('PASS Rangliste nach Fehler erneut erfolgreich geladen');
    online=false;
    await cdp('Page.reload'); await waitFor("document.readyState==='complete' && !!document.querySelector('.level-buttons')");
    await check("!document.querySelector('.ranking')",'ohne Server bleibt das Hauptmenü spielbar und zeigt keine Online-Rangliste');
    await evaluate("localStorage.setItem(unlockedLevelKey,'4')");
    await cdp('Page.reload'); await waitFor("document.readyState==='complete' && !!document.querySelector('.level-buttons')");
    await click('[data-level="4"]');
    await waitFor("location.pathname.endsWith('room4.html') && document.readyState==='complete' && typeof puzzleArea!=='undefined'");
    await check("!![...document.styleSheets].find(s=>s.href.endsWith('room4.css')) && document.querySelectorAll('.objects svg').length===4 && document.querySelector('[data-object=kontrolle]').classList.contains('item-required')",'eigenes Level-4-Design und benötigte Zugangskarte sichtbar');
    await check("document.getElementById('inventoryCount').textContent==='0 Gegenstände' && document.querySelector('.inventory-empty')",'Inventar zeigt leeren Zustand und Anzahl');
    await layout('systemkern-leer');
    await object('kontrolle');
    await check("!!document.querySelector('.puzzle-locked') && !document.getElementById('processForm')",'Kontrollraum bleibt ohne Karte gesperrt');
    await object('schacht'); await fill('#textInput','7285'); await click('#textForm button');
    await check("document.getElementById('inventoryCount').textContent==='1 Gegenstand' && document.querySelector('.inventory-item .inventory-name').textContent==='Zugangskarte' && !document.querySelector('[data-object=kontrolle]').classList.contains('item-required')",'gefundene Karte erscheint und Zugangsmarkierung aktualisiert sich');
    await click('#backToObjects');
    await layout('systemkern-inventar');
    await object('kontrolle');
    await check("!!document.getElementById('processForm')",'Karte wird vom bestehenden Rätselsystem automatisch verwendet');
    await cdp('Page.reload');
    await waitFor("document.readyState==='complete' && !!document.querySelector('.inventory-item')");
    await check("document.getElementById('inventoryCount').textContent==='1 Gegenstand' && getSolvedCount()===1",'Inventaranzeige und Fortschritt nach Neuladen korrekt');
    assert.deepEqual(errors,[],'keine JavaScript-Fehler');
    assert.deepEqual(failed.filter(url=>!url.endsWith('/api/bestzeiten')),[],'keine unerwartet fehlgeschlagenen Ressourcen');
    console.log('PASS keine JavaScript-Fehler oder unerwartet fehlgeschlagenen Ressourcen');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(async()=>{
    if(ws?.readyState===1) ws.close();
    if(chrome) chrome.kill();
    server.closeAllConnections(); server.close();
    await pause(700);
    // Nur das eigens angelegte temporäre Chrome-Profil entfernen.
    if(profile.startsWith(path.join(os.tmpdir(),'glitch-panels-'))) {
        try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3});}catch{}
    }
});

