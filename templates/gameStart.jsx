import React from 'react';

export default function GameStart(props) {
  const {
    displayTitle,
    titleDescription,
    startText,
    startGame
  } = props;

  return (
    <div className="word-game__start">
      <span className="word-game__start-title">{displayTitle}</span>
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
