import { hangman } from './chalkColors';

export default function printHangman(wrong) {
  let head = 1;
  let armL = 2;
  let body1 = 3;
  let armR = 4;
  let body2 = 3;
  let legL = 5;
  let legR = 6;
  head = head <= wrong ? 'O' : ' ';
  body1 = body1 <= wrong ? '|' : ' ';
  body2 = body2 <= wrong ? '|' : ' ';
  armL = armL <= wrong ? '/' : ' ';
  legL = legL <= wrong ? '/' : ' ';
  armR = armR <= wrong ? '\\' : ' ';
  legR = legR <= wrong ? '\\' : ' ';
  console.log(hangman('   _________     '));
  console.log(hangman(`   |        ${head}    `));
  console.log(hangman(`   |       ${armL}${body1}${armR}   `));
  console.log(hangman(`   |        ${body2}    `));
  console.log(hangman(`   |       ${legL} ${legR}   `));
  console.log(hangman('   |             '));
  console.log(hangman('   |             '));
  console.log(hangman('   |             '));
  console.log(hangman('  _|_            '));
}
