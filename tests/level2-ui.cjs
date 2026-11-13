// Ohne npm-Abhängigkeiten: node tests/level2-ui.cjs (Chrome muss installiert sein).
const {spawn} = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pause = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'glitch-ui-'));
let chrome, ws;
const server = http.createServer((req,res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (name === '/favicon.ico') { res.writeHead(204).end(); return; }
    fs.readFile(file, (err,data) => {
        if (err) {res.writeHead(404).end(); return;}
        res.setHeader('Content-Type', ({'.html':'text/html','.css':'text/css','.js':'text/javascript'})[path.extname(file)] || 'application/octet-stream');
        res.end(data);
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
    await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Network.enable');
    await cdp('Page.navigate',{url:base+'/room2.html'}); await waitFor("location.pathname.endsWith('index.html') && document.readyState==='complete'");
    console.log('PASS direkter Levelzugriff führt ins Menü');
    await click('#startButton'); await waitFor("location.pathname.endsWith('room.html') && typeof puzzleArea !== 'undefined'");
    await object('schrank'); await fill('#codeInput','2048'); await click('#codeForm button');
    await object('terminal'); for(const letter of 'GLITCH') await click(`[data-letter="${letter}"]`);
    await object('stromkasten'); await click('#switchA'); await click('#switchC'); await click('#switchSubmit');
    await check('getSolvedCount()===3','Level 1 weiterhin lösbar');
    await object('tuer'); await waitFor("location.pathname.endsWith('room2.html') && !!document.querySelector('.level-two') && typeof puzzlePanel === 'undefined' && document.readyState==='complete'");
    await check("getSolvedCount()===0 && getTimeLeft()>=295",'Levelwechsel setzt Level-2-Fortschritt und Timer korrekt');
    await check("document.querySelectorAll('.game-room').length===1 && document.querySelectorAll('.object').length===4 && !document.querySelector('[data-faruk-object]')",'genau ein Raum mit vier Originalobjekten');
    await check("new Set([...document.scripts].map(s=>s.src)).size===document.scripts.length",'keine doppelten Skripte');
    await check("document.styleSheets.length===4 && [...document.styleSheets].every(s=>s.cssRules.length>0)",'alle vier Stylesheets geladen');
    await object('tuer'); await check("!document.getElementById('winScreen') && document.getElementById('message').textContent.includes('0/3')",'Tür bleibt bei 0/3 gesperrt');
    await object('konsole');
    await check("getComputedStyle(document.querySelector('#puzzleArea .glitch-hint')).display==='none'",'Hinweis zunächst verborgen');
    await click('#glitchButton');
    await check("document.body.classList.contains('glitch-active') && document.getElementById('glitchButton').getAttribute('aria-pressed')==='true' && getComputedStyle(document.querySelector('#puzzleArea .glitch-hint')).display!=='none'",'Glitch-Modus zeigt Hinweise und gedrückten Zustand');
    await fill('#textInput','UHVHW'); await click('#textForm button');
    await check("getSolvedCount()===0 && document.getElementById('puzzleFeedback').textContent.includes('Verschiebung')",'Konsole erklärt falschen Befehl');
    await fill('#textInput',' reset '); await click('#textForm button');
    await check("getSolvedCount()===1 && document.querySelector('[data-object=konsole]').classList.contains('solved')",'Konsole gelöst und Karte aktualisiert');
    const deadline=await evaluate('levelEndTime');
    await cdp('Page.reload'); await waitFor("document.readyState==='complete' && document.querySelector('.object.solved')");
    assert.equal(await evaluate('levelEndTime'),deadline); console.log('PASS Restzeit und Fortschritt nach Neuladen erhalten');
    await object('konsole'); await check("document.getElementById('puzzleFeedback').textContent.includes('bereits gelöst') && getSolvedCount()===1",'gelöstes Rätsel ohne Doppelzählung');
    await object('tresor');
    const hintHidden = "getComputedStyle(document.querySelector('#puzzleArea .glitch-hint')).display==='none'";
    await check(hintHidden, 'Tresor-Hinweis bei ausgeschaltetem Glitch-Modus verborgen');
    await click('#glitchButton');
    await check(`!(${hintHidden}) && document.querySelector('#puzzleArea .glitch-hint').textContent.includes('C → A → D → B')`, 'Tresor-Hinweis zeigt Lesereihenfolge');
    await click('#glitchButton');
    await check(hintHidden, 'Tresor-Hinweis lässt sich wieder ausblenden');
    await fill('#codeInput','68'); await click('#codeForm button');
    await check("getSolvedCount()===1 && document.getElementById('puzzleFeedback').textContent.includes('genau 4 Zahlen')",'Tresor erklärt ungültiges Format');
    await fill('#codeInput','8264'); await click('#codeForm button');
    await check("getSolvedCount()===1 && document.getElementById('puzzleFeedback').textContent.includes('Reihenfolge')",'Tresor erklärt falschen Code');
    await fill('#codeInput','6842'); await click('#codeForm button');
    await object('server');
    await check(hintHidden, 'Server-Hinweis bei ausgeschaltetem Glitch-Modus verborgen');
    await click('#glitchButton');
    await check(`!(${hintHidden}) && document.querySelector('#puzzleArea .glitch-hint').textContent.includes('B und D sind intakt')`, 'Server-Hinweis zeigt intakte Module');
    await click('#glitchButton');
    await check(hintHidden, 'Server-Hinweis lässt sich wieder ausblenden');
    await click('[data-module=A]'); await click('[data-module=B]'); await click('#moduleSubmit');
    await check("getSolvedCount()===2 && document.getElementById('puzzleFeedback').textContent.includes('intakten Module')",'Server erklärt falsche Auswahl');
    await click('[data-module=A]'); await click('[data-module=D]'); await click('#moduleSubmit');
    await check("getSolvedCount()===3 && document.querySelector('[data-object=tuer]').classList.contains('unlocked') && document.querySelector('[data-object=tuer] .object-status').textContent.includes('Freigeschaltet')",'alle Rätsel lösen und Ausgang freischalten');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await pause(50);
    await check("document.activeElement.dataset.object==='server' && document.querySelector('[data-object=server]').getAttribute('aria-expanded')==='false'",'Fokus kehrt nach Schliessen zum Objekt zurück');
    await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await check("document.activeElement.dataset.object==='tuer' && document.activeElement.matches(':focus-visible') && getComputedStyle(document.activeElement).outlineStyle==='solid'",'Tastaturnavigation mit sichtbarem Fokus');
    // Ungelöstes Rätsel für Layout-/Hinweisprüfung wiederherstellen, nur im Test.
    await evaluate("puzzles.puzzle3.solved=false;updateDoor()"); await object('server'); await click('#glitchButton');
    for(const width of [1440,768,390,320]) {
        await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
        await evaluate('window.scrollTo(0,document.body.scrollHeight)'); await pause(150);
        await check("document.documentElement.scrollWidth<=innerWidth && [...document.querySelectorAll('.object')].every(e=>{const r=e.getBoundingClientRect();return r.width>100&&r.left>=0&&r.right<=innerWidth})",`Layout ${width}px ohne horizontalen Überlauf`);
        if(width===390 && process.env.SCREENSHOT_PATH) {
            await evaluate('window.scrollTo(0,0)'); await pause(100);
            const shot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
            fs.writeFileSync(process.env.SCREENSHOT_PATH.replace(/\.png$/, '-mobile.png'),Buffer.from(shot.data,'base64'));
            await evaluate('window.scrollTo(0,document.body.scrollHeight)');
        }
        await check("['timer','progress'].every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})",`HUD bei ${width}px nach Scrollen sichtbar`);
    }
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await check("getComputedStyle(document.querySelector('.game-room h1')).animationName==='none'",'reduzierte Bewegung berücksichtigt');
    await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    await click('#closePuzzle'); await evaluate('window.scrollTo(0,0)'); await pause(300);
    if(process.env.SCREENSHOT_PATH) {
        const shot=await cdp('Page.captureScreenshot',{format:'png'});
        fs.writeFileSync(process.env.SCREENSHOT_PATH,Buffer.from(shot.data,'base64'));
    }
    await evaluate("puzzles.puzzle3.solved=true"); await object('tuer');
    await check("currentState===GameState.WON && !!document.getElementById('winScreen') && getBestTime()>0",'Gewinnbildschirm und Bestzeit');
    await click('#backToMenu'); await waitFor("location.pathname.endsWith('index.html') && document.readyState==='complete'");
    const best=await evaluate('localStorage.getItem("glitchBestTime")');
    await click('#startButton'); await waitFor("location.pathname.endsWith('room.html') && document.readyState==='complete'");
    await check('getSolvedCount()===0','Neustart löscht alten Rätselfortschritt');
    // Ablauf gezielt in Level 2 prüfen, ohne fünf Minuten Wartezeit.
    await evaluate("currentLevel=2;levelEndTime=Date.now()-1000;saveGameState();location.href='room2.html'");
    await waitFor("location.pathname.endsWith('room2.html') && !!document.getElementById('loseScreen')");
    await check("currentState===GameState.LOST && document.getElementById('timer').textContent==='00:00' && document.getElementById('puzzleArea').hidden",'Zeitablauf zeigt Niederlage und schliesst Rätsel');
    await cdp('Page.reload'); await waitFor("document.readyState==='complete' && !!document.getElementById('loseScreen')");
    console.log('PASS Niederlage bleibt nach Neuladen erhalten');
    assert.equal(await evaluate('localStorage.getItem("glitchBestTime")'),best);
    await click('#restartGame'); await waitFor("location.pathname.endsWith('room.html') && document.readyState==='complete'");
    await check('currentLevel===1 && getSolvedCount()===0 && getTimeLeft()>=295','Neustart nach Niederlage');
    assert.deepEqual(errors,[],'keine Browser- oder Konsolenfehler'); assert.deepEqual(failed,[],'keine fehlgeschlagenen Ressourcen');
    console.log('PASS keine Browserfehler oder fehlgeschlagenen Ressourcen');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(async()=>{
    if(ws?.readyState===1) ws.close();
    if(chrome) chrome.kill();
    server.closeAllConnections(); server.close();
    await pause(700);
    // Nur das eigens angelegte temporäre Chrome-Profil entfernen.
    if(profile.startsWith(path.join(os.tmpdir(),'glitch-ui-'))) {
        try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3});}catch{}
    }
});
