import ComponentView from 'core/js/views/componentView';
import React from 'react';
import ReactDOM from 'react-dom';
import WordGame from './wordGameModel';

class WordGameView extends ComponentView {

  initialize(...args) {
    super.initialize(...args);
    this.listenTo(this.model.getChildren(), {
      'change:_isComplete': this.onWordFound,
      'change:_isCorrect': this.onGameComplete
    });
  }

  preRender() {
    this.checkIfResetOnRevisit();
  }

  postRender() {
    this.renderReactComponent();
  }

  renderReactComponent() {
    const props = {
      ...this.model.toJSON(),
      onGameWon: () => this.onGameWon()
    };

    ReactDOM.render(<WordGame {...props} />, this.el);
  }

  onWordFound(item) {
    if (!item.get('_isComplete')) return;

    // Trigger sound effect if configured
    this.playFeedback(item);
  }

  onGameComplete() {
    // Mark component as complete in the data
    this.model.markCompleted();
    this.model.setScore();

    // Trigger completion animation if configured
    this.$('.word-game').addClass('is-complete');
  }

  onGameWon() {
    this.model.onGameWon();
  }

  playFeedback(item) {
    if (item.get('_feedback') && item.get('_feedback')._audio) {
      Adapt.trigger('audio:playFeedback', item.get('_feedback')._audio);
    }
  }

  checkIfResetOnRevisit() {
    const isResetOnRevisit = this.model.get('_isResetOnRevisit');

    // If reset is enabled set defaults
    if (isResetOnRevisit) {
      this.model.reset(isResetOnRevisit);
    }
  }

  remove() {
    ReactDOM.unmountComponentAtNode(this.el);
    super.remove();
  }
}

WordGameView.template = 'wordGame.jsx';

export default WordGameView;
