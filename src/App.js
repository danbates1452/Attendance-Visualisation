import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble} from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto'; //must import for charts to render
import axios from 'axios';

//functional component that handles fetching raw data from api
function FetchAPIData(endpoint) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        endpoint,
      );
      setData(result.data);
    };
    fetchData();
  }, []);
  return data
}

function ChartData(raw, details) {
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

  return {
    labels: labels,
    datasets: datasets,
  }
}

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

function Navigation() {
return (
  <div className='navbar'>
    <h1>Attendance-Visualisation</h1>
  </div>
);
}

function percentage(total, part) {
  return (part / total) * 100
}


function App() {
  const student_id = 43437412;
  const snapshotData = FetchAPIData('/api/snapshot/' + student_id);

  const chartData = ChartData(snapshotData, ['teaching_attendance', 'teaching_absence']);
  const chartOptions = ChartOptions('Attendance vs Absence for ' + student_id, 'Snapshots', 'Quantity');

  return (
    <div className='App'>
      <h1>Chart</h1>
      <div className='SmallChart'>
        <Line data={chartData} options={chartOptions}/>
      </div>
      <div className='SmallChart'>
        <Bar data={chartData} options={chartOptions}/>
      </div>
    </div>
  );

}

export default App;
