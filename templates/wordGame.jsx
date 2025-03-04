import React, { useState, useEffect } from 'react';
import { templates } from 'core/js/reactHelpers';

export default function WordGame(props) {
  const {
    description,
    maxWordsPerGame,
    gridSize,
    onClickSound,
    onCorrectSound,
    onWrongSound,
    onFinishSound,
    _isComplete,
    _wordgame: {
      words,
      decoys
    },
    _foundWords,
    onWordFound,
    reset
  } = props;

  const [gameStarted, setGameStarted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]); // letters user has clicked
  const [selectedWords, setSelectedWords] = useState([]); // Words selected for the current game
  const [guessedLetters, setGuessedLetters] = useState([]); // To track guessed letters and apply CSS
  const [currentWord, setCurrentWord] = useState(null); // sinle Object
  const [allWordPositions, setAllWordPositions] = useState({}); // get currentWord letters to see if match
  const [missedWords, setMissedWords] = useState(new Set()); // to track missed attmepts
  const [wrongLetters, setWrongLetters] = useState(new Set()); // for React animations
  const [grid, setGrid] = useState([]);
  const GRID_SIZE = gridSize;
  const clickSound = new Audio(onClickSound);
  const successSound = new Audio(onCorrectSound);
  const errorSound = new Audio(onWrongSound);
  const finishSound = new Audio(onFinishSound);

  useEffect(() => {
    if (!isResetting && !gameStarted) {
      selectWords(); // First we must select words even before game has started
    }
  }, [isResetting, gameStarted]);

  useEffect(() => {
    if (!isResetting && gameStarted && selectedWords.length > 0) {
      generateGrid(); // Now lets generate grid
    }
  }, [isResetting, gameStarted, selectedWords]);

  useEffect(() => {
    if (selectedWords.length > 0) {
      selectCurrentWord(); // Last - take the current word for game.
    }

    if (_isComplete) { // play finishing sound if game is completed
      playSound(finishSound);
    }
  }, [selectedWords, _foundWords, gameStarted, _isComplete]);

  const playSound = (audio) => {
    audio.currentTime = 0;
    try {
      audio.play().catch(error => console.log('Error playing sound:', error));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const selectCurrentWord = () => {
    let remainingWords = selectedWords;
    if (_foundWords && _foundWords.size > 0) {
      remainingWords = selectedWords.filter(selectedWord => !_foundWords.has(selectedWord.text));
    }

    if (remainingWords.length > 0) {
      setCurrentWord(remainingWords[0]);
    }
  };

  const selectWords = () => { // select random words for current game
    const selectedWords = [...words]
      .sort(() => Math.random() - 0.5) // Randomize words
      .slice(0, Math.min(maxWordsPerGame, words.length)); // Select random subset based on maxWordsPerGame

    setSelectedWords(selectedWords); // set selected words globally available
  };

  const generateGrid = () => {
    const newGrid = Array(GRID_SIZE).fill()
      .map(() => Array(GRID_SIZE).fill(''));

    // Object to store positions for all words
    const wordPositions = {};

    // Place all selected words and track their positions
    selectedWords.forEach(({ text }) => {
      const positions = placeWord(text, newGrid);
      wordPositions[text] = positions;
    });

    // Place decoys and track their positions if decoys are provided
    if (decoys) {
      decoys.forEach(({ text }) => {
        const positions = placeWord(text, newGrid);
        wordPositions[text] = positions;
      });
    }

    // Fill remaining spaces with random letters
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setAllWordPositions(wordPositions);
  };

  const placeWord = (word, grid) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1] // diagonal
    ];

    let positions = new Set();
    let placed = false;

    while (!placed) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startX = Math.floor(Math.random() * (GRID_SIZE - word.length * direction[0]));
      const startY = Math.floor(Math.random() * (GRID_SIZE - word.length * direction[1]));

      if (canPlaceWord(word, startX, startY, direction, grid)) {
        positions = new Set(); // Reset positions for successful placement
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * direction[0];
          const y = startY + i * direction[1];
          grid[x][y] = word[i];
          positions.add(`${x}-${y}`);
        }
        placed = true;
      }
    }

    return positions;
  };

  const canPlaceWord = (word, startX, startY, direction, grid) => {
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * direction[0];
      const y = startY + i * direction[1];
      if (grid[x][y] !== '' && grid[x][y] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  const handleLetterClick = (x, y) => {

    playSound(clickSound);
    let newSelectedLetters;

    const guessedIndex = guessedLetters.findIndex(l => l.x === x && l.y === y);
    const existingIndex = selectedLetters.findIndex(l => l.x === x && l.y === y);

    if (existingIndex !== -1) { // Check if letter is already selected - if so, remove it
      newSelectedLetters = selectedLetters.filter((_, index) => index !== existingIndex);
    } else if (guessedIndex !== -1) { // Check if letter is already in guessed letters - if so: skip
      return;
    } else { // else proceed with adding the letter to an array
      const letter = grid[x][y];
      newSelectedLetters = [...selectedLetters, { letter, x, y }];
    }

    setSelectedLetters(newSelectedLetters); // update selected letters

    // Get the required positions for the current word
    const requiredPositions = currentWord ? allWordPositions[currentWord.text] : new Set();

    // Check if selected positions match current word positions
    const selectedPositions = new Set(newSelectedLetters.map(l => `${l.x}-${l.y}`));
    const hasCorrectLength = newSelectedLetters.length === currentWord?.text.length;

    // Check if all selected positions match the required positions
    const wordMatch = hasCorrectLength && requiredPositions &&
      Array.from(requiredPositions).every(pos => selectedPositions.has(pos));

    const anyWordMatch = Object.values(allWordPositions).some(wordPositions =>
      selectedPositions.size === wordPositions.size &&
        Array.from(wordPositions).every(pos => selectedPositions.has(pos))
    );

    if (wordMatch) { // in case if precise match
      setGuessedLetters( // collect these to mark guessed in CSS
        guessedLetters => guessedLetters.concat(newSelectedLetters)
      );
      onWordFound(currentWord?.text, true);
      setSelectedLetters([]);
      selectCurrentWord();
      playSound(successSound);
      return;
    }

    if (anyWordMatch) { // in case if he has a match but wrong word selected
      onWordFound(currentWord?.text, false);
      playSound(errorSound);
      setMissedWords(prev => {
        const newSet = new Set(prev);
        newSet.add(currentWord.text);
        return newSet;
      });
      setWrongLetters(new Set(newSelectedLetters.map(l => `${l.x}-${l.y}`)));
      setTimeout(() => {
        setWrongLetters(new Set());
      }, 1000);

      setSelectedLetters([]);
      selectCurrentWord();
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeout(() => {
      const gameGrid = document.querySelector('.word-game__body--text');
      if (gameGrid) {
        gameGrid.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const restartGame = async () => {
    setIsResetting(true);

    setGuessedLetters([]);
    setSelectedLetters([]);
    setMissedWords(new Set());

    reset(); // Reset at model level

    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for state to clear
    selectWords(); // Select new words
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for words to be selected

    generateGrid(); // Generate new grid and start game
    setIsResetting(false);
  };

  if (!gameStarted) {
    return ( // provide the intro and start button for player
      <templates.gameStart {...{ ...props, startGame }} />
    );
  }
  return ( // main component for game
    <div className="word-game">
      <templates.customModal {...props} />

      <div className="word-game__body--text">
        <p>{description}</p>
      </div>

      <templates.wordHints {...{
        ...props,
        selectedWords,
        currentWord,
        missedWords
      }} />

      <templates.gameGrid {...{
        ...props,
        handleLetterClick,
        restartGame,
        grid,
        guessedLetters,
        selectedLetters,
        wrongLetters
      }} />
    </div>
  );
}
