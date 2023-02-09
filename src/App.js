import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  //note: this will update rapidly though the data doesn't change
  //todo: investigate how to do this nicer
  const [currentStudent, setCurrentStudent] = useState(0);

  useEffect(() => {
    fetch('/student?id=43437412').then(res => res.json()).then(data => {
      setCurrentStudent([data.course_code, data.id, data.is_undergraduate, data.stage]);
    });
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>{currentStudent}</p>
      </header>
    </div>
  );
}

export default App;
