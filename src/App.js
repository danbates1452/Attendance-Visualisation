import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble} from 'react-chartjs-2';
import {Container, Row, Col, Navbar, Nav} from 'react-bootstrap';
import {Chart as ChartJS} from 'chart.js/auto'; //must import for charts to render
import axios from 'axios';

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

function ExtractChartData(raw, details) {
  let labels = [];
  let extractedDetails = {};
  for (let d in details) {
    extractedDetails[details[d]] = []
  }
  for (let key in raw) {
    //key = top level key of each dict
    labels.push('Week ' + raw[key]['week']);
    for (let d in extractedDetails) {
      extractedDetails[d].push(raw[key][d]);
    }
  }
  
  let datasets = [];
  for (let d in extractedDetails) {
    datasets.push({label: d, data: extractedDetails[d]})
  }

  return {
    labels: labels,
    datasets: datasets,
  }
}
/*
function ExtractAggregateData(raw, details) {
  let labels = [];
  let extractedDetails = {};

  for (let d in details) {
    extractedDetails[details[d]] = []
  }

  for (let key in raw) {
    labels.push('Week' + raw['key'])
    if (details.includes(key)) {
      
    }
  }
  
}*/

function ChartOptions(title, xTitle, yTitle) {
  return {
    responsive: true,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: true
      },
      title: {
        display: true,
        text: title
      }
    },
    hover: {
      mode: 'index',
      intersect: true
    },
    scales : {
      x: {
        title: {
          display: true,
          text: xTitle
        }
      },
      y: {
        title: {
          display: true,
          text: yTitle
        }
      }
    }
  }
}

function RoleWrapper({children, role, allowedRoles}) {
  return allowedRoles.indexOf(role) > -1 ? children : null
}

function getCurrentUserRole() {
  return 'admin'; //hardcoded for now, access control system not yet established
}

function AppNavbar(isAdmin=false) {
return (
  <Navbar bg="dark" variant="dark" expand="lg">
    <Container>
      <Navbar.Brand href='#'><strong >Attendance Visualisation</strong></Navbar.Brand>
      <Navbar.Toggle aria-controls="application-navbar"></Navbar.Toggle>
      <Navbar.Collapse id="application-navbar">
        <Nav className="me-auto">
          <Nav.Link href="/home">Home</Nav.Link>
          <Nav.Link href="/login">Login</Nav.Link>
          <Nav.Link href="/filter">Filters</Nav.Link>
          <RoleWrapper role={getCurrentUserRole()} allowedRoles={'admin'}>
            <Nav.Link href="/upload">Upload Data</Nav.Link>
            <Nav.Link href="/users">User Management</Nav.Link>
            <Nav.Link href="/data">Data Management</Nav.Link>
          </RoleWrapper>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);
}

function percentage(total, part) {
  return (part / total) * 100
}

function App() {
  //const student_id = 43437412;
  //const apiData = FetchAPIData('/api/snapshot/' + student_id); #snapshot
  const apiData = FetchAPIData('/api/aggregate/course/' + 'G5001U');
  console.log(apiData);
  /*console.log(ExtractAggregateData(apiData, [
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
  ]));*/
  const chartData = ExtractChartData(apiData, ['teaching_attendance', 'teaching_absence']);
  //const chartOptions = ChartOptions('Attendance vs Absence for ' + student_id, 'Snapshots', 'Quantity');

  const chartOptions = ChartOptions('Attendance', 'Snapshots', 'Quantity');

  return (
    <div className='App'>
      <AppNavbar/>
      <Container fluid>
        <Line data={chartData} options={chartOptions}/>
      </Container>
    </div>
  );

}

export default App;
