import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You are playing HANGMAN\n',
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/*
** Make a GET request to the REACH API and store the contents in the given file
*/
function storeReachApi(file) {
  if (!existsSync(file)) {
    console.log(`${file} doesn't exist. Fetching words from REACH API`);
    fetch('http://app.linkedin-reach.io/words')
      .then(res => res.text())
      .then((body) => {
        console.log('Creating words.txt');
        writeFileSync(file, body);
      })
      .catch(error => console.error(error));
  }
}

// needs more error handling
/*
** Contents retrieved by REACH API are words separated by newlines. Here we store all
** the words in an array with the 'words' key, and the amount of words with the 'total' key.
*/
function storeWordsObj(infile, outfile) {
  if (!existsSync(outfile)) {
    console.log(`${outfile} doesn't exist. Fetching words from ${infile}`);
    const data = readFileSync(infile, 'utf8');
    const dataArray = data.split('\n');
    const wordsObj = { words: dataArray, total: dataArray.length };
    writeFileSync(outfile, JSON.stringify(wordsObj));
  }
}

/*
** Randomly chooses a word from a file with an object containing the key 'words'
*/
function getHiddenWord(file) {
  const wordsObj = JSON.parse(readFileSync(file, 'utf8'));
  return wordsObj.words[getRandomInt(wordsObj.total)];
}

/*
** Stores the amount of occurances of each character in the hidden word
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

/*
** Start of program
*/
storeReachApi('words.txt');
storeWordsObj('words.txt', 'wordsObj.txt');

const hiddenWord = getHiddenWord('wordsObj.txt');
const hiddenWordLen = hiddenWord.length;
console.log(`Hidden word = ${hiddenWord} Length: ${hiddenWordLen}`);

const charCountArr = getCharCount(hiddenWord, hiddenWordLen);

/*
** Game control variables.
*/
var wrongGuess = new Array(26).fill(0);
var rightGuess = new Array(26).fill(0);
var revealedWord = new Array(hiddenWordLen).fill('_');
var wrongGuessStr = '';
var charactersLeft = hiddenWordLen;
var remainingGuesses = 6;
// right guess and wrong guess array can be elimanted if we set charCountArr to -1 after guess
// and check for that specifically

/*
** rl stands for Read Line. Input is accepted in the form of lines from the player until
** they lose, win, or exit.
*/
rl.prompt();

console.log(revealedWord);

rl.on('close', () => {
  console.log('Exiting the game.');
});

rl.on('line', (line) => {
  const char = line.trim();
  const charIndex = char.charCodeAt(0) - 97;

  if (invalidInput(char)) {
    console.log('Invalid input. Enter a single lowercase alphabetical character');
  } else if (rightGuess[charIndex] || wrongGuess[charIndex]) {
    console.log('You\'ve already used this character. Try another one.');
  } else if (charCountArr[charIndex]) {
    console.log('You guessed right!');
    charactersLeft -= charCountArr[charIndex];
    rightGuess[charIndex] = 1;
    revealCharacters(revealedWord, hiddenWord, char, hiddenWordLen);
  } else {
    console.log('Nope!');
    wrongGuess[charIndex] = 1;
    wrongGuessStr += ` ${char}`;
    remainingGuesses -= 1;
  }
  console.log(`${revealedWord}\nGuesses Left: ${remainingGuesses}\nWrong guesses:${wrongGuessStr}`);
  if (remainingGuesses <= 0 || charactersLeft <= 0) {
    rl.close();
  }
});
