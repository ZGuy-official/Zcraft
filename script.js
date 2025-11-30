/* script.js — main game logic for Z Craft (recipes, crafting, shop, persistence) */

const STARTERS = [
  {id:'Earth',emoji:'🌍'},
  {id:'Water',emoji:'💧'},
  {id:'Wind',emoji:'🌬️'},
  {id:'Light',emoji:'💡'},
  {id:'Fire',emoji:'🔥'},
];

const REC = {};
function key(a,b){ return [a,b].sort().join('+'); }
function add(a,b,out){
  REC[key(a,b)] = {id: out.id || out, emoji: out.emoji || out.emoji || '❓', desc: out.desc || `${a} + ${b} → ${out.id||out}`};
}

/* ===== core recipes (original + expanded) ===== */
add('Water','Wind',{id:'Cloud',emoji:'☁️'});
add('Cloud','Water',{id:'Rain',emoji:'🌧️'});
add('Fire','Earth',{id:'Lava',emoji:'🌋'});
add('Earth','Earth',{id:'Stone',emoji:'🪨'});
add('Earth','Water',{id:'Swamp',emoji:'🟩'});
add('Water','Light',{id:'Life',emoji:'🌱'});
add('Wind','Light',{id:'Atmosphere',emoji:'🌫️'});
add('Light','Earth',{id:'Aura',emoji:'✨'});
add('Wind','Cloud',{id:'Thunder',emoji:'⚡'});
add('Fire','Wind',{id:'Smoke',emoji:'💨'});
add('Swamp','Life',{id:'Crocodile',emoji:'🐊'});
add('Life','Earth',{id:'Human',emoji:'🧑'});
add('Human','Crocodile',{id:'Crocs',emoji:'👞'});
add('Stone','Fire',{id:'Metal',emoji:'🛠️'});
add('Stone','Water',{id:'Boat',emoji:'🛶'});
add('Boat','Metal',{id:'Ship',emoji:'🚢'});
add('Human','Stone',{id:'House',emoji:'🏠'});
add('House','House',{id:'Village',emoji:'🏘️'});
add('Village','Technology',{id:'City',emoji:'🏙️'});
add('Light','Metal',{id:'Lamp',emoji:'🪔'});
add('Metal','Light',{id:'Phone',emoji:'📱'});
add('Phone','Metal',{id:'Tablet',emoji:'📲'});
add('Technology','Human',{id:'Social Media',emoji:'🌐'});
add('Social Media','Technology',{id:'YouTube Channel',emoji:'▶️'});
add('YouTube Channel','Human',{id:'Z Guy Channel',emoji:'🧑‍💻'});
add('Metal','Technology',{id:'Factory',emoji:'🏭'});
add('Factory','Chocolate',{id:'Chocolate Factory',emoji:'🍫🏭'});
add('Chocolate','Factory',{id:'Willy Wonka',emoji:'🍫👨‍🍳'});
add('Sand','Water',{id:'Beach',emoji:'🏖️'});
add('Metal','Light',{id:'Technology',emoji:'🖥️'});

/* ===== additional expanded recipes from previous message ===== */
/* Nature */
add('Earth','Rain',{id:'Plant',emoji:'🌿'});
add('Plant','Time',{id:'Tree',emoji:'🌳'});
add('Tree','Tree',{id:'Forest',emoji:'🌲'});
add('Forest','Fire',{id:'Charcoal',emoji:'⚫'});
add('Rain','Light',{id:'Rainbow',emoji:'🌈'});
add('Earth','Pressure',{id:'Mountain',emoji:'⛰️'});
add('Mountain','Wind',{id:'Canyon',emoji:'🏞️'});
add('Lava','Water',{id:'Obsidian',emoji:'🪨'});
add('Obsidian','Time',{id:'Crystal',emoji:'💎'});

/* Animals */
add('Life','Swamp',{id:'Frog',emoji:'🐸'});
add('Life','Wind',{id:'Bird',emoji:'🐦'});
add('Bird','Thunder',{id:'Thunder Bird',emoji:'🦅⚡'});
add('Life','Water',{id:'Fish',emoji:'🐟'});
add('Fish','Time',{id:'Shark',emoji:'🦈'});
add('Bird','Human',{id:'Pet',emoji:'🐕'});

