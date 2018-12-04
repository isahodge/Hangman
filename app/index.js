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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/*
** Randomly chooses a word from a file with an object containing the key 'words'
*/
function getHiddenWord(file) {
  const wordsObj = JSON.parse(readFileSync(file, 'utf8'));
  return wordsObj.words[getRandomInt(wordsObj.total)];
}

/*
** Stores the amount of occurances of each character in the hidden word. This is
** used to check input from player against an array of occuring characters in the
** hidden word.
*/
function getCharCount(hiddenWord, hiddenWordLen) {
  const charArr = new Array(26).fill(0);
  for (let i = 0; i < hiddenWordLen; i += 1) {
    // ideally would want a node with value of i in the charPositions array
    charArr[hiddenWord.charCodeAt(i) - 97] += 1;
  }
  return charArr;
}

function invalidInput(input) {
  return !/^[a-z]{1}$/.test(input);
}

function revealCharacters(revealedWord, hiddenWord, char, hiddenWordLen) {
  const positions = [];
  for (let i = 0; i < hiddenWordLen; i += 1) {
    if (hiddenWord[i] === char) {
      positions.push(i);
    }
  }
  const positionsSize = positions.length;
  for (let j = 0; j < positionsSize; j += 1) {
    revealedWord[positions[j]] = char;
  }
}

function gameLoop(file) {
  /*
  ** Game control variables.
  */
  const hiddenWord = getHiddenWord(file);
  const hiddenWordLen = hiddenWord.length;
  const charCountArr = getCharCount(hiddenWord, hiddenWordLen);
  const revealedWord = new Array(hiddenWordLen).fill('_');
  let charactersLeft = hiddenWordLen;
  let wrongGuessStr = '';
  let remainingGuesses = 6;
  console.log(`Hidden word = ${hiddenWord} Length: ${hiddenWordLen}`);
  console.log(revealedWord);

  rl.on('line', (line) => {
    const char = line.trim();
    const charIndex = char.charCodeAt(0) - 97;

    if (invalidInput(char)) {
      console.log('Invalid input. Enter a single lowercase alphabetical character\n');
    } else if (charCountArr[charIndex] === -1) {
      console.log('You\'ve already used this character. Try another one.\n');
    } else if (charCountArr[charIndex]) {
      console.log('You guessed right!\n');
      revealCharacters(revealedWord, hiddenWord, char, hiddenWordLen);
      charactersLeft -= charCountArr[charIndex];
      charCountArr[charIndex] = -1;
    } else {
      console.log('Nope!\n');
      wrongGuessStr += ` ${char}`;
      remainingGuesses -= 1;
      charCountArr[charIndex] = -1;
    }
    console.log(revealedWord);
    console.log(`\nGuesses Left: ${remainingGuesses}\nWrong guesses:${wrongGuessStr}\n`);
    if (remainingGuesses <= 0 || charactersLeft <= 0) {
      rl.close();
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
  if (!existsSync(file)) {
    console.log(`${file} doesn't exist. Fetching words from REACH API`);
    fetch('http://app.linkedin-reach.io/words')
      .then(res => res.text())
      .then((body) => {
        storeWordsObj(file, body);
        gameLoop(file);
      })
      .catch(error => console.log(error));
  }
}

/*
** Start of program. Needs a file to store words from REACH API
*/
gameStart('words.txt');
