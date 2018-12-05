import fetch from 'node-fetch';

function parseOxfordApi(body) {
  // loop through result so I don't dereference a null pointer
  const bodyjson = JSON.parse(body);
  const entries = bodyjson.results[0].lexicalEntries[0].entries[0].senses;
  if (entries) {
    const shortDef = entries[0].short_definitions[0];
    const definition = entries[0].definitions;
    if (shortDef || definition) {
      console.log(`Hint: ${shortDef || definition}`);
    } else {
      console.log('Could not provide hint');
    }
  } else {
    console.log('Could not provide hint');
  }
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
      console.log(`${result.status}`);
      if (result.status === 200) {
        result.text().then((body) => {
          parseOxfordApi(body);
        });
      } else {
        console.log('Could not provide hint');
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
      console.log(`${result.status}`);
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
