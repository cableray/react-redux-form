import React from 'react';
import { assert } from 'chai';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import TestUtils from 'react-addons-test-utils';

import { Field, formReducer, modelReducer, track } from '../src';

const state = {
  deep: {
    deeper: [
      { id: 1, value: 'foo' },
      { id: 2, value: 'bar' },
    ],
  },
};

describe('track() function', () => {
  it('should exist as a function', () => {
    assert.ok(track);
    assert.isFunction(track);
  });

  it('should return a function given a model and a predicate', () => {
    const predicate = (val) => val.id === 1;

    const tracker = track('foo.bar', predicate);

    assert.isFunction(tracker);
  });

  it('should return a tracker that returns the first relevant model', () => {
    const predicate = (val) => val.id === 2;

    const tracker = track('deep.deeper', predicate);
    const actual = tracker(state);

    assert.equal(actual, 'deep.deeper.1');
  });

  it('should return a tracker with Lodash predicate shorthands', () => {
    const tracker = track('deep.deeper', { id: 2 });
    const actual = tracker(state);

    assert.equal(actual, 'deep.deeper.1');
  });
});

describe('track() with <Field model="...">', () => {
  const store = applyMiddleware(thunk)(createStore)(combineReducers({
    testForm: formReducer('test'),
    test: modelReducer('test', state),
  }));

  const field = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <Field model={track('test.deep.deeper[].value', { id: 2 })}>
        <input type="text" />
      </Field>
    </Provider>
  );

  const input = TestUtils.findRenderedDOMComponentWithTag(field, 'input');

  it('should successfully change the proper model', () => {
    input.value = 'testing';
    TestUtils.Simulate.change(input);

    assert.deepEqual(
      store.getState().test.deep.deeper[1],
      { id: 2, value: 'testing' });
  });
});
