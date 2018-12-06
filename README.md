# Hangman

Definition of the Hangman game taken from Wikepedia:
>Hangman is a paper and pencil guessing game for two or more players. One player thinks of a word, phrase or sentence and the other(s) tries to guess it by suggesting letters or numbers, within a certain number of guesses.

In my reimplementation of the game, there are two rules.
..* There are 6 wrong guesses per word to guess the full word.
..* Full word attempts can be made by entering the word _guess_ first, then the full word.

### Build
```npm install```
```npm run build```
```node lib/index```

This game was made using Node.js and transpiled with Babel 7. Make sure you have the latest version of Node installed.