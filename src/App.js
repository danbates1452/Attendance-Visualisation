import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble} from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto'; //must import for charts to render
import axios from 'axios';

/**
 * Extracts data and labels from raw data for a particular scalar value in each entry
 * @param {Array()} raw Raw API data, keys pointing to value arrays containing individual entries
 * @param {String} scalar Individual Data point to extract for graphing
 * @returns {Array()} 1D array with two values: labels and data, extracted from the raw data
 */
/*function extractDataAndLabels(raw, scalar) {
  //todo: extend to extracting multiple scalar bits of data 
  let labels = [];
  let data = [];
  for (let key in raw) {
    labels.push(key)
    data.push(raw[key][scalar])
  }
  return [labels, data]
}*/

function extractDataAndLabels(raw, requestData) {
  //todo: extend to extracting multiple scalar bits of data
  let labels = [];
  let data = [];
  for (let key in raw) {
    labels.push(key)
    for (let req in requestData) {
      data.push(raw[key][req])
    }
  }
  return [labels, data]
}

function generateChartData(raw, details) {
  let labels = [];
  let extractedDetails = {};
  for (let d in details) {
    extractedDetails[details[d]] = []
  }
   for (let key in raw) {
    //key = top level key of each dict
    labels.push(key);
    for (let d in extractedDetails) {
      extractedDetails[d].push(raw[key][d]);
    }
  }
  
  let datasets = [];
  for (let d in extractedDetails) {
    datasets.push({label: d, data: extractedDetails[d]})
  }
  console.log(datasets);
    
  return {
    labels: labels,
    datasets: datasets
  }
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

  const rows = ['teaching_attendance', 'teaching_absence'];
  const chartData = generateChartData(snapshotData, rows)

  return (
    <div className='App'>
      <h1>Chart</h1>
      <Line data={chartData} />
    </div>
  );

}

export default App;
