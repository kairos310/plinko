Matter.use('matter-wrap');

let balls = [];
let pins = [];
let pillars = [];
let ground;
let world;
let gui;
let effectController;
let best = {'loss': 1, 'row': 15, 'col': 15, 'size': 1};
let spacing = 25;
let graphspacing = 8;

let distribution = new Array(800 / graphspacing + 1).fill(0);
let balltotal = [];
let convolve = new Array(800/ graphspacing - 1).fill(0);

Array.prototype.mean = function () {
  // Check if the array is empty
  if (this.length === 0) {
    return NaN; // There's no standard deviation for an empty array
  }
  //Normalize array
  const max = Math.max(...distribution);
  //let arr = this.map((x) => x / max);
  // Calculate the mean (average) of the elements in the array
  const mean = this.reduce((sum, value) => sum + value, 0) / this.length;

  return mean;
};

Array.prototype.stddev = function () {
  // Calculate the mean (average) of the elements in the array
  const mean = this.mean()

  // Calculate the sum of the squared differences between each element and the mean
  const squaredDifferencesSum = this.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);

  // Calculate the variance (average of the squared differences)
  const variance = squaredDifferencesSum / this.length;

  // Calculate the standard deviation (square root of the variance)
  const standardDeviation = Math.sqrt(variance);

  return standardDeviation;
};

Array.prototype.variance = function () {
  // Calculate the mean (average) of the elements in the array
  const mean = this.mean()

  // Calculate the sum of the squared differences between each element and the mean
  //const crossEntropy = this.reduce((sum, value) => sum + (-value * Math.log(mean) + (1 - value) * Math.log(1 - mean)), 0);
  const squaredDifferencesSum = this.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);

  // Calculate the variance (average of the squared differences)
  const variance = squaredDifferencesSum / this.length;

  return variance;
};

Array.prototype.convolve = function (kernel) {
  const result = [];
  const kernelSize = kernel.length;
  const inputSize = this.length;

  // Loop through the input signal
  for (let i = 0; i < inputSize; i++) {
    let sum = 0;

    // Perform the convolution
    for (let j = 0; j < kernelSize; j++) {
      // Handle edge cases where the kernel goes beyond the input signal
      const inputValue = i - j >= 0 && i - j < inputSize ? this[i - j] : 0;
      sum += inputValue * kernel[j];
    }

    result.push(sum);
  }
  return result;
};

Array.prototype.log = function () {
  let result = [];
  this.forEach(val => {
    result.push(Math.log2(val));
  });
  return result;
};

let ballfilter = {
  'group': -1,
  'category': 2,
  'mask': 1,
}

let ballparams = {
  friction: 0, 
  restitution: 0.2, 
  density: 0.00095, 
  slop:0, 
  sleepThreshold: 2, 
  frictionAir: 0.0, 
  collisionFilter: ballfilter, 
  label: "ball"
} 

function setupGui() {
  effectController = {
		vgap: 19,
    hgap: 25,
    bounce: 0.2,
    row: 20,
    pegsize: 1
  };
	var h;
  gui = new dat.GUI();

	//adjust height
  gui.add(effectController, "vgap").name("Vertical Gap").min(15).max(30).step(0.1).onFinishChange(()=>{
		vgap = effectController.vgap;
		movePins();
    moveGround();
	});
  gui.add(effectController, "bounce").name("Bounce").min(0).max(1).step(0.001).onFinishChange(()=>{
		ballparams.restitution = effectController.bounce
	});
  
  gui.add(effectController, "hgap").name("Horizontal Gap").min(15).max(30).step(0.1).onFinishChange(()=>{
		spacing = effectController.hgap
		movePins();
	});
  
  gui.add(effectController, "row").name("Rows").min(5).max(30).step(1).onFinishChange(()=>{
		spacing = effectController.hgap
		movePins();
    moveGround();
	});
  
  gui.add(effectController, "pegsize").name("Peg Size (ratio to pellet)").min(0.05).max(2).step(0.05).onFinishChange(()=>{
		movePins();
	});
}

function func(i, j){
  var dx, dy, rot, w, h;
  x = 400 - i * spacing/2 + j * spacing;
  y = 100 + i * effectController.vgap;
  //let vec = vecfield(x, y);
  w = 10;
  h = 10;
  rot = PI/4;

  return {
    x: x, 
    y: y,
    w: w,
    h: h, 
    rot: rot,
  }
}

function clearBalls(){
  Matter.Composite.clear(world, keepStatic=true)
  balls = []
  
  distribution = new Array(Math.floor(800 / graphspacing) + 1).fill(0);
  balltotal = []
}



