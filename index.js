const Sharp = require('sharp');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const cors = require('cors');
const { Buffer } = require('buffer');
const axios = require('axios');
const fs = require('fs');

app.use(express.json())
app.use(cors());

// Define the endpoint create-composite
app.post('/create-composite', async (req, res) => {
    
  // Read the CID Array from the request body 
  let cidArray = req.body;

  // Insert at the beginning of the CID array the CID of the stock car image
  cidArray.unshift('QmVz6CoMLu6iFy87T1fmHRPbX5iF3zuWMetD7DLMAAamWm');

  console.log(cidArray);

  // Load the images from the CID array by creating the respective URLs 
  let images = await Promise.all(cidArray.map(async cid => {
    let imageUrl = `https://crypto-wheels.infura-ipfs.io/ipfs/${cid}`;
    let imageResponse = await axios({url: imageUrl, responseType: 'arraybuffer'})
    let imageBuffer = Buffer.from(imageResponse.data, 'binary')
    return imageBuffer;
  }));

  // Create a new canvas with the desired options
  let canvas = Sharp({
    create: {
      width: 1000,
      height: 1000,
      channels: 4,
      background: { r: 255, g: 255, b: 255 }
    }
  });

  // Create the layers to be applied on the canvas
  let layers = images.map(file => ({ input: file }));

  // Composite the layers on the original canvas
  canvas = canvas.composite(layers); 

  // Save the composed image in a jpg file (overwritten everytime)
  await canvas.toFile('merged.jpg');

  // Load the merged jpg file and encode it to base64 format
  const fileContent = fs.readFileSync('./merged.jpg');
  const base64 = btoa(new Uint8Array(fileContent).reduce((data, byte) => data + String.fromCharCode(byte), ''));

  // Send as response the base64 encoded image
  res.send(base64);
});

// Start the server
app.listen(port, () => {
  console.log(`Backend for Image Composition listening on port: ${port}`);
});
