/* eslint-disable indent */
/* eslint-disable multiline-ternary */
import React from 'react';
import { classes } from 'core/js/reactHelpers';

export default function wordHints(props) {
  const {
    wordsToFindText,
    selectedWords = [],
    _foundWords,
    currentWord = null,
    missedWords,
    _wordgame: {
      theme = {}
    } = {}
  } = props;

  // Early return if selectedWords is not an array or is empty
  if (!Array.isArray(selectedWords) || selectedWords.length === 0) {
    return (
      <div className="word-game__words">
        <h3>{wordsToFindText}</h3>
        <div className="word-game__words-list">
          <span>Loading words...</span>
        </div>
      </div>
    );
  }

  // Safe access to foundWords and missedWords
  const foundWordsSet = _foundWords instanceof Set ? _foundWords : new Set();
  const missedWordsSet = missedWords instanceof Set ? missedWords : new Set();

  return (
    <div className="word-game__words">
      <h3>{wordsToFindText}</h3>
      <div className="word-game__words-list">
        {selectedWords.map(item => {
          // Safely handle null or undefined items
          if (!item) return null;
          
          const { text = '', hint = '' } = item;
          
          // Safely check if current word matches
          const isCurrentWord = currentWord && currentWord.text === text;
          
          return (
            <span
              key={text}
              className={classes([
                'word-game__word',
                foundWordsSet.has(text) ? 'word-game__word--found' : '',
                isCurrentWord ? 'word-game__word--current' : '',
                missedWordsSet.has(text) ? 'word-game__word--missed' : ''
              ])}
              style={{
                backgroundColor: 
                  missedWordsSet.has(text) ? (theme?.wrong || '') :
                  foundWordsSet.has(text) ? (theme?.secondary || '') :
                  ''
              }}
            >
              {hint}
            </span>
          );
        })}
      </div>
    </div>
  );
}