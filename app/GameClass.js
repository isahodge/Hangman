import Board from './BoardClass';

export default class Game {
  constructor(hiddenWord, hiddenWordLen) {
    this._hiddenWord = hiddenWord;
    this._hiddenWordLen = hiddenWordLen;
    this._board = new Board(hiddenWordLen, hiddenWord);
    this._wrongGuessStr = '';
    this._remainingGuesses = 6;
    this._char = '';
    this._charIndex = 0;
    this._charactersLeft = hiddenWordLen;
    this._charCountArr = new Array(26).fill(0);
  }

  set char(value) {
    this._char = value;
    this._charIndex = this._char.charCodeAt(0) - 97;
  }

  /*
  ** Stores the amount of occurances of each character in the hidden word. This is
  ** used to check input from player against an array of occuring characters in the
  ** hidden word.
  */

  setCharCountArr() {
    for (let i = 0; i < this._hiddenWordLen; i += 1) {
      // ideally would want a node with value of i in the charPositions array
      this._charCountArr[this._hiddenWord.charCodeAt(i) - 97] += 1;
    }
  }

  /*
  ** Getters
  */
  get board() {
    return this._board;
  }

  get remainingGuesses() {
    return this._remainingGuesses;
  }

  get wrongGuessStr() {
    return this._wrongGuessStr;
  }

  /*
  ** Methods
  */

  printHiddenWord() {
    console.log(`\nHidden word = ${this._hiddenWord} Length: ${this._hiddenWordLen}`);
  }

  rightGuess() {
    this._board.revealCharacters(this._char);
    this._charactersLeft -= this._charCountArr[this._charIndex];
    this._charCountArr[this._charIndex] = -1;
  }

  wrongGuess() {
    this._wrongGuessStr += ` ${this._char}`;
    this._remainingGuesses -= 1;
    this._charCountArr[this._charIndex] = -1;
  }

  checkWin() {
    if (this._charactersLeft <= 0) {
      return true;
    }
    return false;
  }

  checkRightGuess() {
    if (this._charCountArr[this._charIndex]) {
      return true;
    }
    return false;
  }

  checkAlreadyGuessed() {
    if (this._charCountArr[this._charIndex] === -1) {
      return true;
    }
    return false;
  }

  attemptFullWord(word) {
    if (word.valueOf() === this._hiddenWord.valueOf()) {
      this._charactersLeft = 0;
      return true;
    }
    return false;
  }
}
