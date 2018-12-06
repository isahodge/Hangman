import { readFileSync, writeFileSync } from 'fs';

/*
** Contents retrieved by REACH API are words separated by newlines. Here we store all
** the words in an array with the 'words' key, amount of words with the 'total' key
** and the 'difficulty' to check if it was changed from the previous game.
*/

export function storeWordsObj(file, body, difficulty) {
  const dataArray = body.split('\n');
  const wordsObj = {
    words: dataArray,
    total: dataArray.length,
    difficulty,
  };
  writeFileSync(file, JSON.stringify(wordsObj));
}

export function checkFileDifficulty(file, difficulty) {
  const content = readFileSync(file);
  const contentjson = JSON.parse(content);
  if (contentjson.difficulty === difficulty) {
    return true;
  }
  return false;
}