/* Human progression */
add('Human','Tree',{id:'Wood',emoji:'🪵'});
add('Wood','Fire',{id:'Coal',emoji:'🧱'});
add('Wood','Stone',{id:'Tools',emoji:'🪚'});
add('Tools','Metal',{id:'Machine',emoji:'⚙️'});
add('Machine','Light',{id:'Electricity',emoji:'⚡'});
add('Electricity','Machine',{id:'Robot',emoji:'🤖'});
add('Robot','Human',{id:'Cyborg',emoji:'🦾'});
add('House','Tools',{id:'Workshop',emoji:'🏚️'});
add('Workshop','Metal',{id:'Garage',emoji:'🏗️'});
add('Garage','Machine',{id:'Car',emoji:'🚗'});
add('Car','Electricity',{id:'Electric Car',emoji:'🔌🚗'});

/* Technology */
add('Electricity','Metal',{id:'Technology',emoji:'🖥️'});
add('Technology','Technology',{id:'Advanced Tech',emoji:'🧬'});
add('Advanced Tech','Light',{id:'Laser',emoji:'🔦'});
add('Laser','Metal',{id:'Laser Sword',emoji:'⚔️'});
add('Technology','Tools',{id:'Computer',emoji:'💻'});
add('Computer','Atmosphere',{id:'Internet',emoji:'🌐'});
add('Internet','Light',{id:'Website',emoji:'🕸️'});
add('Website','Life',{id:'Social Media 2',emoji:'📡'});
add('Website','Tools',{id:'YouTube 2',emoji:'▶️'});
add('YouTube 2','Human',{id:'Creator',emoji:'🎥'});

/* Weather / planets */
add('Atmosphere','Light',{id:'Sky',emoji:'🌌'});
add('Sky','Cloud',{id:'Weather',emoji:'🌦️'});
add('Lava','Pressure',{id:'Volcano',emoji:'🌋'});
add('Earth','Atmosphere',{id:'Planet',emoji:'🪐'});
add('Planet','Light',{id:'Solar System',emoji:'🌞'});

/* ===== Persistence & state ===== */
const LS_KEY = 'zcraft_v2';
let state = {
  username: null,
  cash: 0,
  inventory: {}, // itemId -> count
  selected: [],
};
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); updateUI(); }
function loadState(){
  const s = localStorage.getItem(LS_KEY);
  if(s) Object.assign(state, JSON.parse(s));
}
loadState();

/* ===== UI elements ===== */
const startersEl = document.getElementById('starters');
const inventoryEl = document.getElementById('inventory');
const messageEl = document.getElementById('message');
const cashEl = document.getElementById('cashAmount');
const usernameDisplay = document.getElementById('usernameDisplay');
const selectedList = document.getElementById('selectedList');
const craftedLog = document.getElementById('craftedLog');
const overlay = document.getElementById('overlay');
const usernameInput = document.getElementById('usernameInput');
const startBtn = document.getElementById('startBtn');
const guestBtn = document.getElementById('guestBtn');

startBtn && startBtn.addEventListener('click', ()=> {
  const v = usernameInput.value.trim();
  if(!v){ alert('Enter a username or press Play as Guest'); return; }
  state.username = v;
  localStorage.setItem('zcraft_cookies_accepted','true');
  saveState();
  overlay.classList.add('hidden');
});
guestBtn && guestBtn.addEventListener('click', ()=> {
  overlay.classList.add('hidden');
  message('Playing as Guest — progress will still save unless you clear storage.');
});

function message(text){ messageEl.textContent = text; setTimeout(()=>{ if(messageEl.textContent===text) messageEl.textContent=''; },3000); }

/* ===== UI rendering ===== */
function updateUI(){
  usernameDisplay.textContent = state.username || 'Guest';
  cashEl.textContent = state.cash;
  startersEl.innerHTML = '';
  STARTERS.forEach(s => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `${s.emoji} <strong>${s.id}</strong>`;
    div.onclick = ()=>selectItem(s.id);
    startersEl.appendChild(div);
  });

  inventoryEl.innerHTML = '';
  const keys = Object.keys(state.inventory);
  if(keys.length===0) inventoryEl.innerHTML = '<div class="smallmuted">No items yet — craft something!</div>';
  keys.forEach(k=>{
    const c = state.inventory[k];
    if(c<=0) return;
    const itm = getItemInfo(k);
    const div = document.createElement('div');
    div.className = 'item';
    div.id = 'inv-'+k;
    div.innerHTML = `${itm.emoji} <strong>${k}</strong> <span style="opacity:0.7;margin-left:8px">x${c}</span>`;
    div.onclick = ()=>selectItem(k);
    inventoryEl.appendChild(div);
  });

  // selected
  selectedList.innerHTML = '';
  state.selected.forEach((s, idx)=>{
    const itm = getItemInfo(s);
    const b = document.createElement('div');
    b.className = 'item selected';
    b.style.display='inline-flex';
    b.style.marginRight='8px';
    b.innerHTML = `${itm.emoji} <strong>${s}</strong> <button style="margin-left:8px" onclick="Game.deselect(${idx})">✖</button>`;
    selectedList.appendChild(b);
  });

  craftedLog.innerHTML = craftedLog.innerHTML; // no-op but keep block
  cashEl.textContent = state.cash;
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ===== helpers ===== */
function getItemInfo(id){
  const s = STARTERS.find(x=>x.id===id);
  if(s) return s;
  for(const k in REC) if(REC[k].id === id) return {id:id, emoji:REC[k].emoji || '❓'};
  if(id==='Chocolate') return {id:'Chocolate',emoji:'🍫'};
  if(id==='Sand') return {id:'Sand',emoji:'🏖️'};
  return {id:id,emoji:'❓'};
}

