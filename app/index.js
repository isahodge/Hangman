import { readFileSync, existsSync } from 'fs';
import readline from 'readline';
import prompt from 'prompt';
import fetch from 'node-fetch';
import User from './UserClass';
import Game from './GameClass';
import hint from './apiRequests';
import { storeWordsObj, checkFileDifficulty } from './storeWords';
import printLeaderboard from './leaderboard';
import printHangman from './printHangman';
import {
  pink,
  yellow,
  lightYellow,
  magentaBright,
  red,
  green,
} from './chalkColors';

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

/*
** Main game. Creates a new Game class for each new word.
*/

function newWord(file) {
  const hiddenWord = getHiddenWord(file);
  const game = new Game(hiddenWord, hiddenWord.length);

  game.board.printBoard();
  game.printHiddenWord();
  hint(hiddenWord);
  game.setCharCountArr();// think of a better way to set this
  return game;
}

function invalidInput(input) {
  return !/^[a-z]{1}$/.test(input);
}

function checkWinLose(rl, game, user, file) {
  if (game.remainingGuesses <= 0) {
    rl.close();
  } else if (game.checkWin()) {
    console.log(lightYellow('◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ You won! ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆'));
    console.log(lightYellow("◆ ◆ ◆ ◆ ◆ Here's another word ◆ ◆ ◆ ◆ ◆ ◆"));
    user.win();
    game = newWord(file);
  }
  return game;
}

function guessWord(rl, game) {
  rl.question('Guess the full word\n', (answer) => {
    if (!game.attemptFullWord(answer)) {
      console.log('Wrong');
      game.wrongGuess();
      game.board.printBoard();
      console.log(`\nGuesses Left: ${game.remainingGuesses}\nWrong guesses:${game.wrongGuessStr}\n`);
    } else {
      console.log('Correct!');
    }
  });
  return game;
}

function gameLoop(file, user) {
  let game = newWord(file);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You are playing HANGMAN\n',
  });

  rl.on('close', () => {
    console.log(pink('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦'));
    console.log(pink('∾∾∾∾∾∾∾∾∾∾∾∾∾∾ See you later! ∾∾∾∾∾∾∾∾∾∾∾∾∾∾∾'));
    console.log(pink('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦'));
    printLeaderboard(user);
  });

  rl.on('line', (line) => {
    game.char = line.trim();
    const guess = (line.trim().valueOf() === 'guess'.valueOf());
    if (guess) {
      rl.pause();
      game = guessWord(rl, game);
    } else if (invalidInput(line.trim())) {
      console.log(yellow('\nInvalid input. Enter a single lowercase alphabetical character\n'));
    } else if (game.checkAlreadyGuessed()) {
      console.log(yellow('\nYou\'ve already used this character. Try another one.\n'));
    } else if (game.checkRightGuess()) {
      console.log(green('\nYou guessed right!\n'));
      game.rightGuess();
    } else {
      console.log(red('\nNope!\n'));
      game.wrongGuess();
    }
    game.board.printBoard();
    printHangman(6 - game.remainingGuesses);
    console.log(magentaBright(`\nGuesses Left: ${red(game.remainingGuesses)}\nWrong guesses:${red(game.wrongGuessStr)}\n`));
    game = checkWinLose(rl, game, user, file);
  });
}

/*
** Make a GET request to the REACH API and store the contents in the given file.
*/

function getWords(file, user) {
  fetch(`http://app.linkedin-reach.io/words?difficulty=${user.difficulty}`)
    .then(res => res.text())
    .then((body) => {
      storeWordsObj(file, body, user.difficulty);
      gameLoop(file, user);
    })
    .catch(error => console.log(error));
}

/*
** Start of program. Needs a file to store words from REACH API. Starts the gameloop
*/

function hangman() {
  const file = 'words.txt';
  const schema = {
    properties: {
      username: {
        pattern: /^[a-z]{3,}$/,
        message: 'Name must be at least 3 characters and lowercase letters',
        required: true,
      },
      difficulty: {
        pattern: /^([1-9]|10)$/,
        message: 'Difficulty must be a number between 1 and 10',
        required: true,
      },
    },
  };
  prompt.start();

  prompt.get(schema, (err, result) => {
    if (err) {
      console.log(err);
    }
    const user = new User(result.username, result.difficulty);
    if (!existsSync(file) || !checkFileDifficulty(file, user.difficulty)) {
      console.log(`${file} doesn't exist or doesn't have the requested difficulty. Fetching words from REACH API`);
      getWords(file, user);
    } else {
      gameLoop(file, user);
    }
  });
}

hangman();
