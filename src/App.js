import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';


function Table({data}) {
  //TODO: extract headers and rows from data
  let headers = {};
  let rows = {};
  return (
    <table>
      <thead>
        {headers}
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}

function Navigation() {
return (
  <div className='navbar'>
    <h1>Attendance-Visualisation</h1>
  </div>
);
}


function App() {
  //note: this will update rapidly though the data doesn't change
  //TODO: investigate how to do this nicer
  const [currentStudent, setCurrentStudent] = useState(0);

  useEffect(() => {
    fetch('/student/43437412').then(res => res.json()).then(data => {
      setCurrentStudent([data.course_code, data.id, data.is_undergraduate, data.stage]);
    });
  })

  const [snapshots, setSnapshots] = useState(0);

  useEffect(() => {
    fetch('/snapshot/43437412').then(res => res.json()).then(data => {
      setSnapshots([data.student_id, data.teaching_sessions])
    })
  })

  return (
    <div className="App">
      <header className="App-header">
        {Navigation()}
      </header>
      <body>
        <p>{currentStudent}</p>
        <p>{snapshots}</p>
      </body>
    </div>
  );
}

export default App;
