import ComponentModel from 'core/js/models/componentModel';
import notify from 'core/js/notify';

class WordGameModel extends ComponentModel {

  initialize(...args) {
    super.initialize(...args);
    this.setupWords();
  }

  setupWords() {
    this._foundWords = new Set(); // Initialize word tracking
    this.set('_foundWords', this._foundWords);
    this.set('_score', 0);
    this._totalWords = this.get('maxWordsPerGame');
  }

  reset() {
    this.set({
      _isComplete: false,
      _score: 0
    });
    this._foundWords.clear();
    this.trigger('reset'); // Trigger reset event for view
  }

  setScore() { // Calculate score based on number of words correctly found
    const score = this.get('_score') + 1;
    this.set('_score', score);
  }

  onWordFound(word, wordCorrect) {
    if (this._foundWords.has(word)) return;

    this._foundWords.add(word);
    this.set('_foundWords', this._foundWords);
    if (wordCorrect) { // add score only if player found the currentWord
      this.setScore();
    }
    // Check if all words are found
    if (this._foundWords.size === this._totalWords) {
      this.onGameComplete();
    }
  }

  onGameComplete() {
    this.set({
      _score: this._score,
      _isComplete: true,
      _isInteractionComplete: true
    });
    this.setCompletionStatus();

    const feedback = this.get('_feedback');
    if (feedback?._isEnabled) {
      notify.popup({
        title: feedback.complete.title,
        body: feedback.complete.body
      });
    }

    this.trigger('complete'); // Trigger completion event
  }

  get _shouldResetOnRevisit() { return this.get('_isResetOnRevisit'); }
  get _isComplete() { return this.get('_isComplete'); }
  get _ariaText() { return this.get('globals')?.ariaRegion || ''; }
}

export default WordGameModel;
