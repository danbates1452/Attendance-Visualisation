import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Bar} from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto'; //must import for charts to render
import axios from 'axios';

function extractDataAndLabels(raw, scalar) {
  let labels = [];
  let data = [];
  for (let key in raw) {
    labels.push(key)
    data.push(raw[key][scalar])
  }
  return [labels, data]
}

function generateChartConfig(title, labels, datasets, options=[]) {
  //TODO: add configuration options here, maybe create global ones
  return {
    title: title,
    labels: labels,
    datasets: datasets,
    options: generateDatasetOptions(),
  }
}

function generateDatasetOptions() {
  return {

  }
}

function BarChart(config) {
  return <div><Bar data={config}/></div>
}

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
  /*
  //note: this will update rapidly though the data doesn't change
  //TODO: investigate how to do this nicer
  const [currentStudent, setCurrentStudent] = useState(0);

  useEffect(() => {
    fetch('/api/student/student_id/43437412').then(res => res.json()).then(data => {
      setCurrentStudent([data.course_code, data.student_id, data.is_undergraduate, data.stage]);
    }).catch((error) => {console.log(error)});
  })
/*
  const [snapshotData, setSnapshotData] = useState(0);

  useEffect(() => {
    fetch('/api/snapshot/43437412')
    .then(res => res.json())
    .then(data => {
      setSnapshotData(data.date)
    })
  }, []);
  

  const [, ] = useState({
    labels: snapshots.map((data)=> data.date),
    datasets: [
      {
        label: "Teaching Sessions Attended",
        data: snapshots.map((data) => data.teaching_attendance)
      }
    ]
  });
*/
//<BarChart chartData={snapshotData}/>
//<p>{snapshots}</p>
/*
  return (
    <div className="App">
      <header className="App-header">
        {Navigation()}
      </header>
      <div>
        <StudentTable/>
        {currentStudent}
      </div>
    </div>
  );
  */

  const [snapshotData, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        '/api/snapshot/43437412',
      );
      setData(result.data);
    };

    fetchData();
  }, []);
  const [labels, data] = extractDataAndLabels(snapshotData, 'teaching_attendance');

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Teaching Sessions Attended',
        data: data,

      },
    ],
  };

  return (
    <div className='App'>
      <h1>Bar Chart</h1>
      <Bar data={chartData} />
    </div>
  );

}

export default App;
