export default class User {
  constructor(name, difficulty) {
    this._name = name;
    this._score = 0;
    this._difficulty = difficulty;
  }

  get score() {
    return this._score;
  }

  get name() {
    return this._name;
  }

  get difficulty() {
    return this._difficulty;
  }
  
  win() {
    this._score += 1;
  }
}