import React, { useState, useEffect } from 'react';
import { classes } from 'core/js/reactHelpers';
import { start } from 'extensions/adapt-contrib-spoor/js/scorm/cookieLMS';

export default function WordGame(props) {
  const {
    displayTitle,
    titleDescription,
    startText,
    wordsToFindText,
    description,
    maxWordsPerGame,
    gridSize,
    onClickSound,
    onCorrectSound,
    onWrongSound,
    onFinishSound,
    _isComplete,
    _customModal,
    _score,
    _wordgame: {
      words,
      decoys,
      theme
    },
    _foundWords,
    onWordFound,
    reset
  } = props;

  const [gameStarted, setGameStarted] = useState(false);
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
    if (!gameStarted) {
      selectWords(); // First we must select words even before game has started
    }
    if (gameStarted) {
      generateGrid(); // Now lets generate grid
    }
  }, [gameStarted]);

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
    // Check if letter is already selected - if so, remove it
    const existingIndex = selectedLetters.findIndex(l => l.x === x && l.y === y);
    if (existingIndex !== -1) {
      const newSelectedLetters = selectedLetters.filter((_, index) => index !== existingIndex);
      setSelectedLetters(newSelectedLetters);
      return;
    }

    const letter = grid[x][y];
    const newSelectedLetters = [...selectedLetters, { letter, x, y }];
    setSelectedLetters(newSelectedLetters);

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
  };

  const restartGame = () => {
    setGuessedLetters([]);
    setSelectedLetters([]);
    setMissedWords(new Set());
    setTimeout(setGameStarted(false), 500);
    reset(); // perform reset at Adapt model level
    setTimeout(setGameStarted(true), 500);
    setTimeout(selectWords(), 500);
    setTimeout(generateGrid(), 500);
  };

  if (!gameStarted) {
    return (
      <div className="word-game__start">
        <span className='word-game__start-title'>{displayTitle}</span>
        <p className="word-game__start-description">{titleDescription}</p>
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
      <div
        className='word-game__customModal'
        style={{
          visibility: _isComplete && _customModal._isEnabled ? 'visible' : 'hidden'
        }}
      >
        <div className='word-game__customModal-content'>
          <h2 className='word-game__customModal-title'>
            {_score === maxWordsPerGame
              ? _customModal.complete?.title
              : _score > 0
                ? _customModal.incomplete?.title
                : _customModal.failed?.title
            }
          </h2>
          <p className='word-game__customModal-body'>
            {_score === maxWordsPerGame
              ? _customModal.complete?.body
              : _score > 0
                ? _customModal.incomplete?.body
                : _customModal.failed?.body
            }
          </p>
          <div className='word-game__customModal-score'>
            {_customModal?.score} {_score}
          </div>
          <button
            className='word-game__customModal-button'
            onClick={() => {
              const modalElement = document.querySelector('.word-game__customModal');
              if (modalElement) {
                modalElement.style.visibility = 'hidden';
              }
            }}
          >
            {_customModal?.buttonText}
          </button>
        </div>
      </div>
      <div className="word-game__body--text">
        <p>{description}</p>
      </div>
      <div className="word-game__grid" style={{ color: theme.text }}>
        {grid.map((row, x) => (
          <div key={x} className="word-game__row">
            {row.map((letter, y) => (
              <button
                key={`${x}-${y}`}
                className={classes([
                  'word-game__letter',
                  selectedLetters.some(l => l.x === x && l.y === y) ? 'word-game__letter--selected' : '',
                  wrongLetters.has(`${x}-${y}`) ? 'word-game__letter--wrong' : ''
                ])}
                onClick={() => handleLetterClick(x, y)}
                style={{ // change to light background if selected or if word is guessed
                  backgroundColor: selectedLetters.some(l => l.x === x && l.y === y) || guessedLetters.some(l => l.x === x && l.y === y)
                    ? theme.secondary
                    : wrongLetters.has(`${x}-${y}`)
                      ? '#ff0000' // Red for wrong letters
                      : theme.primary,
                  color: wrongLetters.has(`${x}-${y}`) ? 'white' : theme.text
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
        <div
          className='word-game__reset'>
          <button
            className='word-game__reset-button'
            onClick={() => restartGame()}
            style={{
              backgroundColor: theme.secondary,
              visibility: _isComplete ? 'visible' : 'hidden'
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="word-game__words">
        <h3>{wordsToFindText}</h3>
        <div className="word-game__words-list">
          {selectedWords.map(({ text, hint }) => (
            <span
              key={text}
              className={classes([
                'word-game__word',
                _foundWords?.has(text) ? 'word-game__word--found' : '',
                currentWord.text === text ? 'word-game__word--current' : '',
                missedWords?.has(text) ? 'word-game__word--missed' : ''
              ])}
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
