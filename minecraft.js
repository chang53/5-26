// 超簡易 Minecraft 2D 版（沙盒方塊堆疊）
// 純前端、無外部依賴

const MC_WIDTH = 20;
const MC_HEIGHT = 15;
const MC_BLOCK_SIZE = 28;
const MC_BLOCKS = [
  {name:'空氣', color:'#bfefff'},
  {name:'泥土', color:'#a0522d'},
  {name:'草地', color:'#7cfc00'},
  {name:'石頭', color:'#888'},
  {name:'木頭', color:'#deb887'},
  {name:'樹葉', color:'#228b22'}
];
let mcWorld, mcSelect=1, mcCanvas, mcCtx;

function showMinecraft() {
  document.querySelectorAll('.game-section').forEach(e => e.classList.remove('active'));
  document.getElementById('game-minecraft').classList.add('active');
  resetMinecraft();
}

function resetMinecraft() {
  mcWorld = Array.from({length:MC_HEIGHT}, (_,y)=>
    Array.from({length:MC_WIDTH}, (_,x)=>
      y > MC_HEIGHT-4 ? (y===MC_HEIGHT-4?2:1) : 0
    )
  );
  drawMinecraft();
}

function drawMinecraft() {
  if(!mcCanvas) {
    mcCanvas = document.getElementById('minecraft-canvas');
    mcCtx = mcCanvas.getContext('2d');
  }
  mcCtx.clearRect(0,0,mcCanvas.width,mcCanvas.height);
  for(let y=0;y<MC_HEIGHT;y++){
    for(let x=0;x<MC_WIDTH;x++){
      mcCtx.fillStyle = MC_BLOCKS[mcWorld[y][x]].color;
      mcCtx.fillRect(x*MC_BLOCK_SIZE, y*MC_BLOCK_SIZE, MC_BLOCK_SIZE-1, MC_BLOCK_SIZE-1);
    }
  }
  // 畫選擇框
  mcCtx.strokeStyle = '#f00';
  mcCtx.lineWidth = 2;
  mcCtx.strokeRect(mcLastX*MC_BLOCK_SIZE, mcLastY*MC_BLOCK_SIZE, MC_BLOCK_SIZE, MC_BLOCK_SIZE);
}

let mcLastX=0, mcLastY=0;

function mcCanvasClick(e) {
  const rect = mcCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX-rect.left)/MC_BLOCK_SIZE);
  const y = Math.floor((e.clientY-rect.top)/MC_BLOCK_SIZE);
  mcLastX = x; mcLastY = y;
  // 左鍵放置，右鍵挖除
  if(e.button===0 && mcWorld[y][x]!==mcSelect) mcWorld[y][x]=mcSelect;
  if(e.button===2 && mcWorld[y][x]!==0) mcWorld[y][x]=0;
  drawMinecraft();
}

function mcSelectBlock(idx) {
  mcSelect = idx;
  document.getElementById('mc-selected').textContent = MC_BLOCKS[idx].name;
}

document.addEventListener('DOMContentLoaded',()=>{
  const canvas = document.getElementById('minecraft-canvas');
  if(canvas) {
    canvas.oncontextmenu = ()=>false;
    canvas.addEventListener('mousedown', mcCanvasClick);
  }
});
