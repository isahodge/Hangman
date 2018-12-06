import fetch from 'node-fetch';
import { red, magenta } from './chalkColors';

function parseOxfordApi(body) {
  let obj;
  if (Object.prototype.hasOwnProperty.call(body, 'definitions')) {
    return body;
  }
  for (let i = 0; i < Object.keys(body).length; i += 1) {
    if (typeof body[Object.keys(body)[i]] === 'object') {
      obj = parseOxfordApi(body[Object.keys(body)[i]]);
      if (obj != null) {
        return obj;
      }
    }
  }
  return null;
}

function hintDefinition(headWord) {
  fetch(`https://od-api.oxforddictionaries.com:443/api/v1/entries/en/${headWord}`,
    {
      headers: {
        Accept: 'application/json',
        app_id: 'd3718357',
        app_key: 'befbfc450539537b083362573e13266d',
      },
    })
    .then(res => res)
    .then((result) => {
      if (result.status === 200) {
        result.text().then((body) => {
          const def = parseOxfordApi(JSON.parse(body));
          if (def) {
            console.log(magenta(`Hint: ${JSON.stringify(def.definitions[0])}`));
          } else {
            console.log(red('Could not find a definition'));
          }
        });
      } else {
        console.log(red('Could not provide hint'));
      }
    })
    .catch(error => console.log(`Error: ${error}`));
}

export default function hint(hiddenWord) {
  fetch(`https://od-api.oxforddictionaries.com:443/api/v1/inflections/en/${hiddenWord}`,
    {
      headers: {
        Accept: 'application/json',
        app_id: 'd3718357',
        app_key: 'befbfc450539537b083362573e13266d',
      },
    })
    .then(res => res)
    .then((result) => {
      if (result.status === 200) {
        result.text().then((body) => {
          const bodyjson = JSON.parse(body);
          const headWord = bodyjson.results[0].lexicalEntries[0].inflectionOf[0].id;
          hintDefinition(headWord);
        });
      } else {
        hintDefinition(hiddenWord);
      }
    })
    .catch(error => console.log(error));
}
