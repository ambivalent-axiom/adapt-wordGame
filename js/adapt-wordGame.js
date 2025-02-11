import components from 'core/js/components';
import WordGameView from './wordGameView';
import WordGameModel from './wordGameModel';

export default components.register('wordgame', {
  model: WordGameModel,
  view: WordGameView
});
