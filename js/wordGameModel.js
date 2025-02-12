import ComponentModel from 'core/js/models/componentModel';
import notify from 'core/js/notify';

class WordGameModel extends ComponentModel {

  initialize(...args) {
    super.initialize(...args);
    this.setupWords();
  }

  setupWords() {
    const words = this.get('_wordgame').words;
    this._foundWords = new Set(); // Initialize word tracking
    this._totalWords = words.length;
  }

  setupAssessment() {
    if (!this.get('_assessment') || !this.get('_assessment')._isEnabled) return;
    this.setupQuestionModel();
  }

  reset() {
    this.set({
      _isComplete: false,
      _score: 0
    });
    this._foundWords.clear();
    this.trigger('reset'); // Trigger reset event for view
  }

  setScore() { // Calculate score based on number of words found
    const currentProgress = this._foundWords.size / this._totalWords;
    const score = Math.round(currentProgress * this.get('_maxScore'));
    this.set('_score', score);
  }

  onWordFound(word) {
    if (this._foundWords.has(word)) return;

    this._foundWords.add(word);
    this.set('_foundWords', this._foundWords);
    this.setScore();
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
