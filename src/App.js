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

function StudentTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/student/student_id/43437412')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  return (
    <div>
      <h1>Student 43437412</h1>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Level</th>
            <th>Stage</th>
            <th>Registration Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(student => (
            <tr key={student.student_id}>
              <td>{student.student_id}</td>
              <td>{student.is_undergraduate}</td>
              <td>{student.stage}</td>
              <td>{student.registration_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    fetch('/api/student/student_id/43437412').then(res => res.json()).then(data => {
      setCurrentStudent([data.course_code, data.student_id, data.is_undergraduate, data.stage]);
    });
  })

  const [snapshots, setSnapshots] = useState(0);

  useEffect(() => {
    fetch('/api/snapshot/43437412').then(res => res.json()).then(data => {
      setSnapshots(data)
    })
  })

  return (
    <div className="App">
      <header className="App-header">
        {Navigation()}
      </header>
      <body>
        <StudentTable></StudentTable>
      </body>
    </div>
  );
}

export default App;
