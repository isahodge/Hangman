import { readFileSync, writeFileSync, existsSync } from 'fs';

/*
** Stores the current user score if it's in the top ten recorded, sorts the leaderboard by score,
** and prints it.
*/

export default function printLeaderboard(user) {
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
