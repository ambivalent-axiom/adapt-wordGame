import ComponentView from 'core/js/views/componentView';
import ReactDOM from 'react-dom';

class WordGameView extends ComponentView {

  initialize(...args) {
    super.initialize(...args);
    this.model.set({
      onGameWon: () => this.model.onGameComplete(),
      onWordFound: (word, wordCorrect) => this.model.onWordFound(word, wordCorrect)
    });
  }

  preRender() {
    this.checkIfResetOnRevisit();
  }

  postRender() {
    this.setReadyStatus(); // Remember to set it ready in postrender so it does not load forever.
  }

  checkIfResetOnRevisit() {
    const isResetOnRevisit = this.model.get('_isResetOnRevisit');
    if (isResetOnRevisit) { // If reset is enabled set defaults
      this.model.reset(isResetOnRevisit);
    }
  }

  remove() {
    const container = this.$('.word-game__container')[0];
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
    }
    super.remove();
  }
}

WordGameView.template = 'wordGame.jsx';
export default WordGameView;
