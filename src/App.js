import React, { Component } from 'react';
import './App.css';
import icons from './icons.json';
import Icon from './components/Icon';
import Card from './components/Card';

// Resolve files in public/ against the app's base URL so they load
// whether or not the page URL has a trailing slash
const asset = (path) => `${process.env.PUBLIC_URL}/${path}`;

const menuType = {
  start: "assets/images/start.png",
  correct: "assets/images/correct.png",
  incorrect: "assets/images/incorrect.png"
};

const menuAlt = {
  start: "Click to start",
  correct: "Correct guess",
  incorrect: "Incorrect guess"
};

const MODES = [
  { id: "classic", label: "Classic" },
  { id: "new", label: "New" }
];

const instructions = {
  classic: "To Play: Flip two cards to find a matching pair. Miss and you lose a life!",
  new: "To Play: Click any Robot Master, but don't click the same one twice!"
};

const STORAGE_KEY = "megaMatch";
const PAIRS = 8;
const LIVES = 5;
// How long a mismatched pair stays face up before flipping back
const REVEAL_MS = 900;

// Fisher-Yates shuffle, returns a new array
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// localStorage can be unavailable (private browsing, blocked storage)
function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Scores just won't persist
  }
}

// Each deal gets unique keys so new cards mount face down
// instead of animating from the previous board's state
let dealCount = 0;
function dealCards() {
  dealCount++;
  const picks = shuffle(icons).slice(0, PAIRS);
  return shuffle([...picks, ...picks]).map((icon, i) => ({ ...icon, key: `${dealCount}-${i}` }));
}

function newGame(mode) {
  if (mode === "classic") {
    return { cards: dealCards(), flipped: [], matched: [], lives: LIVES, locked: false };
  }
  return { used: [] };
}

class App extends Component {
  constructor(props) {
    super(props);
    const saved = loadSaved();
    const mode = MODES.some((m) => m.id === saved.mode) ? saved.mode : "new";
    this.state = {
      mode,
      highScores: { classic: 0, new: 0, ...saved.highScores },
      score: 0,
      lost: false,
      menu: "start",
      ...newGame(mode)
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.mode !== this.state.mode || prevState.highScores !== this.state.highScores) {
      save({ mode: this.state.mode, highScores: this.state.highScores });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  // State changes for a point scored in the current mode
  scored(prev) {
    const score = prev.score + 1;
    return {
      score,
      highScores: { ...prev.highScores, [prev.mode]: Math.max(prev.highScores[prev.mode], score) },
      lost: false,
      menu: "correct"
    };
  }

  switchMode = (mode) => {
    if (mode === this.state.mode) return;
    clearTimeout(this.timer);
    this.setState({ mode, score: 0, lost: false, menu: "start", ...newGame(mode) });
  };

  handleClick = (name) => {
    if (this.state.used.includes(name)) {
      this.gameOver();
      return;
    }
    this.setState((prev) => ({ ...this.scored(prev), used: [...prev.used, name] }));
  };

  handleCardClick = (index) => {
    const { cards, flipped, matched, locked, lives } = this.state;
    const card = cards[index];
    if (locked || flipped.includes(index) || matched.includes(card.name)) return;

    if (flipped.length === 0) {
      this.setState({ flipped: [index], lost: false });
      return;
    }

    if (cards[flipped[0]].name === card.name) {
      const nowMatched = [...matched, card.name];
      this.setState((prev) => ({ ...this.scored(prev), flipped: [], matched: nowMatched }));
      // Board cleared: deal a fresh one and keep going with the same score and lives
      if (nowMatched.length === PAIRS) {
        this.setState({ locked: true });
        this.timer = setTimeout(() => {
          this.setState({ cards: dealCards(), matched: [], locked: false });
        }, REVEAL_MS);
      }
      return;
    }

    const livesLeft = lives - 1;
    this.setState({ flipped: [flipped[0], index], locked: true, lives: livesLeft, menu: "incorrect" });
    this.timer = setTimeout(() => {
      if (livesLeft === 0) {
        this.gameOver();
      } else {
        this.setState({ flipped: [], locked: false });
      }
    }, REVEAL_MS);
  };

  gameOver() {
    this.setState((prev) => ({ ...newGame(prev.mode), score: 0, lost: true, menu: "incorrect" }));
  }

  renderBoard() {
    if (this.state.mode === "classic") {
      const { cards, flipped, matched } = this.state;
      return cards.map((card, i) => (
        <Card
          key={card.key}
          name={card.name}
          src={asset(card.src)}
          backSrc={asset("assets/images/MEGA.png")}
          faceUp={flipped.includes(i) || matched.includes(card.name)}
          matched={matched.includes(card.name)}
          onClick={() => this.handleCardClick(i)}
        />
      ));
    }
    return shuffle(icons).map((icon) => (
      <Icon
        key={icon.name}
        name={icon.name}
        src={asset(icon.src)}
        handleClick={this.handleClick}
      />
    ));
  }

  render() {
    const { mode, highScores, score, lost, menu, lives } = this.state;
    return (
      <main className="layout">
        <aside className="panel sideBar">
          <img className="logo" alt="Mega Match" src={asset("assets/images/MEGA.png")} />
          <div className="modeToggle" role="group" aria-label="Game mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => this.switchMode(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <img className="menu" alt={menuAlt[menu]} src={asset(menuType[menu])} />
          <dl className="scorebox">
            <div><dt>High Score:</dt><dd>{highScores[mode]}</dd></div>
            <div><dt>Current Score:</dt><dd>{score}</dd></div>
            {mode === "classic" && (
              <div className="lives">
                <dt>Lives:</dt>
                <dd aria-label={`${lives} of ${LIVES}`}>
                  {Array.from({ length: LIVES }, (_, i) => (
                    <img
                      key={i}
                      alt=""
                      className={i < lives ? "life" : "life spent"}
                      src={asset("assets/images/megahead.png")}
                    />
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <p className="instructions">{instructions[mode]}</p>
        </aside>
        <section className={lost ? "panel game shake" : "panel game"}>
          {this.renderBoard()}
        </section>
      </main>
    );
  }
}

export default App;
