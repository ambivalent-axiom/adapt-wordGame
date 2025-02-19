import React from 'react';

export default function customModal(props) {
  const {
    _isComplete,
    _score,
    maxWordsPerGame,
    customModal
  } = props;
  return (
    <div
      className='word-game__customModal'
      style={{
        visibility: _isComplete && customModal?._isEnabled ? 'visible' : 'hidden'
      }}
    >
      <div className='word-game__customModal-content'>
        <h2 className='word-game__customModal-title'>
          {_score === maxWordsPerGame
            ? customModal?.complete?.title
            : _score > 0
              ? customModal?.incomplete?.title
              : customModal?.failed?.title
          }
        </h2>
        <div
          className='word-game__customModal-body'
          dangerouslySetInnerHTML={{ // This is so description can be formatted from Adapt side
            __html: _score === maxWordsPerGame
              ? customModal?.complete?.body
              : _score > 0
                ? customModal?.incomplete?.body
                : customModal?.failed?.body
          }}
        />
        <div className='word-game__customModal-score'>
          {customModal?.score} {_score}
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
          {customModal?.buttonText}
        </button>
      </div>
    </div>
  );
};
