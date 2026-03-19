const S = {
  bOnline:false, bBooting:false, autoOff:15, autoOffTimer:null,
  olRph:23, olRpd:187, olTpm:1240, bvUsed:153,
  srvUptimes:{bob:0,ollama:0,n8n:0,rag:0,dash:0},
  chatHistory:[], bobTyping:false,
};

// Uptime counters
const srvStart = Date.now();
setInterval(()=>{
  const elapsed = Math.floor((Date.now()-srvStart)/1000);
  ['bob','ollama','n8n','rag','dash'].forEach(k => S.srvUptimes[k] = elapsed);
  updateUptimes();
},1000);

function fmtUptime(s){
  const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}`;
}
function updateUptimes(){
  ['bob','ollama','n8n','rag','dash'].forEach(k=>{
    const el=document.getElementById('srv-'+k+'-up');
    if(el) el.textContent=fmtUptime(S.srvUptimes[k]);
  });
}

// Stars
function spawnStars(id,n){
  const c=document.getElementById(id);
  for(let i=0;i<n;i++){
    const el=document.createElement('div'); el.className='star';
    const sz=1+Math.random()*2;
    el.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*65}%;--d:${2+Math.random()*3}s;--delay:${Math.random()*3}s`;
    c.appendChild(el);
  }
}
spawnStars('scene-a',18); spawnStars('scene-b',18);

// Clock
setInterval(()=>{ document.getElementById('clock').textContent=new Date().toTimeString().slice(0,8); },1000);
document.getElementById('clock').textContent=new Date().toTimeString().slice(0,8);

// Stats
function r(base,range){ return Math.max(0,Math.min(100,base+(Math.random()-.5)*range)); }
function setStatBar(vId,bId,val,suf,hi){
  const v=document.getElementById(vId),b=document.getElementById(bId);
  const isRed=val>85,isOr=val>70;
  v.textContent=val.toFixed(1)+suf;
  v.className='stat-val '+(isRed?'v-red':isOr?'v-orange':hi);
  b.style.width=val+'%';
  b.className='bar-fill '+(isRed?'b-red':isOr?'b-orange':(hi==='v-cyan'?'b-cyan':'b-green'));
}
function setTempStat(vId,bId,temp,max){
  const v=document.getElementById(vId),b=document.getElementById(bId);
  const pct=(temp/max)*100,isRed=temp>max*.85;
  v.textContent=temp.toFixed(0)+'°C';
  v.className='stat-val '+(isRed?'v-red':'v-orange');
  b.className='bar-fill '+(isRed?'b-red':'b-orange');
  b.style.width=Math.min(100,pct)+'%';
}
// ─── Coloca o IP do teu miniPC aqui ───────────────
const MINIPC_IP = "192.168.1.28";
const STATS_URL = `http://${MINIPC_IP}:9090/stats`;

