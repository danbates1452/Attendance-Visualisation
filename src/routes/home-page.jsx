import { ExtractAggregateData, ExtractChartData, LinearChartOptions, CircularChartOptions, percentageChartData, percentageAggregateChartData } from "../helper/chartHandling";
import FetchAPIData from "../helper/fetchApiData";
import { Container, Row, Col } from "react-bootstrap";
import { Line, Bar, Pie, PolarArea } from "react-chartjs-2";
import { useState } from "react";
import Select from 'react-select';

function studentGroupOptions() {
  //TODO: populate automatically with courses and stages, then add manually departments and the school as a whole

  var optionsObj = [
    {value: "school", label: "School of Engineering and Informatics"},
    {value: "department/engineering", label: "Department of Engineering"},
    {value: "department/informatics", label: "Department of Informatics"},
  ];

  //populate list

  const stages = [1, 2, 3, 4, 5]; //TODO: implement this with '/api/filter_options/snapshot' endpoint
  for (let key in stages) {
    optionsObj.push({value: "stage/" + stages[key], label: "Stage " + stages[key]})
  };

  var courses = FetchAPIData('/api/courses');
  for (let key in courses) {
    optionsObj.push({value: "course/" + courses[key]['code'], label: key + ': ' + courses[key]['title']})
    //item['code'] could just be index, but this is safer if I choose to change my indices
  };

  return optionsObj;
}

function datasetOptions() {
  const options = [
    {value: 'percentage_attendance', label: 'Percentage Attendance'},
    {value: 'percentage_submitted', label: 'Percentage Submitted'},
    {value: 'percentage_aa_attendance', label: 'Percentage AA Attendance'},

    {value: 'teaching_sessions', label: 'Teaching Sessions'},
    {value: 'teaching_attendance', label: 'Teaching Attendance'},
    {value: 'teaching_explained_absence', label: 'Teaching Explained Absence'},
    {value: 'teaching_absence', label: 'Teaching Absence'},
    {value: 'assessments', label: 'Assessments'},
    {value: 'assessment_submission', label: 'Assessment Submissions'},
    {value: 'assessment_explained_non_submission', label: 'Assessment Explained Non-Submissions'},
    {value: 'assessment_non_submission', label: 'Assessment Non-Submissions'},
    {value: 'academic_advising_sessions', label: 'Academic Advising Sessions'},
    {value: 'academic_advising_attendance', label: 'Academic Advising Attendance'},
    {value: 'academic_advising_explained_absence', label: 'Academic Advising Explained Absence'},
    {value: 'academic_advising_absence', label: 'Academic Advising Absence'},
    {value: 'academic_advising_not_recorded', label: 'Academic Advising Not Recorded'}
  ];
  return options;
}

export default function HomePage() {
  //default is inf department, percentage attendance
  const [selectedStudentGroup, setSelectedStudentGroup] = useState({url:"/api/aggregate/department/informatics", label: "Department of Informatics"});
  var apiData = FetchAPIData(selectedStudentGroup['url']);
  const [selectedDataset, setSelectedDataset] = useState(percentageAggregateChartData(apiData, 'teaching_attendance', 'teaching_sessions', 'Percentage Attendance', 'avg'));
  
  const [title, setTitle] = useState(selectedStudentGroup['title']);
  const [linearOptions, setLinearOptions] = useState(LinearChartOptions(title, 'Snapshots', 'Quantity')); 
  const [circularOptions, setCircularOptions] = useState(CircularChartOptions(title)); 

  async function refreshApiData(url) {
    const response = await fetch(url);
    const data = await response.json();
    apiData = data;
  }
  
  let lastDatasetOption = {value: 'percentage_attendance', label: 'Percentage Attendance'};

  const handleChartUpdate = (datasetOption) => {
    if (datasetOption['value'].includes('percentage')) {
      switch (datasetOption['value']) {
        case "percentage_attendance":
          setSelectedDataset(percentageAggregateChartData(apiData, 'teaching_attendance', 'teaching_sessions', datasetOption['label'], 'avg'));
          break;
          //TODO: populate presets
      }
    } else {
      setSelectedDataset(ExtractAggregateData(apiData, [datasetOption['value']], 'avg'));
    }

    setTitle(lastDatasetOption['label'] + " in " + selectedStudentGroup['label']); //set title to the name of the selected option
    setLinearOptions(LinearChartOptions(title, 'Snapshots', 'Quantity'));
    setCircularOptions(CircularChartOptions(title));
    lastDatasetOption = datasetOption;
  };

  const handleStudentGroupSelect = (selectedOption) => {
    let newStudentGroupURL = '/api/aggregate/' + selectedOption['value'];
    setSelectedStudentGroup({url:newStudentGroupURL, title: selectedOption['label']});
    refreshApiData(newStudentGroupURL); //refresh api data

    handleChartUpdate(lastDatasetOption);
    
  };
  const handleDatasetSelect = (selectedOption) => { 
    handleChartUpdate(selectedOption);
  };

  //const student_id = 43437412;
  //const apiData = FetchAPIData('/api/snapshot/' + student_id);
  //const apiData = FetchAPIData('/api/aggregate/course/G5001U');
  
  //const chartData = ExtractChartData(apiData, ['teaching_attendance', 'teaching_absence']);

  /*const chartData = ExtractAggregateData(apiData, [
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
  ], 'avg');*/

  //const attendancePercentageData = percentageAggregateChartData(apiData, 'teaching_attendance', 'teaching_sessions', '% Attendance', 'avg');
  //console.log(attendancePercentageData);
  //const attendancePercentageData = ExtractAggregateData(apiData, ['teaching_sessions', 'teaching_attendance'], 'avg');
  //const chartData = ExtractAggregateData(apiData, ['teaching_sessions', 'teaching_attendance', 'teaching_absence', 'teaching_explained_absence'], 'sum');

  //const chartOptions = ChartOptions('Attendance vs Absence for ' + student_id, 'Snapshots', 'Quantity');

  //const attendancePercentageOptionsLinear = LinearChartOptions('% Attendance', 'Snapshots', 'Quantity');
  //const attendancePercentageOptionsCircular = CircularChartOptions('% Attendance');
//console.log(selectedDataset);
    return (
        <Container fluid>
        <Select options={studentGroupOptions()} onChange={handleStudentGroupSelect} isClearable isSearchable/>
        <Select options={datasetOptions()} onChange={handleDatasetSelect} isClearable isSearchable/>
        <Row>
          <Col>
            <Line height={"300px"} data={selectedDataset} options={linearOptions}/>
          </Col>
          <Col>
            <PolarArea height={"300px"} data={selectedDataset} options={circularOptions}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <Pie height={"300px"} data={selectedDataset} options={circularOptions}/>
          </Col>
          <Col>
            <Bar height={"300px"} data={selectedDataset} options={linearOptions}/>
          </Col>
        </Row>
        </Container>
    );
}