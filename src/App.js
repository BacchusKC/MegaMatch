import React, { Component } from 'react';
import './App.css';
import icons from './icons.json';
import Icon from './components/Icon';

const gameStatus = ["You Lost!!", "Pick Your Enemy to Begin", "You Picked Correct!"];
const menuType = ["./assets/images/start.png", "./assets/images/correct.png", "./assets/images/incorrect.png"];

class App extends Component {
  state = {
    used: [],
    score: 0,
    high: 0,
    lost: false,
    status: gameStatus[1],
    menu: menuType[0]
  };

  handleClick = (name) => {
    if (this.state.used.indexOf(name) !== -1) {
      this.gameOver();
    } else {
      let tempUsed = this.state.used;
      tempUsed.push(name);
      this.setState({ used: tempUsed, score: this.state.score + 1, lost: false, status: gameStatus[2], menu: menuType[1] })
      if (this.state.high <= this.state.score) {
        this.setState({ high: this.state.score + 1 })
      };
    };
  };

  random() {
    let tempArray = [...icons];
    for (let i = tempArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = tempArray[i];
      tempArray[i] = tempArray[j];
      tempArray[j] = temp;
    };
    return tempArray;
  };

  gameOver() {
    this.setState({ used: [], score: 0, lost: true, status: gameStatus[0], menu: menuType[2] });
  };

  render() {
    const randomArray = this.random();
    let imgShake = ["row"];
    console.log(this.state.score, this.state.high);
    if (this.state.lost) {
      imgShake = "shake row";
    } else {
      imgShake = "row";
    };
    return (
      <div>
        <div className="sideBar">
          <img alt="Mega Match" id="mega" src="./assets/images/MEGA.png" />
          <img alt="menu" id="menu" src={this.state.menu} />
          <div id="scorebox">
            <h1 id="score">High Score: &nbsp;&nbsp;&nbsp;{this.state.high}</h1>
            <h1 id="score">Current Score: {this.state.score}</h1>
          </div>
          <div id="bottom">
            <h3>To Play: Click any Robot Master, but don't click the same one twice!</h3>
            <h4> Attn: Because of the style of play in this game, playing on mobile isn't feasible, so I did not make it mobile responsive. Be Aware!</h4>
          </div>
        </div>
        <div className={imgShake}>
          {
            randomArray.map((icon) => {
              return (
                <Icon
                  key={icon.name}
                  name={icon.name}
                  src={icon.src}
                  handleClick={this.handleClick}
                />
              );
            })
          };
        </div>
      </div>
    );
  };
};

export default App;
