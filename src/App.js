import React, { Component } from 'react';
import './App.css';
import icons from './icons.json';
import Icon from './components/Icon';

class App extends Component {
  state = {
    unused: [],
    used: [],
    score: 0,
    high: 0,
    correct: false
  }

  componentDidMount() {
    this.setState({
      unused: icons
    });
  };

  handleClick = (name) => {
    for (let i = 0; i < this.state.unused.length; i++) {
      if (name === this.state.unused[i].name) {
        this.setState({
          unused: this.state.unused.filter(unused => name !== unused.name)
        });
        
        // console.log(this.state.unused.length)
        this.setState({
          correct: true,
          score: 17 - this.state.unused.length
        });
        this.setState(prevState => ({
          used: [...prevState.used, name]
        }))
        if (this.state.score >= this.state.high) {
          this.setState({
            high: this.state.score + 1
          });
        };
      };
      for (let i = 0; i < this.state.used.length; i++) {
        if (name === this.state.used[i]) {
          // console.log("Hi")
        }
      }
    };
  };

  random () {
    let tempArray = [ ...icons ];
    for (let i = tempArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = tempArray[i];
      tempArray[i] = tempArray[j];
      tempArray[j] = temp;
    };
    return tempArray;
  }

  render() {
    const randomArray = this.random()
    // console.log(this.state.unused)
    // console.log(this.state.correct, this.state.score, this.state.high)
    return (
      <div className="row">
        {
          randomArray.map((icon) => {
            return (
              <Icon
                key={icon.name}
                name={icon.name}
                src={icon.src}
                handleClick={this.handleClick}
              />
            )
          })
        }
      </div>
    )
  };
};

export default App;