/* ===== selection & crafting ===== */
function selectItem(id){
  if(state.selected.length>=2) state.selected=[];
  state.selected.push(id);
  if(state.selected.length===2){
    attemptCraft(state.selected[0], state.selected[1]);
    state.selected=[];
  }
  saveState();
  updateUI();
}
function deselect(idx){ state.selected.splice(idx,1); updateUI(); }

function attemptCraft(a,b){
  // try recipe
  const recipe = REC[key(a,b)];
  if(recipe){
    addToInventory(recipe.id,1);
    addCash(5); // +5 cash per successful craft (as requested)
    appendLog(`Crafted ${recipe.emoji} ${recipe.id} (+5 cash)`);
    updateUI(); return;
  }
  // special handling for Chocolate and Sand
  if(a==='Chocolate' || b==='Chocolate'){
    if((state.inventory['Chocolate']||0) <= 0){
      message('You need to buy Chocolate first from the shop.');
      return;
    }
    // choose a random other owned item (excluding Chocolate)
    const pool = Object.keys(state.inventory).filter(x=>x!=='Chocolate' && state.inventory[x]>0);
    if(pool.length===0){ message('Buy/own another item to combine with Chocolate.'); return; }
    const rand = pool[Math.floor(Math.random()*pool.length)];
    // 50/50 produce Chocolate Factory or Willy Wonka
    const result = Math.random() < 0.5 ? {id:'Chocolate Factory',emoji:'🍫🏭'} : {id:'Willy Wonka',emoji:'🍫👨‍🍳'};
    addToInventory(result.id,1); addCash(5); appendLog(`Crafted ${result.emoji} ${result.id} (+5 cash)`);
    return;
  }
  if(a==='Sand' || b==='Sand'){
    if((state.inventory['Sand']||0) <= 0){
      message('You need to buy Sand first from the shop.');
      return;
    }
    const pool = Object.keys(state.inventory).filter(x=>x!=='Sand' && state.inventory[x]>0);
    if(pool.length===0){ message('Buy/own another item to combine with Sand.'); return; }
    const rand = pool[Math.floor(Math.random()*pool.length)];
    const result = {id:'Beach',emoji:'🏖️'};
    addToInventory(result.id,1); addCash(5); appendLog(`Crafted ${result.emoji} ${result.id} (+5 cash)`);
    return;
  }

  message(`No recipe for ${a} + ${b}. Try other combinations.`);
}

/* ===== inventory & cash ===== */
function addToInventory(id,amount=1){
  state.inventory[id] = (state.inventory[id]||0) + amount;
  saveState();
}
function addCash(n){ state.cash += n; saveState(); }
function spendCash(n){
  if(state.cash < n) return false;
  state.cash -= n; saveState(); return true;
}

/* ===== shop ===== */
function buy(item,price){
  if(!spendCash(price)){ message('Not enough cash.'); return; }
  addToInventory(item,1);
  appendLog(`Bought ${item} (-${price} cash)`);
  saveState(); updateUI();
}

/* ===== logs & UI helpers ===== */
function appendLog(text){
  const now = new Date().toLocaleTimeString();
  const el = document.getElementById('craftedLog');
  el.innerHTML = `[${now}] ${text}<br/>` + el.innerHTML;
}

/* ===== initialize ===== */
if(!localStorage.getItem('zcraft_cookies_accepted')){
  overlay.classList.remove('hidden');
} else {
  overlay.classList.add('hidden');
}
updateUI();

/* ===== Expose some functions globally for inline onclicks and minesweeper integration ===== */
window.Game = {
  buy: buy,
  selectItem: selectItem,
  deselect: deselect,
  attemptCraft: attemptCraft,
  addCash: addCash,
  spendCash: spendCash,
  getState: ()=>state
};
