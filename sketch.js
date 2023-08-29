Matter.use('matter-wrap');

let balls = [];
let pins = [];
let pillars = [];
let ground;
let world;
let effectController;

const spacing = 25;

let ballparams = {friction: 0, restitution: 0.2, density: 0.00001, slop:0, sleepThreshold: 2, frictionAir: 0.0} 

function setupGui() {
  effectController = {
		vgap: 0.886
  };
	var h;
  var gui = new dat.GUI();

	//adjust base width of tree
  gui.add(effectController, "vgap").name("Vertical Gap").min(0.25).max(1).step(0.001).onFinishChange(()=>{
		vgap = effectController.vgap;
		movePins();
	});
}
function func(i, j){
  var dx, dy, rot, w, h;
  x = 37.5 - i * spacing/2 + j * spacing, 
  y = 100 + i * 25 * effectController.vgap, 
  w = 8 
  h = 8
  rot = PI/4;

  return {
    x: x, 
    y: y,
    w: w,
    h: h, 
    rot: rot,
  }
}



function setup() {
  const canvas = createCanvas(800, 800);
  //translate(400,400)

  // create an engine
  const engine = Matter.Engine.create();
  world = engine.world;
  setupGui()
  // config wrap area
  const wrap = {
    min: { x: 0, y: 0 },
    max: { x: width, y: height }
  };

  // create balls
  for (let i = 0; i < 4; i++) {
    let newBall = new Ball(world,
      { x: 400, y: 50 - i * 5, r: 5, color: 'white' },
      ballparams
    );
    balls.push(newBall);
  }

  // static line
  ground = new Block(world,
    { x: 400, y: 800, w: 800, h: 50, color: 'grey' },
    { isStatic: true }
  );
  
  for ( let i = 0; i < 60; i ++){
    let pillar = new Block(world,
      { x: i * 25, y: 690, w: 2, h: 200, color: 'white'},
      {isStatic: true}
    )
    pillars.push(pillar)
  }
  
  for (let i = 0; i < 20; i++){
    pins.push([])
    for (let j = 0; j < i + 30 ; j++){
      /*
      let pin = new Ball(world,
        { x: - i * 12.5 + j * 25, y: 100 + i * 25 * 0.866, r:2, color: 'white' },
        { isStatic: true, angle: PI/4}
        )
        */
       /*
      let pin = new Block(world,
        { x: - i * 12.5 + j * 25, y: 100 + i * 25 * 0.866, w:6, h:6, color: 'white' },
        //{ x:j * 25, y: 100 + i * 25 * 0.866, r:2, color: 'white' },
        { isStatic: true, angle: PI/4}
        //{isStatic: true, angle: PI/ 2 + (j - 15) * 0.1}
        )
        */
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

  

  mouse.draw();
}

function mousePressed(){
  newBall = new Ball(world,
    { x: random(395, 405), y: 50, r: 5, color: 'white' },
    ballparams
  );
  balls.push(newBall);
}