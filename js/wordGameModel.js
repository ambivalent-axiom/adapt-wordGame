import ComponentModel from 'core/js/models/componentModel';

class WordGameModel extends ComponentModel {

  defaults() {
    return {
      ...super.defaults(),
      _isComplete: false,
      _score: 0,
      _isModal: true,
      _maxScore: 100,
      _minScore: 0
    };
  }

  initialize(...args) {
    super.initialize(...args);
    this.setupWords();
  }

  setupWords() {
    const words = this.get('_word-game').words;
    // Initialize word tracking
    this._foundWords = new Set();
    this._totalWords = words.length;
  }

  reset(type = 'hard') {
    if (type === 'hard') {
      this.set({
        _isComplete: false,
        _score: 0
      });
      this._foundWords.clear();
    }

    // Trigger reset event for view
    this.trigger('reset');
  }

  // Calculate score based on number of words found
  setScore() {
    const currentProgress = this._foundWords.size / this._totalWords;
    const score = Math.round(currentProgress * this.get('_maxScore'));
    this.set('_score', score);
  }

  // Handle successful word find
  onWordFound(word) {
    if (this._foundWords.has(word)) return;

    this._foundWords.add(word);
    this.setScore();

    // Check if all words are found
    if (this._foundWords.size === this._totalWords) {
      this.onGameComplete();
    }
  }

  // Handle game completion
  onGameComplete() {
    this.set('_isComplete', true);
    this.setCompletionStatus();

    // Trigger completion event
    this.trigger('complete');
  }

  // Handle game win
  onGameWon() {
    this.setScore();
    this.onGameComplete();
  }

  /**
   * Returns whether component should be reset when revisited
   * @return {boolean}
   */
  get _shouldResetOnRevisit() {
    return this.get('_isResetOnRevisit');
  }

  /**
   * Returns whether this component is complete
   * @return {boolean}
   */
  get _isComplete() {
    return this.get('_isComplete');
  }

  /**
   * Returns any accessibility text for this component
   * @return {string}
   */
  get _ariaText() {
    return this.get('globals')?.ariaRegion || '';
  }
}

export default WordGameModel;