async function updateA() {
  try {
    const res = await fetch(STATS_URL, { signal: AbortSignal.timeout(2000) });
    const d = await res.json();
    setStatBar('a-cpu','a-cpu-b', d.cpu, '%', 'v-cyan');
    setStatBar('a-ram','a-ram-b', d.ram, '%', 'v-green');
    setTempStat('a-temp','a-temp-b', d.temp, 90);
    setStatBar('a-disk','a-disk-b', d.disk, '%', 'v-cyan');
  } catch(e) {
    // Se a API não responder, mantém os valores anteriores
    console.warn('Stats API unreachable');
  }
}
function updateB(){
  if(!S.bOnline){
    ['b-cpu','b-ram','b-temp','b-disk'].forEach(id=>document.getElementById(id).textContent='--');
    ['b-cpu-b','b-ram-b','b-temp-b','b-disk-b'].forEach(id=>{document.getElementById(id).style.width='0%';});
    return;
  }
  setStatBar('b-cpu','b-cpu-b',r(48,30),'%','v-cyan');
  setStatBar('b-ram','b-ram-b',r(44,15),'%','v-green');
  setTempStat('b-temp','b-temp-b',r(68,14),95);
  setStatBar('b-disk','b-disk-b',r(43,3),'%','v-cyan');
}
function updateBridge(){
  const lat=document.getElementById('bridge-lat'),sub=document.getElementById('bridge-status');
  const p1=document.getElementById('pkt1'),p2=document.getElementById('pkt2');
  const hd=document.getElementById('h-lan-dot'),hl=document.getElementById('h-lan-lbl');
  if(S.bOnline){
    lat.textContent=(0.4+Math.random()*2.1).toFixed(1)+' ms'; sub.textContent='ATIVO';
    [p1,p2].forEach(p=>p.style.animationPlayState='running');
    hd.className='dot'; hl.textContent='LAN ONLINE';
  } else {
    lat.textContent='-- ms'; sub.textContent='STANDBY';
    [p1,p2].forEach(p=>p.style.animationPlayState='paused');
    hd.className='dot warn'; hl.textContent='NODE-B OFF';
  }
}
function updateAPI(){
  S.olRph=Math.min(100,S.olRph+(Math.random()>.65?1:0));
  S.olRpd=Math.min(1000,S.olRpd+(Math.random()>.75?1:0));
  S.olTpm=Math.round(r(1200,400));
  document.getElementById('ol-rph').textContent=S.olRph+' / 100';
  document.getElementById('ol-rph-b').style.width=S.olRph+'%';
  document.getElementById('ol-rpd').textContent=S.olRpd+' / 1000';
  document.getElementById('ol-rpd-b').style.width=(S.olRpd/10)+'%';
  document.getElementById('ol-tpm').textContent=S.olTpm.toLocaleString()+' / 10k';
  document.getElementById('ol-tpm-b').style.width=(S.olTpm/100)+'%';
  const now=new Date();
  const mLeft=60-now.getMinutes(),sLeft=60-now.getSeconds();
  document.getElementById('ol-rph-reset').textContent=`${mLeft}:${sLeft.toString().padStart(2,'0')}`;
  const nd=new Date(); nd.setHours(24,0,0,0); const diff=nd-now;
  const h=Math.floor(diff/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
  document.getElementById('ol-rpd-reset').textContent=`${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  S.bvUsed=Math.min(2000,S.bvUsed+(Math.random()>.88?1:0));
  const rem=2000-S.bvUsed;
  document.getElementById('bv-rpm').textContent=S.bvUsed+' / 2000';
  document.getElementById('bv-rpm-b').style.width=(S.bvUsed/20)+'%';
  document.getElementById('bv-remaining').textContent=rem.toLocaleString();
  const rps=Math.random()>.85?1:0;
  document.getElementById('bv-rps').textContent=rps+' / 1';
  document.getElementById('bv-rps-b').style.width=(rps*100)+'%';
}

// Robots
const rStates={a:'working',b:'chilling'};
function moveRobot(id){
  const el=document.getElementById('robot-'+id);
  const next=rStates[id]==='working'?'chilling':'working';
  el.className='robot walking '+(next==='working'?'robot-work':'robot-chill');
  setTimeout(()=>{ rStates[id]=next; el.className='robot '+(next==='working'?'robot-work working':'robot-chill chilling'); },2300);
}
function scheduleRobotA(){ setTimeout(()=>{moveRobot('a');scheduleRobotA();},7000+Math.random()*5000); }
function scheduleRobotB(){ if(!S.bOnline){setTimeout(scheduleRobotB,3000);return;} setTimeout(()=>{if(S.bOnline)moveRobot('b');scheduleRobotB();},9000+Math.random()*6000); }
scheduleRobotA(); scheduleRobotB();

// Wake on LAN
function wakeDesktop(){
  if(S.bBooting)return; S.bBooting=true;
  const btn=document.getElementById('wol-btn');
  btn.textContent='⚡ ENVIANDO MAGIC PACKET...'; btn.disabled=true;
  setTimeout(()=>{
    const ov=document.getElementById('b-overlay');
    ov.innerHTML=`<div class="overlay-title" style="color:var(--yellow);font-size:.9rem">INICIANDO...</div><div class="overlay-sub">POST CHECK</div><div class="boot-bar-track"><div class="boot-bar-fill" id="boot-bar" style="width:0%"></div></div>`;
    const badge=document.getElementById('b-badge');
    badge.className='badge'; badge.style.borderColor='var(--yellow)'; badge.style.color='var(--yellow)'; badge.textContent='BOOTING';
    let pct=0;
    const iv=setInterval(()=>{
      pct+=5+Math.random()*18;
      if(pct>=100){pct=100;clearInterval(iv);setTimeout(onDesktopOnline,400);}
      const bar=document.getElementById('boot-bar'); if(bar) bar.style.width=pct+'%';
    },350);
  },1800);
}
function onDesktopOnline(){
  S.bOnline=true; S.bBooting=false;
  document.getElementById('b-overlay').style.display='none';
  const btn=document.getElementById('wol-btn'); btn.textContent='✓ ONLINE'; btn.disabled=true;
  document.getElementById('off-btn').disabled=false;
  const badge=document.getElementById('b-badge'); badge.className='badge badge-online'; badge.style=''; badge.textContent='ONLINE';
  S.autoOff=15; document.getElementById('auto-off-badge').style.display='flex'; document.getElementById('auto-off-timer').textContent=S.autoOff;
  S.autoOffTimer=setInterval(()=>{ S.autoOff--; document.getElementById('auto-off-timer').textContent=S.autoOff; if(S.autoOff<=0){clearInterval(S.autoOffTimer);shutdownDesktop();}},60000);
  document.getElementById('robot-b').className='robot robot-work working'; rStates.b='working';
  updateBridge(); updateB();
}
function shutdownDesktop(){
  clearInterval(S.autoOffTimer); S.bOnline=false;
  const ov=document.getElementById('b-overlay'); ov.style.display='flex';
  ov.innerHTML=`<div class="overlay-title" style="color:var(--orange)">SLEEPING</div><div class="overlay-sub">WAKE-ON-LAN DISPONÍVEL</div>`;
  document.getElementById('wol-btn').disabled=false; document.getElementById('wol-btn').textContent='⚡ WAKE ON LAN';
  document.getElementById('off-btn').disabled=true; document.getElementById('auto-off-badge').style.display='none';
  const badge=document.getElementById('b-badge'); badge.className='badge badge-sleep'; badge.style=''; badge.textContent='SLEEPING';
  document.getElementById('robot-b').className='robot robot-chill chilling'; rStates.b='chilling';
  updateBridge(); updateB();
}

// ─── CHAT ─────────────────────────────────────────────────────
function nowStr(){ return new Date().toTimeString().slice(0,5); }

function buildSystemPrompt(){
  return `És o b0b, um agente AI autónomo do OpenClaw a correr no miniPC (NODE-A, Intel N100, 16GB RAM) do utilizador.
Conheces o estado actual do setup:

MÁQUINAS:
- NODE-A (miniPC): ONLINE · CPU ~32% · RAM ~60% · Temp ~52°C · Disco ~67%
- NODE-B (Desktop, Ryzen 7 / 32GB / RTX 3080): ${S.bOnline?'ONLINE · CPU ~48% · RAM ~44% · GPU ~68°C':'SLEEPING (Wake-on-LAN disponível na porta MAC broadcast)'}

SERVIDORES ACTIVOS NO NODE-A:
- OpenClaw b0b (:11434) — RUNNING
- Ollama API (:11435) — RUNNING  
- n8n Workflows (:5678) — IDLE
- RAG / Qdrant (:6333) — RUNNING
- AI Nexus Dashboard (:3000) — RUNNING
- Brave Search Proxy (:8080) — STOPPED

MODELOS OLLAMA:
- llama3.2:3b (2GB) — NODE-A — ACTIVO (és tu)
- nomic-embed-text (274MB) — NODE-A — ACTIVO
- mixtral:8x7b (26GB) — NODE-B — offline
- deepseek-r1:14b (9GB) — NODE-B — offline

LIMITES API HOJE:
- Ollama Cloud: ${S.olRph}/100 req/hora · ${S.olRpd}/1000 req/dia
- Brave Search: ${S.bvUsed}/2000 queries/mês (${2000-S.bvUsed} restantes)

Responde SEMPRE em Português de Portugal. 
Tens personalidade: és técnico, eficiente, um pouco sarcástico mas prestável.
Quando relevante, refere dados reais do sistema acima. 
Respostas curtas e directas (2-4 frases), excepto quando precisas de ser detalhado.
Podes sugerir acordar o desktop via WOL se o utilizador precisar de modelos grandes.`;
}

function addMessage(role,text){
  const container=document.getElementById('chat-messages');
  const isBot=role==='bob';
  const div=document.createElement('div');
  div.className='msg msg-'+(isBot?'bob':'user');
  div.innerHTML=`
    <div class="msg-avatar ${isBot?'av-bob':'av-user'}">${isBot?'🤖':'👤'}</div>
    <div>
      <div class="msg-bubble ${isBot?'bubble-bob':'bubble-user'}">${text.replace(/\n/g,'<br>')}</div>
      <div class="msg-time ${isBot?'msg-time-bob':'msg-time-user'}">${nowStr()}</div>
    </div>`;
  container.appendChild(div);
  container.scrollTop=container.scrollHeight;
}
function showTyping(){
  const c=document.getElementById('chat-messages');
  const div=document.createElement('div'); div.className='msg msg-bob'; div.id='typing-ind';
  div.innerHTML=`<div class="msg-avatar av-bob">🤖</div><div><div class="msg-bubble bubble-bob"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div></div>`;
  c.appendChild(div); c.scrollTop=c.scrollHeight;
}
function removeTyping(){ const el=document.getElementById('typing-ind'); if(el)el.remove(); }

async function sendMessage(){
  const input=document.getElementById('chat-input'),btn=document.getElementById('send-btn');
  const text=input.value.trim();
  if(!text||S.bobTyping)return;
  input.value=''; input.style.height='auto';
  addMessage('user',text);
  S.chatHistory.push({role:'user',content:text});
  S.bobTyping=true; btn.disabled=true; showTyping();
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1000,
        system:buildSystemPrompt(),
        messages:S.chatHistory.slice(-12),
      })
    });
    const data=await res.json();
    const reply=data.content?.[0]?.text||'Erro ao processar resposta.';
    removeTyping(); addMessage('bob',reply);
    S.chatHistory.push({role:'assistant',content:reply});
  }catch(err){
    removeTyping(); addMessage('bob','⚠ Erro de conexão com a API. Verifica a rede.');
  }
  S.bobTyping=false; btn.disabled=false;
  document.getElementById('chat-input').focus();
}
function handleKey(e){
  if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(); }
  setTimeout(()=>{ const el=document.getElementById('chat-input'); el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,90)+'px'; },0);
}

// Initial greeting
setTimeout(()=>{
  const g=`Olá! Sou o b0b, o teu agente OpenClaw no miniPC. 🤖\n\nEstou operacional — Ollama activo, RAG online, n8n em standby. O Desktop está a dormir, mas posso acordá-lo via WOL se precisares dos modelos grandes. Em que posso ajudar?`;
  addMessage('bob',g);
  S.chatHistory.push({role:'assistant',content:g});
},700);

// Init
updateA(); updateB(); updateAPI(); updateBridge();
setInterval(updateA,3000); setInterval(updateB,3000);
setInterval(updateAPI,5000); setInterval(updateBridge,4000);
setInterval(()=>{ document.querySelectorAll('.chest-light').forEach(el=>{ el.style.opacity=(.3+Math.random()*.7).toFixed(2); }); },1200);