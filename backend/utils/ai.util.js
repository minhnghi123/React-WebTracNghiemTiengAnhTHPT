import * as tf from "@tensorflow/tfjs";

export const trainModel = async (trainingData, trainingLabels) => {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 16,
      activation: "relu",
      inputShape: [trainingData[0].length],
    })
  );
  model.add(tf.layers.dense({ units: 8, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

  model.compile({
    optimizer: "adam",
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  const xs = tf.tensor2d(trainingData);
  const ys = tf.tensor2d(trainingLabels, [trainingLabels.length, 1]);

  await model.fit(xs, ys, { epochs: 10 });

  return model;
};

export const predict = (model, inputData) => {
  const inputTensor = tf.tensor2d([inputData]);
  const prediction = model.predict(inputTensor);
  return prediction.dataSync();
};
