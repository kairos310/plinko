Matter.use('matter-wrap');

let balls = [];
let pins = [];
let pillars = [];
let ground;
let world;
let effectController;
let distribution = new Array(33).fill(0);

let spacing = 25;

let ballfilter = {
  'group': -1,
  'category': 2,
  'mask': 1,
}


let ballparams = {friction: 0, restitution: 0.2, density: 0.00001, slop:0, sleepThreshold: 2, frictionAir: 0.0, collisionFilter: ballfilter, label: "ball"} 

function setupGui() {
  effectController = {
		vgap: 0.75,
    hgap: 25,
    bounce: 0.2
  };
	var h;
  var gui = new dat.GUI();

	//adjust height
  gui.add(effectController, "vgap").name("Vertical Gap").min(0.25).max(1).step(0.001).onFinishChange(()=>{
		vgap = effectController.vgap;
		movePins();
	});
  gui.add(effectController, "bounce").name("Bounce").min(0).max(1).step(0.001).onFinishChange(()=>{
		ballparams.restitution = effectController.bounce
	});
  
  gui.add(effectController, "hgap").name("Horizontal Gap").min(20).max(40).step(1).onFinishChange(()=>{
		spacing = effectController.hgap
		movePins();
	});
}


function func(i, j){
  j = j - 15
  var dx, dy, rot, w, h;
  x = 400 + spacing / 2 - i * spacing/2 + j * spacing, 
  y = 100 + i * spacing * effectController.vgap, 
  w = 10
  h = 10
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
  
  distribution = new Array(Math.floor(800 / spacing) + 1).fill(0);
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
            distribution[Math.floor(bodyB.position.x / spacing)] += 1 
            balls.splice(index, 1)
          }
        });
      }
      if (bodyB.label == "ground"){
        Matter.World.remove(world, bodyA);
        balls.forEach((ball, index) => {
          if(ball.body == bodyA){
            distribution[Math.floor(bodyA.position.x / spacing)] += 1
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
  for (let i = 0; i < 400; i++) {
    let newBall = new Ball(world,
      { x: 400 + i / 400 * spacing - 1/2 * spacing, y: 50, r: 5, color: 'grey' },
      ballparams
    );
    balls.push(newBall);
  }

  // static line
  ground = new Block(world,
    { x: 400, y: 800, w: 800, h: 50, color: 'grey' },
    { isStatic: true , label: "ground"}
  );
  /*
  for ( let i = 0; i < 32; i ++){
    let pillar = new Block(world,
      { x: i * 25, y: 690, w: 2, h: 200, color: 'white'},
      {isStatic: true}
    )
    pillars.push(pillar)
  }
  */
  for (let i = 0; i < 20; i++){
    pins.push([])
    for (let j = 0; j < i + 30 ; j++){
      var config = func(i, j);
      let pin = new Ball(world,
        {x: config.x, y: config.y, r: config.w /2, color: 'white'},
        { isStatic: true}
        )
        
       /*
      let pin = new Block(world,
        { x: - i * 12.5 + j * 25, y: 100 + i * 25 * 0.866, w:6, h:6, color: 'white' },
        //{ x:j * 25, y: 100 + i * 25 * 0.866, r:2, color: 'white' },
        { isStatic: true, angle: PI/4}
        //{isStatic: true, angle: PI/ 2 + (j - 15) * 0.1}
        )
        */
       /*
      var config = func(i, j)
      let pin = new Block(world,
        { x: config.x, y: config.y, w: config.w, h: config.h, color: 'white'},
        //{ x:j * 25, y: 100 + i * 25 * 0.866, r:2, color: 'white' },
        { isStatic: true, angle: config.rot}
        //{isStatic: true, angle: PI/ 2 + (j - 15) * 0.1}
        )
        /*
      let pin = new Ball(world,
        { x: randomGaussian(400, 200), y: randomGaussian(300, 100), r:2, color: 'white' },
        //{ x:j * 25, y: 100 + i * 25 * 0.866, r:2, color: 'white' },
        { isStatic: true, angle: PI/4}
        //{isStatic: true, angle: PI/ 2 + (j - 15) * 0.1}
        )*/
      pins[i].push(pin);
    }
  }

  // setup mouse
  mouse = new Mouse(engine, canvas);

  // run the engine
  Matter.Runner.run(engine);
}

function movePins(){

  for (let i = 0; i < 20; i++){
    for (let j = 0; j < i + 30 ; j++){
      let config = func(i, j);
      let vec = Matter.Vector.create(config.x, config.y);
      Matter.Body.setPosition(pins[i][j].body, vec);
    }
  }
}

function graph(){
  let prev = distribution[0];
  let max = Math.max(...distribution);
  distribution.forEach((val, i) => {
    stroke(255,0,0)
    line(i * spacing, 800 - prev/ max * 500, (i + 1) * spacing, 800 - val/ max * 500)
    prev = val;
  });
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