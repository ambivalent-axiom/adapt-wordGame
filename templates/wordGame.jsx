import React, { useState, useEffect } from 'react';
import { classes } from 'core/js/reactHelpers';

export default function WordGame(props) {
  const {
    _isModal,
    startText,
    wordsToFindText,
    description,
    resetButton,
    _wordgame: {
      words,
      theme
    },
    _foundWords,
    onWordFound
  } = props;

  const [gameStarted, setGameStarted] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [selectedWord, setSelectedWord] = useState('');
  const [grid, setGrid] = useState([]);
  const GRID_SIZE = 8;

  useEffect(() => {
    if (gameStarted) {
      generateGrid();
    }
  }, [gameStarted]);

  const generateGrid = () => {
    // Create empty grid
    const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''));

    // Place words in grid
    words.forEach(({ text }) => {
      placeWord(text, newGrid);
    });

    // Fill remaining spaces with random letters
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
  };

  const placeWord = (word, grid) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1] // diagonal
    ];

    let placed = false;
    while (!placed) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const startX = Math.floor(Math.random() * (GRID_SIZE - word.length * direction[0]));
      const startY = Math.floor(Math.random() * (GRID_SIZE - word.length * direction[1]));

      if (canPlaceWord(word, startX, startY, direction, grid)) {
        placeWordAt(word, startX, startY, direction, grid);
        placed = true;
      }
    }
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

  const placeWordAt = (word, startX, startY, direction, grid) => {
    for (let i = 0; i < word.length; i++) {
      const x = startX + i * direction[0];
      const y = startY + i * direction[1];
      grid[x][y] = word[i];
    }
  };

  const handleLetterClick = (x, y) => {
    const letter = grid[x][y];
    setSelectedLetters([...selectedLetters, { letter, x, y }]);
    // Check if selected letters form a word
    const selectedWord = selectedLetters.map(l => l.letter).join('') + letter;
    setSelectedWord(selectedWord);
    const wordMatch = words.find(w => w.text === selectedWord); // undefined or obj

    if (wordMatch) {
      onWordFound(selectedWord);
      setSelectedLetters([]);
      setSelectedWord('');
    }
  };

  const handleReset = () => {
    setSelectedLetters([]);
    setSelectedWord('');
  };

  const startGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted && _isModal) {
    return (
      <div className="word-game__start">
        <button
          className="word-game__start-button"
          onClick={startGame}
        >
          {startText}
        </button>
      </div>
    );
  }

  return (
    <div className="word-game">
      <div className="word-game__body--text">
        <p>{description}</p>
      </div>
      <div className="word-game__grid" style={{ color: theme.text }}>
        <div className="word-game__selected-word" style={{ color: theme.word }}>
          <p>{selectedWord}</p>
        </div>
        {grid.map((row, x) => (
          <div key={x} className="word-game__row">
            {row.map((letter, y) => (
              <button
                key={`${x}-${y}`}
                className={classes([
                  'word-game__letter',
                  selectedLetters.some(l => l.x === x && l.y === y) ? 'word-game__letter--selected' : ''
                ])}
                onClick={() => handleLetterClick(x, y)}
                style={{
                  backgroundColor: selectedLetters.some(l => l.x === x && l.y === y)
                    ? theme.secondary
                    : theme.primary,
                  color: theme.text
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div className="word-game__reset">
          <button
            className="word-game__reset-button"
            onClick={() => handleReset()}
          >
            {resetButton}
          </button>
        </div>
      </div>

      <div className="word-game__words">
        <h3>{wordsToFindText}</h3>
        {words.map(({ text, hint }) => (
          <span
            key={text}
            className={classes([
              'word-game__word',
              _foundWords?.has(text) ? 'word-game__word--found' : ''
            ])}
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}
