// 俄羅斯方塊簡易版
// 只用原生 JS，無外部依賴

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const COLORS = [
  '', '#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fa0'
];
const SHAPES = [
  [],
  [[1,1,1,1]], // I
  [[2,2],[2,2]], // O
  [[0,3,0],[3,3,3]], // T
  [[0,4,4],[4,4,0]], // S
  [[5,5,0],[0,5,5]], // Z
  [[6,0,0],[6,6,6]], // J
  [[0,0,7],[7,7,7]]  // L
];

let tetrisBoard, tetrisCurrent, tetrisX, tetrisY, tetrisShape, tetrisColor, tetrisTimer, tetrisGameOver;

function showTetris() {
  document.querySelectorAll('.game-section').forEach(e => e.classList.remove('active'));
  document.getElementById('game-tetris').classList.add('active');
  resetTetris();
}

function resetTetris() {
  tetrisBoard = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  tetrisGameOver = false;
  nextTetris();
  drawTetris();
  if (tetrisTimer) clearInterval(tetrisTimer);
  tetrisTimer = setInterval(() => moveTetris(0,1), 400);
}

function nextTetris() {
  const id = Math.floor(Math.random()*7)+1;
  tetrisShape = SHAPES[id].map(row => row.slice());
  tetrisColor = id;
  tetrisX = 3;
  tetrisY = 0;
  if (!validTetris(tetrisX, tetrisY, tetrisShape)) {
    tetrisGameOver = true;
    clearInterval(tetrisTimer);
    document.getElementById('tetris-message').textContent = '遊戲結束！';
  }
}

function drawTetris() {
  const canvas = document.getElementById('tetris-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // 畫已落下的方塊
  for(let y=0;y<ROWS;y++){
    for(let x=0;x<COLS;x++){
      if(tetrisBoard[y][x]){
        ctx.fillStyle = COLORS[tetrisBoard[y][x]];
        ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
      }
    }
  }
  // 畫目前方塊
  for(let y=0;y<tetrisShape.length;y++){
    for(let x=0;x<tetrisShape[y].length;x++){
      if(tetrisShape[y][x]){
        ctx.fillStyle = COLORS[tetrisColor];
        ctx.fillRect((tetrisX+x)*BLOCK_SIZE, (tetrisY+y)*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
      }
    }
  }
}

function validTetris(nx, ny, shape) {
  for(let y=0;y<shape.length;y++){
    for(let x=0;x<shape[y].length;x++){
      if(shape[y][x]){
        let px = nx+x, py = ny+y;
        if(px<0||px>=COLS||py<0||py>=ROWS) return false;
        if(tetrisBoard[py][px]) return false;
      }
    }
  }
  return true;
}

function mergeTetris() {
  for(let y=0;y<tetrisShape.length;y++){
    for(let x=0;x<tetrisShape[y].length;x++){
      if(tetrisShape[y][x]){
        tetrisBoard[tetrisY+y][tetrisX+x]=tetrisColor;
      }
    }
  }
}

function clearTetrisLines() {
  for(let y=ROWS-1;y>=0;y--){
    if(tetrisBoard[y].every(v=>v)){
      tetrisBoard.splice(y,1);
      tetrisBoard.unshift(Array(COLS).fill(0));
      y++;
    }
  }
}

function moveTetris(dx,dy) {
  if(tetrisGameOver) return;
  if(validTetris(tetrisX+dx, tetrisY+dy, tetrisShape)){
    tetrisX+=dx; tetrisY+=dy;
  }else if(dy){
    mergeTetris();
    clearTetrisLines();
    nextTetris();
  }
  drawTetris();
}

function rotateTetris() {
  if(tetrisGameOver) return;
  const newShape = tetrisShape[0].map((_,i)=>tetrisShape.map(row=>row[i]).reverse());
  if(validTetris(tetrisX, tetrisY, newShape)){
    tetrisShape = newShape;
    drawTetris();
  }
}

document.addEventListener('keydown', function(e){
  if(!document.getElementById('game-tetris').classList.contains('active')) return;
  if(tetrisGameOver) return;
  if(e.key==='ArrowLeft') moveTetris(-1,0);
  if(e.key==='ArrowRight') moveTetris(1,0);
  if(e.key==='ArrowDown') moveTetris(0,1);
  if(e.key==='ArrowUp') rotateTetris();
});
