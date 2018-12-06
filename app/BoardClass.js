import { blue } from './chalkColors';

export default class Board {
  constructor(length, word) {
    this._length = length;
    this._word = word;
    this._characters = new Array(length).fill('_');
  }

  printBoard() {
    const word = this._characters.join(' ');
    console.log(blue('______________________________________________\n\n'));
    console.log(`             ${blue(word)}                  \n`);
  }

  revealCharacters(char) {
    const positions = [];
    for (let i = 0; i < this._length; i += 1) {
      if (this._word[i] === char) {
        positions.push(i);
      }
    }
    const positionsSize = positions.length;
    for (let j = 0; j < positionsSize; j += 1) {
      this._characters[positions[j]] = char;
    }
  }
}
