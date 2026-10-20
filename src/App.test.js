import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from './App';

let div;
beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  div = document.createElement('div');
  document.body.appendChild(div);
});
afterEach(() => {
  ReactDOM.unmountComponentAtNode(div);
  div.remove();
  jest.useRealTimers();
});

const render = () => act(() => { ReactDOM.render(<App />, div); });
const click = (el) => act(() => { el.click(); });
const advance = () => act(() => { jest.runAllTimers(); });

const modeButton = (label) =>
  [...div.querySelectorAll('.modeToggle button')].find((b) => b.textContent === label);
const cards = () => [...div.querySelectorAll('.card')];
const cardSrc = (card) => card.querySelector('.cardFront img').getAttribute('src');
const scores = () => [...div.querySelectorAll('.scorebox dd')].slice(0, 2).map((dd) => Number(dd.textContent));
const livesLeft = () => div.querySelectorAll('.life:not(.spent)').length;

// Indexes of one matching pair and one mismatched pair on the current board
function findPairs() {
  const srcs = cards().map(cardSrc);
  const a = 0;
  const match = srcs.indexOf(srcs[a], a + 1);
  const miss = srcs.findIndex((src) => src !== srcs[a]);
  return { a, match, miss };
}

it('renders without crashing', () => {
  render();
});

it('deals 8 pairs face down in classic mode', () => {
  render();
  click(modeButton('Classic'));
  const srcs = cards().map(cardSrc);
  expect(srcs).toHaveLength(16);
  expect(new Set(srcs).size).toBe(8);
  expect(div.querySelectorAll('.card.faceUp')).toHaveLength(0);
  expect(livesLeft()).toBe(5);
});

it('keeps a matching pair face up and scores it', () => {
  render();
  click(modeButton('Classic'));
  const { a, match } = findPairs();
  click(cards()[a]);
  click(cards()[match]);
  advance();
  expect(cards()[a].classList).toContain('faceUp');
  expect(cards()[match].classList).toContain('faceUp');
  expect(scores()).toEqual([1, 1]);
  expect(livesLeft()).toBe(5);
});

it('flips a mismatched pair back and loses a life', () => {
  render();
  click(modeButton('Classic'));
  const { a, miss } = findPairs();
  click(cards()[a]);
  click(cards()[miss]);
  expect(div.querySelectorAll('.card.faceUp')).toHaveLength(2);
  advance();
  expect(div.querySelectorAll('.card.faceUp')).toHaveLength(0);
  expect(livesLeft()).toBe(4);
});

it('starts a new game after losing all 5 lives', () => {
  render();
  click(modeButton('Classic'));
  for (let i = 0; i < 5; i++) {
    const { a, miss } = findPairs();
    click(cards()[a]);
    click(cards()[miss]);
    advance();
  }
  expect(livesLeft()).toBe(5);
  expect(scores()[1]).toBe(0);
});

it('remembers each mode\'s high score separately and saves it', () => {
  render();
  click(modeButton('Classic'));
  const { a, match } = findPairs();
  click(cards()[a]);
  click(cards()[match]);

  click(modeButton('New'));
  expect(scores()).toEqual([0, 0]);

  click(modeButton('Classic'));
  expect(scores()).toEqual([1, 0]);

  const saved = JSON.parse(localStorage.getItem('megaMatch'));
  expect(saved).toEqual({ mode: 'classic', highScores: { classic: 1, new: 0 } });
});
