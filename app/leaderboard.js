import { readFileSync, writeFileSync, existsSync } from 'fs';
import { pink, pinkInvert, brightPink, basic } from './chalkColors';
import printj from 'printj';

/*
** Stores the current user score if it's in the top ten recorded, sorts the leaderboard by score,
** and prints it.
*/

function printLeaderboard(lb) {
  const sprintf = printj.sprintf;
  console.log('┍––––––––––––––––––––––––––––––––––––––––––––––┑');
  console.log(basic('│') + brightPink(sprintf('%19sLeaderboard%16s', ' ', ' ')) + basic('│'));
  console.log(basic('│') + brightPink(sprintf('   User      Score  Difficulty   Date         ')) + basic('│'));
  for (let i = 0; i < lb.leaderboard.length; i += 1) {
    const userInfo = lb.leaderboard[i];
    if (i % 2) {
      console.log(basic('│') + pink(sprintf('%3s%-10s   %-4d   %2d   %11s   ', ' ', userInfo.name, userInfo.score, userInfo.difficulty, userInfo.date)) + basic('│'));
    }
    else
      console.log(basic('│') + pinkInvert(sprintf('%3s%-10s   %-4d   %2d   %11s   ', ' ', userInfo.name, userInfo.score, userInfo.difficulty, userInfo.date)) + basic('│'));
  }
  console.log('┕––––––––––––––––––––––––––––––––––––––––––––––┙');
}

export default function leaderboard(user) {
  console.log(`        Your score: ${user.score}`);
  const file = 'leaderBoard.txt';
  let date = new Date();
  date = date.toDateString();
  const userObj = {
    name: user.name,
    score: user.score,
    difficulty: user.difficulty,
    date,
  };
  let lb;
  if (!existsSync(file)) {
    lb = { leaderboard: [userObj] };
  } else {
    lb = JSON.parse(readFileSync(file));
    lb.leaderboard.push(userObj);
    lb.leaderboard.sort((a, b) => b.score - a.score);
    if (lb.leaderboard.length > 10) {
      lb.leaderboard.splice(9, 1);
    }
  }
  const lbStr = JSON.stringify(lb);
  writeFileSync(file, lbStr);
  printLeaderboard(lb);
}