function setup() {
  const canvas = createCanvas(800, 800);
  //translate(400,400)

  // create an engine
  const engine = Matter.Engine.create();
  
  world = engine.world;
  
  
  Matter.Events.on(engine, 'collisionStart', ({pairs}) => {
    pairs.forEach(({bodyA, bodyB}) => {
      if (bodyA.label == "ground"){
        Matter.World.remove(world, bodyB);
        balls.forEach((ball, index) => {
          if(ball.body == bodyB){
            distribution[Math.floor(bodyB.position.x / graphspacing)] += 1 
            balltotal.push(Math.floor(bodyB.position.x / graphspacing))
            balls.splice(index, 1)
          }
        });
      }
      if (bodyB.label == "ground"){
        Matter.World.remove(world, bodyA);
        balls.forEach((ball, index) => {
          if(ball.body == bodyA){
            distribution[Math.floor(bodyA.position.x / graphspacing)] += 1
            balltotal.push(Math.floor(bodyA.position.x / graphspacing))
            balls.splice(index, 1)
          }
        });
      }
    });
  });

  setupGui()
  // config wrap area
  const wrap = {
    min: { x: 0, y: 0 },
    max: { x: width, y: height }
  };

  // create balls
  for (let i = 0; i < 200; i++) {
    let newBall = new Ball(world,
      { x: 400 + i / 400 * spacing - 1/2 * spacing, y: 50, r: 4, color: 'grey' },
      ballparams
    );
    balls.push(newBall);
  }

  // static line
  ground = new Block(world,
    { x: 400, y: func(effectController.row + 4, 0).y, w: 800, h: 50, color: 'grey' },
    { isStatic: true , label: "ground"}
  );

  for (let i = 0; i < effectController.row; i++){
    pins.push([])
    for (let j = -15; j <= i + 15; j++){
      var config = func(i, j);
      let pin = new Ball(world,
        {x: config.x, y: config.y, r: config.w /2, color: 'white'},
        { isStatic: true}
        )
      pins[i].push(pin);
    }
  }

  // setup mouse
  mouse = new Mouse(engine, canvas);

  // run the engine
  Matter.Runner.run(engine);
}

function movePins(){
  pins.forEach(row => {
      row.forEach(pin => {
      Matter.World.remove(world, pin.body);
    })
  });
  pins = []

  for (let i = 0; i < effectController.row; i++){
    pins.push([])
    for (let j = -15; j <= 15 + i; j++){
      var config = func(i, j);
      let pin = new Ball(world,
        {x: config.x, y: config.y, r: 4 * effectController.pegsize, color: 'white'},
        { isStatic: true}
        )
      pins[i].push(pin);
    }
  }
}

function moveGround(){
  Matter.World.remove(world, ground.body);
  ground = new Block(world,
    { x: 400, y: func(effectController.row + 4, 0).y, w: 800, h: 50, color: 'grey' },
    { isStatic: true , label: "ground"}
  );
}

function graph(){
  let prev = distribution[0];
  let max = Math.max(...distribution);
  distribution.forEach((val, i) => {
    stroke(255,0,0)
    line(i * graphspacing, 800 - prev/ max * 500, (i + 1) * graphspacing, 800 - val/ max * 500)
    prev = val;
  });
  let filtered = distribution.convolve(new Array(9).fill(1/9))
  filtered.forEach((val, i) => {
    stroke(0,255,0)
    line(i * graphspacing, 800 - prev/ max * 500, (i + 1) * graphspacing, 800 - val/ max * 500)
    prev = val;
  });
  let step = 800 / losses.length
  let temp = 1;
  losses.forEach((val, i)=>{
    stroke(0,255,255);
    val = isNaN(val) ? 1 : val; 
    line(i * step, 800 - 300 * temp, step * (i + 1), 800 - 300 * val)
    temp = val;
  })
  let mean = balltotal.mean(); 
  stroke(255,100,255)
  line(mean * 8, 450, mean * 8, 550)
  let stddev = balltotal.stddev()
  line(mean * 8 - stddev * 8, 500, mean * 8 +  stddev * 8, 500)

  document.getElementById("stddev").innerText = distribution.stddev() + " \n " + distribution.variance() + "\nStandard Deviation:" + stddev + "\nLoss: " + (28.86 - stddev)*(28.86 - stddev)/(28.86 * 28.86) + "\n Best: \nCol: " + best.col + "\nRow: " + best.row + "\n Size:  " + best.size;
}

function draw() {
  background(0);

  ground.draw();
  
  for (let b of balls) {
    b.draw();
  }

  for( let r of pins){
    for( let c of r){
      c.draw();
    }
  }
  
  for (let p of pillars){
    p.draw();
  }

  graph()

  fill(0,255,0);
  let origin = func(0, 0);
  circle(origin.x, origin.y, 10);
  
  mouse.draw();
}

function mousePressed(){
  for (let i = 0; i < 100; i++) {
    let newBall = new Ball(world,
      { x: 400 + 1/2 * random(-spacing, spacing), y: 50, r: 5, color: 'grey' },
      ballparams
    );
    balls.push(newBall);
  }
}


function finished() {
  let i = 0;
  return new Promise((resolve) => {
    setTimeout(function a(){
      if(balltotal.length > 95 || i > 100){
          resolve()
          return 
      }
      setTimeout(a, 60);
      //console.log(i)
      i++
    },100)
  });
}

function clip(val, min, max){
  if(val > max){
    return max;
  }else if(val < min){
    return min;
  }
  return val;
}

const run_sim = async function (input) {
  row = input[0] * 15 + 15
  col = input[1] * 15 + 15
  size = input[2] * 1.2 + 0.2
  effectController.vgap = row
  vgap = effectController.vgap;
  gui.__controllers[0].setValue(row);
  effectController.hgap = col
  spacing = effectController.hgap
  gui.__controllers[2].setValue(col);
  effectController.pegsize = size;
  gui.__controllers[4].setValue(size);
  movePins();
  moveGround();
  
  clearBalls()
  mousePressed()

  const f = await finished();

  let stddev = balltotal.stddev()
  let loss = (28.86 - stddev)*(28.86 - stddev)/(28.86 * 28.86);
  losses.push(loss)
  if(loss < best.loss){
    best.loss = loss;
    best.row = row;
    best.col = col;
    best.size = size;
  }
  return loss;
};

