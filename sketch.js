Matter.use('matter-wrap');

let balls = [];
let pins = [];
let pillars = [];
let ground;
let world;
let effectController;

let spacing = 25;
let graphspacing = 8;

let distribution = new Array(800 / graphspacing + 1).fill(0);

let ballfilter = {
  'group': -1,
  'category': 2,
  'mask': 1,
}


let ballparams = {friction: 0, restitution: 0.2, density: 0.00095, slop:0, sleepThreshold: 2, frictionAir: 0.0, collisionFilter: ballfilter, label: "ball"} 

function setupGui() {
  effectController = {
		vgap: 19,
    hgap: 25,
    bounce: 0.2,
    row: 8,
    pegsize: 1
  };
	var h;
  var gui = new dat.GUI();

	//adjust height
  gui.add(effectController, "vgap").name("Vertical Gap").min(10).max(40).step(1).onFinishChange(()=>{
		vgap = effectController.vgap;
		movePins();
    moveGround();
	});
  gui.add(effectController, "bounce").name("Bounce").min(0).max(1).step(0.001).onFinishChange(()=>{
		ballparams.restitution = effectController.bounce
	});
  
  gui.add(effectController, "hgap").name("Horizontal Gap").min(20).max(40).step(1).onFinishChange(()=>{
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

function vecfield(x, y){
  x = (x - 400)/ spacing;
  y = (y - 100)/ spacing;
  dy = y;
  dx = x < 0 ? -(x * x) / 5: (x * x) / 5;
  return {x: dx * spacing, y: dy * spacing}
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
            balls.splice(index, 1)
          }
        });
      }
      if (bodyB.label == "ground"){
        Matter.World.remove(world, bodyA);
        balls.forEach((ball, index) => {
          if(ball.body == bodyA){
            distribution[Math.floor(bodyA.position.x / graphspacing)] += 1
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
    { x: 400, y: func(effectController.row + 2, 0).y, w: 800, h: 50, color: 'grey' },
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
    { x: 400, y: func(effectController.row + 2, 0).y, w: 800, h: 50, color: 'grey' },
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
  //console.log(distribution.std());
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