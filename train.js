class Sim{
  constructor(){
    return;
  }
  reset = ()=>{
    movePins();
    moveGround();
    clearBalls();
  }
  getState = ()=>{
    return 
  }
  applyParameters = (row, col, size)=>{
    effectController.vgap = row
    vgap = effectController.vgap;
    effectController.hgap = col
    spacing = effectController.hgap
    effectController.pegsize = size;
  }
}
/*

function lossfunc(stddev, ideal){
  return (ideal - stddev)*(ideal - stddev)/(ideal * ideal);
}

function createAgentModel(){
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 3, activation: 'linear', inputShape: [1] }));
  model.add(tf.layers.dense({ units: 1, activation: 'linear', inputShape: [3]}));
  model.add(tf.layers.dense({ units: 3, activation: 'linear', inputShape: [1]}));
  model.compile({optimizer: "sgd", loss: "meanAbsoluteError"}, metrics=['accuracy']);
  return model;
}

// Define your physics simulation environment.
const physicsSimulator = new Sim();

// Define the neural network model.
const model = createAgentModel();

const target = 28.86;
// Training loop.
async function trainAgent(numEpochs) {

  for (let epoch = 0; epoch < numEpochs; epoch++) {
    // Use the model to predict parameters.
    let prediction = await model.predict(tf.tensor([1])).dataSync();
    console.log(prediction);
    let result = await run_sim(prediction);

    const loss = (pred, target) => pred.sub(target).square().div(target)
    let grads = tf.grad(loss);

    const modelWeights = model.trainableWeights;
    const gradients = grads(modelWeights);
    const updatedWeights = modelWeights.map((weight, idx) =>
      weight.add(gradients[idx].mul(-0.01))
    );
  
    // Step 5: Update model weights
    model.setWeights(updatedWeights);
    //let loss, accuracy;

    //loss, accuracy = await model.trainOnBatch(tf.tensor([result]), );
    //console.log("LOSS: " + loss);

  }
}
// Train the agent.
//trainAgent(numEpochs);


async function trainmodel(epochs){
  const learningRate = 0.01;
  const optimizer = tf.train.sgd(learningRate);

  const loss = (pred, target) => pred.sub(target).square().div(target)

  for(let i = 0; i < epochs; i++){
    let grad = optimizer.computeGradients(() => loss(tf.tensor([target])), tf.trainable);
    //model predict
    //run sim
    //get grad between sim output and target
    //add grad to model
    //model predict
    console.log(grad);
    let pred = await run_sim(prediction);
    optimizer.applyGrad(grad)
  }
  console.log("LOSS: " + loss);

}
*/
/*
async function trainmodel(epochs){
  // Define a simple model
  const model = tf.sequential();

  model.add(tf.layers.dense({ units: 3, inputShape: [1] }));

  // Define a target value
  const target = tf.scalar(28.86);

  // Training loop
  const numIterations = epochs;
  const learningRate = 0.1;

  for (let i = 0; i < numIterations; i++) {
    // Step 1: Model predict
    const prediction = model.predict(tf.tensor([1])).dataSync();

    // Step 2: Run simulation
    const simOutput = await run_sim(prediction);

    // Step 3: Compute gradient between sim output and target
    //const loss = tf.losses.meanSquaredError(target, simOutput);
    const loss = (pred, target) => pred.sub(target).square().div(target)
    //const grads = tf.grads(loss);

    const grads = tf.grad((pred, tar) => {
      const lossval = loss(pred, target);
      return lossval;
    });
    // Step 5: Get gradients
    const gradients = grads([simOutput,target]);

    // Step 6: Update model weights
    let newWeights = tf.tensor([0,0])
    for (let j = 0; j < model.trainableWeights.length; j++) {
      newWeights.assign(model.getWeights()[j].sub(gradients.dataSync()[j].mul(learningRate)));
    }
    
    model.setWeights(newWeights)

    // Step 7: Model predict (after updating)
    //const updatedPrediction = model.predict(tf.tensor([1]));


    // Step 5: Update model weights
    //model.setWeights(updatedWeights);

    // Step 6: Model predict (after updating)
    //const updatedPrediction = model.predict(tf.tensor([1]));

    console.log(`Iteration ${i}: Prediction=${updatedPrediction.dataSync()}, Loss=${loss.dataSync()}`);
  }
}*/




