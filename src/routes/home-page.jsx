import { ExtractAggregateData, ExtractChartData, LinearChartOptions, CircularChartOptions, percentageChartData, percentageAggregateChartData } from "../helper/chartHandling";
import FetchAPIData from "../helper/fetchApiData";
import { Container, Row, Col } from "react-bootstrap";
import { Line, Bar, Pie, PolarArea } from "react-chartjs-2";

export default function HomePage() {
  //const student_id = 43437412;
  //const apiData = FetchAPIData('/api/snapshot/' + student_id);
  //const apiData = FetchAPIData('/api/aggregate/course/G5001U');
  
  //const chartData = ExtractChartData(apiData, ['teaching_attendance', 'teaching_absence']);
  
  const apiData = FetchAPIData('/api/aggregate/department/informatics');
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

  const attendancePercentageData = percentageAggregateChartData(apiData, 'teaching_attendance', 'teaching_sessions', '% Attendance', 'avg');
  console.log(attendancePercentageData);
  //const attendancePercentageData = ExtractAggregateData(apiData, ['teaching_sessions', 'teaching_attendance'], 'avg');
  //const chartData = ExtractAggregateData(apiData, ['teaching_sessions', 'teaching_attendance', 'teaching_absence', 'teaching_explained_absence'], 'sum');

  //const chartOptions = ChartOptions('Attendance vs Absence for ' + student_id, 'Snapshots', 'Quantity');

  const attendancePercentageOptionsLinear = LinearChartOptions('% Attendance', 'Snapshots', 'Quantity');
  const attendancePercentageOptionsCircular = CircularChartOptions('% Attendance');

    return (
        <Container fluid>  
        <Row>
          <Col>
          <Line height={"300px"} data={attendancePercentageData} options={attendancePercentageOptionsLinear}/>
          </Col>
          <Col>
          <PolarArea height={"300px"} data={attendancePercentageData} options={attendancePercentageOptionsCircular}/>
          </Col>
        </Row>
        </Container>
    );
}