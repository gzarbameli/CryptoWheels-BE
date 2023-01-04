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

app.post('/create-composite', async (req, res) => {
    
  // Legge l'array di CID dal corpo della richiesta
  let cidArray = req.body;

  // In cima all'array aggiungi l'image CID della macchina stock
  cidArray.unshift('QmWLoMS4sAFngUJoCfGif211MvGGR6kG9XaafzyWoJXgQU');

  console.log(cidArray);

  // Carica le immagini dall'array di CID, componendo le URL
  let images = await Promise.all(cidArray.map(async cid => {
    let imageUrl = `https://crypto-wheels.infura-ipfs.io/ipfs/${cid}`;
    let imageResponse = await axios({url: imageUrl, responseType: 'arraybuffer'})
    let imageBuffer = Buffer.from(imageResponse.data, 'binary')
    return imageBuffer;
  }));


  // Crea un nuovo canvas con le dimensioni desiderate
  let canvas = Sharp({
    create: {
      width: 800,
      height: 600,
      channels: 4,
      background: { r: 255, g: 255, b: 255 }
    }
  });

  let layers = images.map(file => ({ input: file }));

  canvas = canvas.composite(layers); 

  // Restituisce l'immagine come risposta alla richiesta
  let compositeImage = await canvas.toFile('merged.jpg');

  // Prendi il file mergiato e fai encoding a base64 per passarlo a react in response
  const fileContent = fs.readFileSync('./merged.jpg');
  const base64 = btoa(new Uint8Array(fileContent).reduce((data, byte) => data + String.fromCharCode(byte), ''));

  res.send(base64);

});

// Avvia il server
app.listen(port, () => {
  console.log(`Backend for Image Composition listening on port: ${port}`);
});