async function trainmodel(epochs){

  // y = a * x^2 + b * x + c.
  const f = x => a.mul(x.square()).add(b.mul(x)).add(c);
  const loss = (pred, label) => pred.sub(label).square().mean();

  const learningRate = 0.01;
  const optimizer = tf.train.sgd(learningRate);

  // Train the model.
  for (let i = 0; i < epochs; i++) {s
    let yguess = await run_sim(xs)
    optimizer.minimize(() => loss(yguess, ys));
  }

  // Make predictions.
  console.log(
      `a: ${a.dataSync()}, b: ${b.dataSync()}, c: ${c.dataSync()}`);
  const preds = f(xs).dataSync();
  preds.forEach((pred, i) => {
    console.log(`x: ${i}, pred: ${pred}`);
  });
}

const INITIAL_TEMPERATURE = 50
const MINIMUM_TEMPERATURE = 1  // stopping criterion(one of the criterion)
const EPSILON = 0.01  // stop when difference between x less than EPSILON (and temp less than MINIMUM_TEMPERATURE)
const TEMP_REDUCTION_FACTOR = 1.3  // temperature reduces by this factor
const NO_OF_ITERATION = 10// no of iteration per temperature
// https://gist.github.com/mandalbiswadip/59dfdd5d1138a6d83e0f6c3b52a46920
// https://machinelearningmastery.com/simulated-annealing-from-scratch-in-python/
//SIMULATED ANNEALING
const momentum = 0.1;
async function f(x,y,z){
  let stddev = await run_sim(x,y,z);
  return stddev;
}

let losses = []


function probability(delta, temp){  // ignoring the boltzmann's constant
  return tf.exp(-delta / temp)
}

async function sim_anneal(epochs){
  // iteration variables
  let iteration_counter = 0
  let xt = tf.tensor([0,0,0.2])  // initial guess
  
  let Et = await f(xt.dataSync());

  let temperature = INITIAL_TEMPERATURE

  while(true){
      let tempxt = xt.dataSync();
      xt_1 = tf.tensor([randomGaussian(tempxt[0], temperature/100),randomGaussian(tempxt[1], temperature/100),randomGaussian(tempxt[2], temperature/100)])
        // randomly choose from normal distribution of mean of xt(neighbourhood of xt) and standard deviation 20/6

      //Et = await f(xt.dataSync())  // objective at xt
      Et_1 = await f(xt_1.dataSync())  // objective value at guessed solution

      delta_x = tf.norm(xt_1 - xt)  // |xt - xt_1|     // norm
      delta_E = Et_1 - Et  // difference in objective

      // console.log("=====================================\n\n")
      // console.log("Counter: " + iteration_counter)
      // console.log("Temperature: " + temperature)
      // console.log("Difference: " + xt_1 - xt)
      // console.log("X value: " + xt)
      // console.log("Guessed X value: " + xt_1)
      // console.log("Function value: " + Et_1)
      // console.log(delta_x)
      if (delta_E <= 0 && delta_E != NaN){
          console.log(delta_E)
          xt = xt_1  // accept solution if objective decreased
          Et = Et_1
          xt.add(xt_1.sub(xt).mul(momentum)).dataSync()
          //mnt = momentum * xt_1.sub(xt)
      }else{
        
        xt.add(xt_1.sub(xt).mul(-momentum/2)).dataSync()
        // if the energy increased
        // pick from uniform distribution from (0,1)
        u = tf.randomUniform(
            shape=[],
            minval=0,
            maxval=1
            )

        if(delta_E != NaN && u <= probability(delta_E, temp=temperature)){  // if probability greater than u
            console.log(delta_E)
            //xt = xt_1  // if probability is good(which means delta E is low and temperature is high)
            //Et = Et_1
            if(delta_x.dataSync() < EPSILON && temperature < MINIMUM_TEMPERATURE || iteration_counter > epochs){
                break
            }
            else{
              if(iteration_counter % NO_OF_ITERATION == 0){
                temperature = temperature / TEMP_REDUCTION_FACTOR
                
              }
            }
          }
        }
      iteration_counter += 1
      

  //console.log("Minima found at: " + xt)
  // let minima = await f(xt.dataSync())
  // console.log("Value of function at Minima: " + minima)

  // SOLUTION FOR HIMMELBLAU FUNCTION
  // Counter: 313616
  // Temperature: 0.048828125
  // Difference: [-0.00349092 -0.00102925]
  // X value: [ 3.568818  -1.8162793]
  // Guessed X value: [ 3.5653272 -1.8173085]
  // Function value: 0.02862376905977726
  // tf.Tensor(0.003639494, shape=(), dtype=float32)
  // Minima found at: [ 3.5653272 -1.8173085]
  // Value of function at Minima: 0.02862376905977726
  }
}