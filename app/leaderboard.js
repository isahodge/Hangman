import { readFileSync, writeFileSync, existsSync } from 'fs';
import { pink, pinkInvert, brightPink, basic } from './chalkColors';
import printj from 'printj';

/*
** Stores the current user score if it's in the top ten recorded, sorts the leaderboard by score,
** and prints it.
*/

//store all user information
//manually sort leaderboard

export default function printLeaderboard(user) {
  console.log(`Your score: ${user.score}`);
  const file = 'leaderBoard.txt';
  const sprintf = printj.sprintf;
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
  console.log('┍––––––––––––––––––––––––––––––––––––––––––––––┑');
  console.log(basic('│') + brightPink(sprintf('%19sLeaderboard%16s', ' ', ' ')) + basic('│'));
  console.log(basic('│') + brightPink(sprintf('%10sUser      Score    Difficulty%7s', ' ', ' ')) + basic('│'));
  for (let i = 0; i < lb.leaderboard.length; i += 1) {
    const userInfo = lb.leaderboard[i];
    if (i % 2) {
      console.log(basic('│') + pink(sprintf('%10s%-10s   %-4d   %-2d%14s', ' ', userInfo.name, userInfo.score, userInfo.difficulty, ' ')) + basic('│'));
    }
    else
      console.log(basic('│') + pinkInvert(sprintf('%10s%-10s   %-4d   %-2d%14s', ' ', userInfo.name, userInfo.score, userInfo.difficulty, ' ')) + basic('│'));
  }
  console.log('┕––––––––––––––––––––––––––––––––––––––––––––––┙');
}
