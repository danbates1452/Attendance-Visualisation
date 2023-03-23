import React, {useState, useEffect} from 'react';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import {Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble} from 'react-chartjs-2';
import {Container, Row, Col} from 'react-bootstrap';
import {Chart as ChartJS} from 'chart.js/auto'; //must import for charts to render
import axios from 'axios';

import Navigation from './navbar';
import { ExtractChartData, ExtractAggregateData, ChartOptions } from './chartHandling';

import Root, {rootLoader} from './routes/root';
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigation/>
  }
]);

//functional component that handles fetching raw data from api
function FetchAPIData(endpoint) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        endpoint
      );
      setData(result.data)
    };
    fetchData();
  }, []);
  return data
}

function percentage(total, part) {
  return (part / total) * 100
}

function App() {
  //const student_id = 43437412;
  //const apiData = FetchAPIData('/api/snapshot/' + student_id); #snapshot
  //const apiData = FetchAPIData('/api/aggregate/course/' + 'G5001U');
  const apiData = FetchAPIData('/api/aggregate/department/informatics');
  //const chartData = ExtractChartData(apiData, ['teaching_attendance', 'teaching_absence']);
  const chartData = ExtractAggregateData(apiData, [
    'teaching_sessions',
    'teaching_attendance', 
    'teaching_explained_absence',
    'teaching_absence',
    'assessments',
    'assessment_submission',
    'assessment_explained_non_submission',
    'assessment_non_submission',
    'assessment_in_late_period',
    'academic_advising_sessions',
    'academic_advising_attendance',
    'academic_advising_explained_absence',
    'academic_advising_absence',
    'academic_advising_not_recorded'
  ], 'avg');
  //const chartData = ExtractAggregateData(apiData, ['teaching_sessions', 'teaching_attendance', 'teaching_absence', 'teaching_explained_absence'], 'sum');

  //const chartOptions = ChartOptions('Attendance vs Absence for ' + student_id, 'Snapshots', 'Quantity');

  const chartOptions = ChartOptions('Attendance', 'Snapshots', 'Quantity');

  return (
    <div className='App'>
      <RouterProvider router={router}/>
      <Container fluid>
        <Line data={chartData} options={chartOptions}/>
      </Container>
    </div>
  );

}

export default App;
