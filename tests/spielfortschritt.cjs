// Ohne npm-Abhängigkeiten: node tests/spielfortschritt.cjs (Chrome muss installiert sein).
const {spawn} = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pause = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'glitch-fortschritt-'));
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
    // Spielfortschritt über alle Levels: Freischaltung, Neustart eines Levels, Levelauswahl und Speicher.
    const level = page => `location.pathname.endsWith('${page}') && document.readyState==='complete' && typeof puzzles!=='undefined'`;
    const solve = () => evaluate("Object.keys(puzzles).forEach(id=>checkPuzzle(id,levelPuzzles[currentLevel][id])); updateDoor()");
    const loseNow = async () => { await evaluate("levelEndTime=Date.now()-1000; saveGameState()"); await waitFor("currentState===GameState.LOST && !!document.getElementById('loseScreen')"); };
    await cdp('Runtime.enable'); await cdp('Network.enable');
    await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await cdp('Page.navigate',{url:base+'/index.html'}); await waitFor("document.readyState==='complete' && !!document.getElementById('startButton')");
    await evaluate("localStorage.clear(); sessionStorage.clear()");
    await check("[...document.querySelectorAll('.level-buttons button')].filter(b=>b.disabled).length===maxLevels-1",'nur Level 1 ist zu Beginn frei');

    await click('#startButton'); await waitFor(level('room.html'));
    await solve(); await object('tuer'); await waitFor(level('room2.html'));
    await check("getUnlockedLevel()===2 && JSON.parse(localStorage.getItem('glitchProgress')).level1.puzzle3===true",'Level 2 freigeschaltet, Level 1 bleibt gespeichert');

    await evaluate("checkPuzzle('puzzle1', levelPuzzles[2].puzzle1)");
    await loseNow(); await click('#restartLevel'); await waitFor(level('room2.html') + " && currentState===GameState.PLAYING");
    await check("getSolvedCount()===0 && getTimeLeft()>=295 && gameStartTime!==null && !!JSON.parse(localStorage.getItem('glitchProgress')).level1",'Level-Neustart setzt nur Level 2 und den Timer zurück');

    await solve(); await object('tuer'); await waitFor(level('room3.html'));
    await check("currentLevel===3 && getUnlockedLevel()===3 && getSolvedCount()===0 && getTimeLeft()>=295",'Level 3 startet mit neuem Timer');
    await cdp('Page.navigate',{url:base+'/room2.html'}); await waitFor(level('room3.html'));
    console.log('PASS alte Levelseite führt zum aktuellen Level');

    await evaluate("checkPuzzle('puzzle2', levelPuzzles[3].puzzle2)");
    await loseNow(); await click('#restartLevel'); await waitFor(level('room3.html') + " && currentState===GameState.PLAYING");
    await check("getSolvedCount()===0 && !!JSON.parse(localStorage.getItem('glitchProgress')).level2",'Level-Neustart in Level 3 behält Level 2');

    await solve(); await object('tuer'); await waitFor(level('room4.html'));
    await check("currentLevel===4 && getUnlockedLevel()===4 && getSolvedCount()===0 && getTimeLeft()>=295",'Level 4 startet mit neuem Timer');
    await solve(); await object('tuer');
    await check("currentState===GameState.WON && runSeconds>0 && getBestTime()===runSeconds",'ganzer Durchgang ergibt eine Bestzeit');
    const best = await evaluate('getBestTime()');

    await click('#backToMenu'); await waitFor("location.pathname.endsWith('index.html') && document.readyState==='complete'");
    await check("[...document.querySelectorAll('.level-buttons button')].every(b=>!b.disabled)",'alle abgeschlossenen Levels in der Auswahl frei');
    await click('.level-buttons [data-level="2"]'); await waitFor(level('room2.html'));
    await check("getSolvedCount()===0 && gameStartTime===null && localStorage.getItem('glitchProgress')===null",'Start in Level 2 beginnt ohne alten Fortschritt');
    await solve(); await object('tuer'); await waitFor(level('room3.html'));
    await solve(); await object('tuer'); await waitFor(level('room4.html'));
    await solve(); await object('tuer');
    await check(`currentState===GameState.WON && runSeconds===null && getBestTime()===${best}`,'Start in Level 2 verändert die Bestzeit nicht');

    await click('#backToMenu'); await waitFor("location.pathname.endsWith('index.html') && document.readyState==='complete'");
    await click('.level-buttons [data-level="3"]'); await waitFor(level('room3.html'));
    await loseNow(); await click('#restartGame'); await waitFor(level('room.html'));
    await check("currentLevel===1 && getSolvedCount()===0 && getUnlockedLevel()===maxLevels",'Neues Spiel beginnt in Level 1, Freischaltung bleibt');

    // Inventar: Der Kontrollraum in Level 4 braucht die Zugangskarte aus dem Wartungsschacht.
    await check("loadInventory().length===0",'neues Spiel beginnt mit leerem Inventar');
    await cdp('Page.navigate',{url:base+'/index.html'}); await waitFor("document.readyState==='complete' && !!document.querySelector('.level-buttons')");
    await click('.level-buttons [data-level="4"]'); await waitFor(level('room4.html'));
    await check("document.getElementById('inventory').textContent.includes('Noch keine Gegenstände')",'Inventar im Raum sichtbar und leer');
    await object('kontrolle');
    await check("!document.getElementById('textInput') && document.querySelector('.puzzle-locked').textContent.includes('Zugangskarte')",'Kontrollraum braucht zuerst die Zugangskarte');
    await object('schacht'); await fill('#textInput','4'); await click('#textForm button');
    await check("hasItem('zugangskarte') && document.getElementById('inventory').textContent.includes('Zugangskarte') && document.getElementById('puzzleFeedback').textContent.includes('Gefunden')",'gefundene Zugangskarte erscheint im Inventar');
    await object('kontrolle');
    await check("!!document.getElementById('textInput')",'mit der Zugangskarte lässt sich der Kontrollraum öffnen');
    await cdp('Page.reload'); await waitFor(level('room4.html'));
    await check("hasItem('zugangskarte') && document.getElementById('inventory').textContent.includes('Zugangskarte')",'Inventar bleibt nach dem Neuladen');
    await loseNow(); await click('#restartLevel'); await waitFor(level('room4.html') + " && currentState===GameState.PLAYING");
    await check("!hasItem('zugangskarte') && getSolvedCount()===0",'Level-Neustart entfernt die Gegenstände dieses Levels');
    assert.deepEqual(errors,[],'keine Browser- oder Konsolenfehler'); assert.deepEqual(failed,[],'keine fehlgeschlagenen Ressourcen');
    console.log('PASS keine Browserfehler oder fehlgeschlagenen Ressourcen');
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(async()=>{
    if(ws?.readyState===1) ws.close();
    if(chrome) chrome.kill();
    server.closeAllConnections(); server.close();
    await pause(700);
    // Nur das eigens angelegte temporäre Chrome-Profil entfernen.
    if(profile.startsWith(path.join(os.tmpdir(),'glitch-fortschritt-'))) {
        try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3});}catch{}
    }
});

