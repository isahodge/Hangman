import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import readline from 'readline';


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You are playing HANGMAN\n',
});

rl.on('close', () => {
  console.log('Exiting the game.');
});

/*
** Helper functions
*/
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
//change validation to account for a word
function invalidInput(input) {
  return !/^[a-z]{1}$/.test(input);
}

/*
** Randomly chooses a word from a file with an object containing a 'words' array
*/
function getHiddenWord(file) {
  const wordsObj = JSON.parse(readFileSync(file, 'utf8'));
  return wordsObj.words[getRandomInt(wordsObj.total)];
}

//fix this soup
function hintDefinition(headWord) {
  fetch(`https://od-api.oxforddictionaries.com:443/api/v1/entries/en/${headWord}`,
  { headers: {
    "Accept": "application/json",
    "app_id": "d3718357",
    "app_key": "befbfc450539537b083362573e13266d"
  }})
    .then(res => res)
    .then((body) => {
      console.log(`${body.status}`);
      if (body.status == 200)
        body.text().then( (body) => {
          //have this be it's own function
          const bodyjson = JSON.parse(body);
          const entries = bodyjson['results'][0]['lexicalEntries'][0]['entries'][0]['senses'];
          if (entries) {
            const shortDef = entries[0]['short_definitions'];
            const definition = entries[0]['definitions'];
            if (shortDef || definition)
              console.log(`Hint: ${shortDef || definition}`);
            else {
              console.log('Could not provide hint');
            }
          }
          else {
            console.log('Could not provide hint');
          }
      })
      else {
        console.log('Could not provide hint');
      }
    })
    .catch(error => console.log(error));
}
//make this into a hintHeadWordApi function
function hint(hiddenWord) {

  fetch(`https://od-api.oxforddictionaries.com:443/api/v1/inflections/en/${hiddenWord}`,
  { headers: {
    "Accept": "application/json",
    "app_id": "d3718357",
    "app_key": "befbfc450539537b083362573e13266d"
  }})
    .then(res => res)
    .then((body) => {
        console.log(`${body.status}`);
        if (body.status == 200)
          body.text().then( (body) => {
            const bodyjson = JSON.parse(body);
            const headWord = bodyjson['results'][0]['lexicalEntries'][0]['inflectionOf'][0]['id'];
            hintDefinition(headWord);
          });
        else {
          hintDefinition(hiddenWord);
        }
    })
    .catch(error => console.log(error));
}
//make a 'hint' function that calls the hint

//this should take in the game class/struct and call the wrong guess method 
function attemptFullWord(word, hiddenWord) {
  if (word.valueOf() === hiddenWord.valueOf())
    return true;
  return false;
}

class User {
  constructor(name) {
    this.name = name;
    this.score = 0;
  }
  
  win() {
    this.score += 1;
    return this.score;
  }

}

//make a board class
class Game {
  constructor(hiddenWord, hiddenWordLen) {
    this._hiddenWord = hiddenWord;
    this._hiddenWordLen = hiddenWordLen;
    this._revealedWord = new Array(hiddenWordLen).fill('_');
    this._wrongGuessStr = '';
    this._remainingGuesses = 6;
    this._char = '';
    this._charIndex = 0;
    this._charactersLeft = hiddenWordLen;
    this._charCountArr = new Array(26).fill(0);
  }

  set char (value) {
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

  get hiddenWord () {
    return this._hiddenWord;
  }

  get charCountArr () {
    return this._charCountArr;
  }

  get remainingGuesses() {
    return this._remainingGuesses;
  }

  get wrongGuessStr() {
    return this._wrongGuessStr;
  }

  get charactersLeft() {
    return this._charactersLeft;
  }

  printHiddenWord() {
    console.log(`\nHidden word = ${this._hiddenWord} Length: ${this._hiddenWordLen}`);
  }

  printRevealedWord() {
    console.log(this._revealedWord);
  }

  revealCharacters () {
    const positions = [];
    for (let i = 0; i < this._hiddenWordLen; i += 1) {
      if (this._hiddenWord[i] === this._char) {
        positions.push(i);
      }
    }
    const positionsSize = positions.length;
    for (let j = 0; j < positionsSize; j += 1) {
      this._revealedWord[positions[j]] = this._char;
    }
  }

  rightGuess() {
    this.revealCharacters();
    this._charactersLeft -= this._charCountArr[this._charIndex];
    this._charCountArr[this._charIndex] = -1;
  }

  wrongGuess() {
    this._wrongGuessStr += ` ${this._char}`;
    this._remainingGuesses -= 1;
    this._charCountArr[this._charIndex] = -1;
  }

  checkRightGuess() {
    if (this._charCountArr[this._charIndex])
      return true;
    return false;
  }

  checkAlreadyGuessed() {
    if (this._charCountArr[this._charIndex] === -1)
      return true;
    return false;
  }
}

function newWord(file) {
  const hiddenWord = getHiddenWord(file);
  let game = new Game(hiddenWord, hiddenWord.length);

  game.printRevealedWord();
  game.printHiddenWord();
  hint(game.hiddenWord);
  game.setCharCountArr();//think of a better way to set this
  return game;
}


// game = newWord function that returns a new game obj with a different hidden word 
function gameLoop(file) {
  let game = newWord(file);

  rl.on('line', (line) => {
    game.char = line.trim();

    if (invalidInput(line.trim())) {
      console.log('Invalid input. Enter a single lowercase alphabetical character\n');
    } else if (game.checkAlreadyGuessed()) {
      console.log('You\'ve already used this character. Try another one.\n');
    } else if (game.checkRightGuess()) {
      console.log('You guessed right!\n');
      game.rightGuess()
    } else {
      console.log('Nope!\n');
      game.wrongGuess();
    }
    game.printRevealedWord();
    console.log(`\nGuesses Left: ${game.remainingGuesses}\nWrong guesses:${game.wrongGuessStr}\n`);
    if (game.remainingGuesses <= 0) {
      rl.close();
    } else if (game.charactersLeft <= 0) {
      console.log("You won!\nHere's another word");
      game = newWord(file);
    }
  });
}

/*
** Contents retrieved by REACH API are words separated by newlines. Here we store all
** the words in an array with the 'words' key, and the amount of words with the 'total' key.
*/
function storeWordsObj(file, body) {
  const dataArray = body.split('\n');
  const wordsObj = { words: dataArray, total: dataArray.length };
  writeFileSync(file, JSON.stringify(wordsObj));
}

/*
** Make a GET request to the REACH API and store the contents in the given file.
** Start the game loop.
*/
function gameStart(file) {
  //allow the user the option to choose difficulty
  if (!existsSync(file)) {
    console.log(`${file} doesn't exist. Fetching words from REACH API`);
    fetch('http://app.linkedin-reach.io/words')
      .then(res => res.text())
      .then((body) => {
        storeWordsObj(file, body);//also store difficulty?
        gameLoop(file);
      })
      .catch(error => console.log(error));
  }
  else {
    gameLoop(file);
  }
}

/*
** Start of program. Needs a file to store words from REACH API
*/
gameStart('words.txt');
