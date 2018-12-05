import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import readline from 'readline';
import prompt from 'prompt';
import User from './UserClass';
import Game from './GameClass';
import hint from './ApiRequests';

/*
** Stores the current user score if it's in the top ten recorded, sorts the leaderboard by score,
** and prints it.
*/
function printLeaderboard(user) {
  console.log(`Your score: ${user.score}`);
  const file = 'leaderBoard.txt';
  const userObj = {
    name: user.name,
    score: user.score,
    difficulty: user.difficulty,
  };
  let lb;
  if (!existsSync(file)) {
    lb = { leaderboard: [userObj] };
  } else {
    lb = JSON.parse(readFileSync(file));
    lb.leaderboard.push(userObj);
    lb.leaderboard.sort((a, b) => b.score - a.score);
    // make this faster by inserting in a binary search way
    // if score is within top ten on leaderboard, put user name, difficulty, and
    // score on leaderboard, show leaderboard
    // check score against leaderboard. if high score store in leaderboard and print "HIGHSCORE!"
  }
  const lbStr = JSON.stringify(lb);
  writeFileSync(file, lbStr);
  console.log(lbStr);
}

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
    console.log("You won!\nHere's another word");
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
    console.log('Exiting the game.');
    printLeaderboard(user);
  });

  rl.on('line', (line) => {
    game.char = line.trim();
    const guess = (line.trim().valueOf() === 'guess'.valueOf());
    if (guess) {
      rl.pause();
      game = guessWord(rl, game);
    } else if (invalidInput(line.trim())) {
      console.log('Invalid input. Enter a single lowercase alphabetical character\n');
    } else if (game.checkAlreadyGuessed()) {
      console.log('You\'ve already used this character. Try another one.\n');
    } else if (game.checkRightGuess()) {
      console.log('You guessed right!\n');
      game.rightGuess();
    } else {
      console.log('Nope!\n');
      game.wrongGuess();
    }
    game.board.printBoard();
    console.log(`Guess: ${guess}`);
    console.log(`\nGuesses Left: ${game.remainingGuesses}\nWrong guesses:${game.wrongGuessStr}\n`);
    game = checkWinLose(rl, game, user, file);
  });
}

/*
** Contents retrieved by REACH API are words separated by newlines. Here we store all
** the words in an array with the 'words' key, amount of words with the 'total' key
** and the 'difficulty' to check if it was changed from the previous game.
*/
function storeWordsObj(file, body, difficulty) {
  const dataArray = body.split('\n');
  const wordsObj = {
    words: dataArray,
    total: dataArray.length,
    difficulty,
  };
  writeFileSync(file, JSON.stringify(wordsObj));
}

function checkFileDifficulty(file, difficulty) {
  const content = readFileSync(file);
  const contentjson = JSON.parse(content);
  if (contentjson.difficulty === difficulty) {
    return true;
  }
  return false;
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
    console.log(`Input: ${result.username}, ${result.difficulty}`);
    const user = new User(result.username, result.difficulty);
    if (!existsSync(file) || !checkFileDifficulty(file, user.difficulty)) {
      console.log(`${file} doesn't exist or doesn't have the requested difficulty. Fetching words from REACH API`);
      getWords(file, user);
    } else {
      gameLoop(file, user);
    }
    console.log(`Your score was: ${user.score}`);
  });
}

hangman();
