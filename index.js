import Sharp from 'sharp'
import express from 'express'
import cors from 'cors'
import { Buffer } from 'buffer'
import fs from 'fs'
import axios from 'axios'
const port = process.env.PORT || 3001;
//const cors = import('cors');
//const { Buffer } = import('buffer');
//const axios = import('axios');
//const fs = import('fs');
import car from './json/car.json' assert { type: "json" };
import headlights_legendary from './json/headlights_legendary.json' assert { type: "json" };
import headlights_rare from './json/headlights_rare.json' assert { type: "json" };
import rim_common_1 from './json/rim_common_1.json' assert { type: "json" };
import rim_common_2 from './json/rim_common_2.json' assert { type: "json" };
import rim_common_3 from './json/rim_common_3.json' assert { type: "json" };
import rim_rare_1 from './json/rim_rare_1.json' assert { type: "json" };
import rim_rare_2 from './json/rim_rare_2.json' assert { type: "json" };
import rim_legendary from './json/rim_legendary.json' assert { type: "json" };
import spoiler_common_1 from './json/spoiler_common_1.json' assert { type: "json" };
import spoiler_common_2 from './json/spoiler_common_2.json' assert { type: "json" };
import spoiler_common_3 from './json/spoiler_common_3.json' assert { type: "json" };
import spoiler_rare_1 from './json/spoiler_rare_1.json' assert { type: "json" };
import spoiler_rare_2 from './json/spoiler_rare_2.json' assert { type: "json" };
import spoiler_legendary from './json/spoiler_legendary.json' assert { type: "json" };
import wrap_common_1 from './json/wrap_common_1.json' assert { type: "json" };
import wrap_common_2 from './json/wrap_common_2.json' assert { type: "json" };
import wrap_common_3 from './json/wrap_common_3.json' assert { type: "json" };
import wrap_rare_1 from './json/wrap_rare_1.json' assert { type: "json" };
import wrap_rare_2 from './json/wrap_rare_2.json' assert { type: "json" };
import wrap_legendary from './json/wrap_legendary.json' assert { type: "json" };
import tinted_windows_legendary from './json/tinted_windows_legendary.json' assert { type: "json" };

var app = express();
app.use(express.json())
app.use(cors());


app.get('/unbox-item', async (req, res) => {
  res.send(unbox_item());
})

app.post('/create-composite', async (req, res) => {

  // Legge l'array di CID dal corpo della richiesta
  let cidArray = req.body;

  // In cima all'array aggiungi l'image CID della macchina stock
  cidArray.unshift(JSON.parse(JSON.stringify(car)).ImageCID);

  console.log(cidArray);

  // Carica le immagini dall'array di CID, componendo le URL
  let images = await Promise.all(cidArray.map(async cid => {
    let imageUrl = `https://crypto-wheels.infura-ipfs.io/ipfs/${cid}`;
    let imageResponse = await axios({ url: imageUrl, responseType: 'arraybuffer' })
    let imageBuffer = Buffer.from(imageResponse.data, 'binary')
    return imageBuffer;
  }));


  // Crea un nuovo canvas con le dimensioni desiderate
  let canvas = Sharp({
    create: {
      width: 1000,
      height: 1000,
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

function extractItem(commonProbability, rareProbability) {
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();
  // Check if the random number falls under the probability of extracting a common item
  if (randomNumber < commonProbability) {
    return 'common';
  }
  // Check if the random number falls under the probability of extracting a rare item
  if (randomNumber < commonProbability + rareProbability) {
    return 'rare';
  }
  // If the random number doesn't fall under the probability of a common or rare item, it must be a legendary item
  return 'legendary';
}

// Generate a random number between min and max, including min and max
function generateRandomIntegerInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//unbox a random item
function unbox_item() {
  //which rarity has been unboxed
  let rarity = extractItem(0.75, 0.22);
  let itemCategory;
  let itemNumber;
  switch (rarity) {
    case 'common':
      itemCategory = generateRandomIntegerInRange(1, 3); //1:spoiler 2:rim 3:wrap
      itemNumber = generateRandomIntegerInRange(1, 3);
      switch (itemCategory) {
        case 1:
          switch (itemNumber) {
            case 1: return spoiler_common_1;
            case 2: return spoiler_common_2;
            case 3: return spoiler_common_3;
            default: break;
          }
          break;
        case 2:
          switch (itemNumber) {
            case 1: return rim_common_1;
            case 2: return rim_common_2;
            case 3: return rim_common_3;
            default: break;
          }
          break;
        case 3:
          switch (itemNumber) {
            case 1: return wrap_common_1;
            case 2: return wrap_common_2;
            case 3: return wrap_common_3;
            default: break;
          }
          break;
        default:
          break;
      }
      break;
    case 'rare':
      itemCategory = generateRandomIntegerInRange(1, 4); //1:spoiler 2:rim 3:wrap 4:headlights
      itemNumber = generateRandomIntegerInRange(1, 2);
      switch (itemCategory) {
        case 1:
          switch (itemNumber) {
            case 1: return spoiler_rare_1;
            case 2: return spoiler_rare_2;
            default: break;
          }
          break;
        case 2:
          switch (itemNumber) {
            case 1: return rim_rare_1;
            case 2: return rim_rare_2;
            default: break;
          }
          break;
        case 3:
          switch (itemNumber) {
            case 1: return wrap_rare_1;
            case 2: return wrap_rare_2;
            default: break;
          }
          break;
        case 4:
          return headlights_rare;
        default:
          break;
      }
      break;
    case 'legendary':
      itemCategory = generateRandomIntegerInRange(1, 5); //1:spoiler 2:rim 3:wrap 4:headlights 5:tinted_windows
      switch (itemCategory) {
        case 1:
          return spoiler_legendary;
        case 2:
          return rim_legendary;
        case 3:
          return wrap_legendary;
        case 4:
          return headlights_legendary;
        case 5:
          return tinted_windows_legendary;
        default:
          break;
      }
      break;
    default:
      break;
  }
}
