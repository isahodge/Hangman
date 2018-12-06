import { readFileSync } from 'fs';
import Game from './GameClass';
import hint from './apiRequests';

/*
** Randomly chooses a word from a file with an object containing a 'words' array
*/

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getHiddenWord(file) {
  const wordsObj = JSON.parse(readFileSync(file, 'utf8'));
  return wordsObj.words[getRandomInt(wordsObj.total)];
}

export default function newWord(file) {
  const hiddenWord = getHiddenWord(file);
  const game = new Game(hiddenWord, hiddenWord.length);

  game.board.printBoard();
  hint(hiddenWord);
  game.setCharCountArr();
  return game;
}
