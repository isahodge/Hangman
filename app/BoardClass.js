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

  revealCharacters(charCountArr, charIndex) {
    const positions = charCountArr[charIndex];

    for (const item of positions) {
      this._characters[item] = String.fromCharCode(charIndex + 97);
    }
  }
}
