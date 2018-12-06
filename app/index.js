import { existsSync } from 'fs';
import readline from 'readline';
import prompt from 'prompt';
import fetch from 'node-fetch';
import clear from 'clear';
import User from './UserClass';
import { storeWordsObj, checkFileDifficulty } from './storeWords';
import leaderboard from './leaderboard';
import { printHangman, printTitle } from './printHangman';
import newWord from './getNewWord';
import {
  pink,
  yellow,
  lightYellow,
  magentaBright,
  red,
  green,
} from './chalkColors';

/*
** Main game. Creates a new Game class for each new word.
*/

function invalidInput(input) {
  return !/^[a-z]{1}$/.test(input);
}

function checkWinLose(rl, game, user, file) {
  if (game.remainingGuesses <= 0) {
    clear();
    console.log(red('\nGame over'));
    console.log(red(`\n\n\n\nBy the way, the word was ${game._hiddenWord}`));
    setTimeout(() => rl.close(), 3000);
  } else if (game.checkWin()) {
    clear();
    console.log(lightYellow('◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆ You won! ◆ ◆ ◆ ◆ ◆ ◆ ◆ ◆'));
    console.log(lightYellow("◆ ◆ ◆ ◆ ◆ Here's another word ◆ ◆ ◆ ◆ ◆ ◆"));
    user.win();
    game = newWord(file);
  }
  return game;
}

function guessWord(rl, game) {
  rl.question(magentaBright('Guess the full word\n'), (answer) => {
    if (!game.attemptFullWord(answer)) {
      clear();
      if (game.remainingGuesses) {
        console.log(red('\nWrong'));
        game.board.printBoard();
        printHangman(6 - game.remainingGuesses);
        console.log(magentaBright(`\nGuesses Left: ${game.remainingGuesses}\nWrong guesses:${game.wrongGuessStr}\n`));
      } else {
        console.log(red('\nYou lost. Press enter to continue'));
      }
    } else {
      console.log(green('\nCorrect! Press enter to continue'));
    }
  });
  return game;
}

function gameLoop(file, user) {
  clear();
  let game = newWord(file);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'You are playing HANGMAN\n',
  });

  rl.on('close', () => {
    clear();
    console.log(pink('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦'));
    console.log(pink('∾∾∾∾∾∾∾∾∾∾∾∾∾∾∾∾ See you later! ∾∾∾∾∾∾∾∾∾∾∾∾∾∾∾∾'));
    console.log(pink('✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦'));
    leaderboard(user);
  });

  rl.on('line', (line) => {
    game.char = line.trim();
    const guess = (line.trim().valueOf() === 'guess'.valueOf());
    clear();
    if (guess) {
      rl.pause();
      game = guessWord(rl, game);
    } else if (invalidInput(line.trim())) {
      console.log(yellow('\nInvalid input. Enter a single lowercase alphabetical character'));
    } else if (game.checkAlreadyGuessed()) {
      console.log(yellow('\nYou\'ve already used this character. Try another one.'));
    } else if (game.checkRightGuess()) {
      console.log(green('\nYou guessed right!'));
      game.rightGuess();
    } else {
      console.log(red('\nNope!'));
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
  printTitle();
  const file = 'words.txt';
  const schema = {
    properties: {
      username: {
        description: magentaBright('Username'),
        pattern: /^[a-z]{3,10}$/,
        message: 'Name must be 3-10 characters and lowercase letters',
        required: true,
      },
      difficulty: {
        description: magentaBright('Difficulty (1-10)'),
        pattern: /^([1-9]|10)$/,
        message: 'Difficulty must be a number between 1 and 10',
        required: true,
      },
    },
  };

  prompt.message = red('Enter');
  prompt.delimiter = '❤️ ';
  prompt.start();

  prompt.get(schema, (err, result) => {
    if (err) {
      console.log('Bye Homie');
      return;
    }
    const user = new User(result.username, result.difficulty);
    if (!existsSync(file) || !checkFileDifficulty(file, user.difficulty)) {
      getWords(file, user);
    } else {
      gameLoop(file, user);
    }
  });
}

hangman();
