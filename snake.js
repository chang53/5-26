// 貪吃蛇遊戲
(function(){
  let canvas, ctx, snake, food, dir, nextDir, score, timer, over;
  const size = 20, w = 20, h = 20, speed = 120;

  function initSnake() {
    snake = [{x:10, y:10}];
    dir = 'right';
    nextDir = 'right';
    score = 0;
    over = false;
    placeFood();
  }
  function placeFood() {
    while (true) {
      food = {x: Math.floor(Math.random()*w), y: Math.floor(Math.random()*h)};
      if (!snake.some(s => s.x===food.x && s.y===food.y)) break;
    }
  }
  function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#4caf50';
    snake.forEach((s,i)=>{
      ctx.fillRect(s.x*size, s.y*size, size-2, size-2);
    });
    ctx.fillStyle = '#f44336';
    ctx.fillRect(food.x*size, food.y*size, size-2, size-2);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('分數: '+score, 8, 20);
    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,canvas.height/2-30,canvas.width,60);
      ctx.fillStyle = '#fff';
      ctx.font = '28px Arial';
      ctx.fillText('遊戲結束', canvas.width/2-60, canvas.height/2);
      ctx.font = '18px Arial';
      ctx.fillText('分數: '+score, canvas.width/2-30, canvas.height/2+28);
    }
  }
  function move() {
    if (over) return;
    dir = nextDir;
    const head = {x: snake[0].x, y: snake[0].y};
    if (dir==='left') head.x--;
    if (dir==='right') head.x++;
    if (dir==='up') head.y--;
    if (dir==='down') head.y++;
    if (head.x<0||head.x>=w||head.y<0||head.y>=h||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      
      clearInterval(timer);
      draw();
      return;
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }
  function key(e) {
    if (over && e.key==='Enter') {
      startSnake();
      return;
    }
    if (e.key==='ArrowLeft' && dir!=='right') nextDir='left';
    if (e.key==='ArrowRight' && dir!=='left') nextDir='right';
    if (e.key==='ArrowUp' && dir!=='down') nextDir='up';
    if (e.key==='ArrowDown' && dir!=='up') nextDir='down';
  }
  window.startSnake = function() {
    canvas = document.getElementById('snake-canvas');
    ctx = canvas.getContext('2d');
    initSnake();
    draw();
    clearInterval(timer);
    timer = setInterval(move, speed);
    document.addEventListener('keydown', key);
  };
  window.resetSnake = function() {
    startSnake();
  };
// RL agent (Q-learning) for Snake
window.startSnakeRL = function() {
  canvas = document.getElementById('snake-canvas');
  ctx = canvas.getContext('2d');
  let q = {}, alpha = 0.1, gamma = 0.9, epsilon = 0.1;
  let trainEpisodes = Infinity, maxSteps = Infinity, showEvery = 10;
  let bestScore = 0;
  function getState(snake, food, dir) {
    // 只用頭部與食物相對位置、危險方向、當前方向
    let head = snake[0];
    let fx = food.x - head.x;
    let fy = food.y - head.y;
    let danger = [0,0,0,0]; // left, right, up, down
    let dirs = ['left','right','up','down'];
    dirs.forEach((d,i)=>{
      let nx = head.x + (d==='left'?-1:d==='right'?1:0);
      let ny = head.y + (d==='up'?-1:d==='down'?1:0);
      if(nx<0||nx>=w||ny<0||ny>=h||snake.some(s=>s.x===nx&&s.y===ny)) danger[i]=1;
    });
    return [fx, fy, ...danger, dir].join(',');
  }
  function chooseAction(state) {
    if(Math.random()<epsilon) return ['left','right','up','down'][Math.floor(Math.random()*4)];
    let qs = q[state]||{};
    let best = -Infinity, bestA = 'left';
    ['left','right','up','down'].forEach(a=>{
      let v = qs[a]||0;
      if(v>best) {best=v;bestA=a;}
    });
    return bestA;
  }
  function setQ(state, action, value) {
    if(!q[state]) q[state]={};
    q[state][action]=value;
  }
  function getQ(state, action) {
    return (q[state]&&q[state][action])||0;
  }
  function cloneSnake(s) {
    return s.map(x=>({...x}));
  }
  function step(snake, food, dir, action) {
    let head = {...snake[0]};
    if(action==='left') head.x--;
    if(action==='right') head.x++;
    if(action==='up') head.y--;
    if(action==='down') head.y++;
    let dead = (head.x<0||head.x>=w||head.y<0||head.y>=h||snake.some(s=>s.x===head.x&&s.y===head.y));
    let ate = (head.x===food.x && head.y===food.y);
    let newSnake = [head,...snake];
    if(!ate) newSnake.pop();
    let newFood = {...food};
    if(ate) {
      while(true) {
        newFood = {x:Math.floor(Math.random()*w),y:Math.floor(Math.random()*h)};
        if(!newSnake.some(s=>s.x===newFood.x&&s.y===newFood.y)) break;
      }
    }
    return {newSnake, newFood, dead, ate};
  }
  function render(snake, food, score, over, episode) {
    ctx.fillStyle = '#222';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#4caf50';
    snake.forEach((s,i)=>{
      ctx.fillRect(s.x*size, s.y*size, size-2, size-2);
    });
    ctx.fillStyle = '#f44336';
    ctx.fillRect(food.x*size, food.y*size, size-2, size-2);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('分數: '+score, 8, 20);
    ctx.fillText('RL訓練中: 第'+episode+'回', 8, 40);
    if (over) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0,canvas.height/2-30,canvas.width,60);
      ctx.fillStyle = '#fff';
      ctx.font = '28px Arial';
      ctx.fillText('遊戲結束', canvas.width/2-60, canvas.height/2);
      ctx.font = '18px Arial';
      ctx.fillText('分數: '+score, canvas.width/2-30, canvas.height/2+28);
    }
  }
  // 訓練過程
  let episode = 1;
  function trainOneEpisode(cb) {
    let snake = [{x:10,y:10}], food = {x:Math.floor(Math.random()*w),y:Math.floor(Math.random()*h)};
    let dir = 'right', score = 0, over = false, steps = 0;
    function dist(a, b) {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    let prevDist = dist(snake[0], food);
    function loop() {
      if (over==true) { cb(score); return; } // 只有死亡時才結束
      let state = getState(snake, food, dir);
      let action = chooseAction(state);
      let {newSnake, newFood, dead, ate} = step(snake, food, dir, action);
      let newDist = dist(newSnake[0], newFood);
      let reward = 0;
      // 靠近食物加分，遠離扣分
      if (newDist < prevDist) reward += 1;
      else if (newDist > prevDist) reward -= 1;
      // 吃到食物再加分
      if (ate) reward += 10;
      // 撞牆扣分
      if (dead) {
        reward -= 10;
        over = true; // 確保只有死亡時結束
      }
      let nextState = getState(newSnake, newFood, action);
      let maxQ = Math.max(...['left','right','up','down'].map(a => getQ(nextState, a)));
      let oldQ = getQ(state, action);
      setQ(state, action, oldQ + alpha * (reward + gamma * maxQ - oldQ));
      snake = newSnake; food = newFood; dir = action;
      if (ate) score++;
      prevDist = newDist;
      if (episode % showEvery === 0) render(snake, food, score, over, episode);
      setTimeout(loop, episode % showEvery === 0 ? 30 : 1);
    }
    loop();
  }
  function train() {
    // 無限訓練模式，按F5或切換遊戲手動停止
    if(false) {
      ctx.fillStyle = '#fff';
      ctx.font = '22px Arial';
      ctx.fillText('訓練完成！最高分: '+bestScore, 80, 200);
      setTimeout(()=>playWithTrainedQ(q), 1000);
      return;
    }
    trainOneEpisode(function(score){
      if(score>bestScore) bestScore=score;
      episode++;
      train();
    });
  }
  function playWithTrainedQ(qtable) {
    let snake = [{x:10,y:10}], food = {x:Math.floor(Math.random()*w),y:Math.floor(Math.random()*h)};
    let dir = 'right', score = 0, over = false, steps = 0;
    function chooseBest(state) {
      let qs = qtable[state]||{};
      let best = -Infinity, bestA = 'left';
      ['left','right','up','down'].forEach(a=>{
        let v = qs[a]||0;
        if(v>best) {best=v;bestA=a;}
      });
      return bestA;
    }
    function loop() {
      if(over||steps>1000000) {
        render(snake, food, score, over, '展示');
        ctx.fillStyle = '#fff';
        ctx.font = '22px Arial';
        ctx.fillText('RL代理人遊戲結束！分數: '+score, 60, 240);
        return;
      }
      let state = getState(snake, food, dir);
      let action = chooseBest(state);
      let {newSnake, newFood, dead, ate} = step(snake, food, dir, action);
      snake = newSnake; food = newFood; dir = action;
      if(ate) score++;
      over = dead;
      steps++;
      render(snake, food, score, over, '展示');
      setTimeout(loop, 80);
    }
    loop();
  }
  train();
};
window.stopSnakeRL = function() {
  if (window.timer) {
    clearInterval(window.timer);
    window.timer = null;
    console.log('RL 訓練已停止');
  }
};
})();
