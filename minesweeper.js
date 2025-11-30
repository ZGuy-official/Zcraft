/* minesweeper.js — minesweeper logic; integrates with main script via Game.spendCash / Game.addCash */

let minesState = null;

const DIFF = {
  easy:{w:8,h:8,b:10,cost:0,reward:2},
  normal:{w:10,h:10,b:18,cost:0,reward:3},
  hard:{w:12,h:12,b:30,cost:0,reward:5},
  veryhard:{w:14,h:14,b:45,cost:5,reward:7},
  insane:{w:16,h:16,b:70,cost:10,reward:10}
};

const minefieldEl = document.getElementById('minefield');
const mineInfoEl = document.getElementById('mineInfo');
const resetMineBtn = document.getElementById('resetMineBtn');

document.querySelectorAll('.difficulty .btn').forEach(b=>{
  b.addEventListener('click', ()=> startMines(b.dataset.diff));
});
resetMineBtn && resetMineBtn.addEventListener('click', resetMines);

function startMines(level){
  const cfg = DIFF[level];
  if(!cfg) return;
  if(cfg.cost > 0){
    if(!confirm(`Start ${level} and pay ${cfg.cost} cash?`)) return;
    if(!Game.spendCash(cfg.cost)){ alert('Not enough cash to start this difficulty.'); return; }
  }
  minesState = {
    w:cfg.w, h:cfg.h, bombs:cfg.b, reward:cfg.reward, board:[], revealed:[], flags:[], started:true
  };
  for(let y=0;y<cfg.h;y++){
    minesState.board[y]=[];
    minesState.revealed[y]=[];
    minesState.flags[y]=[];
    for(let x=0;x<cfg.w;x++){ minesState.board[y][x]=0; minesState.revealed[y][x]=false; minesState.flags[y][x]=false; }
  }
  // place bombs
  let placed=0;
  while(placed < cfg.b){
    const x = Math.floor(Math.random()*cfg.w);
    const y = Math.floor(Math.random()*cfg.h);
    if(minesState.board[y][x] === 'B') continue;
    minesState.board[y][x] = 'B'; placed++;
  }
  // numbers
  for(let y=0;y<cfg.h;y++){
    for(let x=0;x<cfg.w;x++){
      if(minesState.board[y][x] === 'B') continue;
      let count=0;
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
        const nx=x+dx, ny=y+dy;
        if(nx>=0 && nx<cfg.w && ny>=0 && ny<cfg.h && minesState.board[ny][nx] === 'B') count++;
      }
      minesState.board[y][x] = count;
    }
  }
  renderMinefield();
  mineInfoEl.textContent = `Difficulty ${level.toUpperCase()} — bombs: ${cfg.b} • reward on win: ${cfg.reward} cash`;
}

function resetMines(){ minesState = null; minefieldEl.innerHTML=''; mineInfoEl.textContent=''; }

function renderMinefield(){
  minefieldEl.innerHTML = '';
  if(!minesState) return;
  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.style.gridTemplateColumns = `repeat(${minesState.w}, auto)`;
  const cellSize = (minesState.w>12) ? 24 : 28;
  for(let y=0;y<minesState.h;y++){
    for(let x=0;x<minesState.w;x++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = cell.style.height = cellSize+'px';
      cell.dataset.x = x; cell.dataset.y = y;
      if(minesState.revealed[y][x]) cell.classList.add('revealed');
      if(minesState.flags[y][x]) cell.textContent = '🚩';
      if(minesState.revealed[y][x]){
        const val = minesState.board[y][x];
        if(val==='B'){ cell.textContent='💣'; cell.classList.add('bomb'); }
        else if(val>0) cell.textContent = val;
      }
      cell.oncontextmenu = (e)=>{ e.preventDefault(); toggleFlag(x,y); return false; };
      cell.onclick = ()=> revealCell(x,y);
      grid.appendChild(cell);
    }
  }
  minefieldEl.appendChild(grid);
}

function toggleFlag(x,y){
  if(!minesState || minesState.revealed[y][x]) return;
  minesState.flags[y][x] = !minesState.flags[y][x];
  renderMinefield();
}

function revealCell(x,y){
  if(!minesState) return;
  if(minesState.flags[y][x] || minesState.revealed[y][x]) return;
  if(minesState.board[y][x] === 'B'){
    // reveal all bombs — lose
    for(let yy=0;yy<minesState.h;yy++) for(let xx=0;xx<minesState.w;xx++){
      if(minesState.board[yy][xx]==='B') minesState.revealed[yy][xx]=true;
    }
    renderMinefield();
    alert('BOOM — you hit a bomb!');
    minesState = null;
    return;
  }
  floodReveal(x,y);
  renderMinefield();
  checkWin();
}

function floodReveal(x,y){
  const w=minesState.w,h=minesState.h;
  if(x<0||x>=w||y<0||y>=h) return;
  if(minesState.revealed[y][x]) return;
  minesState.revealed[y][x]=true;
  if(minesState.board[y][x]===0){
    for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
      const nx=x+dx, ny=y+dy;
      if(nx>=0 && nx<w && ny>=0 && ny<h) floodReveal(nx,ny);
    }
  }
}

function checkWin(){
  let unrevealed=0;
  for(let y=0;y<minesState.h;y++) for(let x=0;x<minesState.w;x++){
    if(!minesState.revealed[y][x]) unrevealed++;
  }
  if(unrevealed === minesState.bombs){
    Game.addCash(minesState.reward);
    alert(`You won! +${minesState.reward} cash awarded.`);
    // append a log entry via DOM
    const el = document.getElementById('craftedLog');
    const now = new Date().toLocaleTimeString();
    el.innerHTML = `[${now}] Minesweeper win +${minesState.reward} cash!<br/>` + el.innerHTML;
    minesState = null;
    renderMinefield();
  }
}
