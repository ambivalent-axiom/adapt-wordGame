import React from 'react';
import { templates } from 'core/js/reactHelpers';

export default function WordGame(props) {
  return (
    <div className='component__inner wordgame__inner'>
      <templates.header {...props} />
    </div>
  );
}
