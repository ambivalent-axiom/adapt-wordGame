/* eslint-disable indent */
/* eslint-disable multiline-ternary */
import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function wordHints(props) {
  const {
    wordsToFindText,
    selectedWords,
    _foundWords,
    currentWord,
    missedWords,
    _wordgame: {
      theme
    }
  } = props;
  return (
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
            style={{
              backgroundColor: // eslint is fucking up here, these conditions should not be nested
                missedWords?.has(text) ? theme.wrong :
                _foundWords?.has(text) ? theme.secondary :
                ''
            }}
          >
            {hint}
          </span>
        ))}
      </div>
    </div>
  );
}
