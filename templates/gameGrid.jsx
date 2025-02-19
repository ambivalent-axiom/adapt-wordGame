import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function gameGrid(props) {
  const {
    _wordgame: {
      theme
    },
    wrongLetters,
    selectedLetters,
    guessedLetters,
    _isComplete,
    grid,
    handleLetterClick,
    restartGame
  } = props;

  return (
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
                    ? theme.wrong // Red for wrong letters
                    : theme.primary,
                color: wrongLetters.has(`${x}-${y}`) ? theme.wrongText : theme.text
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
  );
}
