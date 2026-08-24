const ort = require('onnxruntime-node');
const fs = require('fs');

async function main() {
    try {
        console.log("Loading model...");
        const session = await ort.InferenceSession.create('models/eres2net.onnx');
        console.log("Model loaded successfully.");
        
        console.log("Input names:", session.inputNames);
        console.log("Output names:", session.outputNames);
        
        // We can't easily get the full shape from just the session object in node API sometimes, 
        // but we can try to run a dummy inference to get the output shape.
        // CampPlus usually takes [batch, frames, 80] or [batch, 80, frames] depending on the model.
        // Let's create a dummy input. 
        // 3D-Speaker campplus takes [batch, frames, 80] (fbank). Let's test with 100 frames.
        const dummyFbank = new Float32Array(1 * 100 * 80);
        const tensor = new ort.Tensor('float32', dummyFbank, [1, 100, 80]);
        
        let start = Date.now();
        const results = await session.run({ [session.inputNames[0]]: tensor });
        let latency = Date.now() - start;
        
        const output = results[session.outputNames[0]];
        console.log("Output shape:", output.dims);
        console.log("Inference latency:", latency, "ms");
        
        const stats = fs.statSync('models/eres2net.onnx');
        console.log("Model size (bytes):", stats.size);
    } catch (e) {
        console.error("Error:", e);
    }
}
main();
