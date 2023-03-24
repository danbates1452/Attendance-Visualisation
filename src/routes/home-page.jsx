import { ExtractAggregateData, ExtractChartData, ChartOptions } from "../helper/chartHandling";
import FetchAPIData from "../helper/fetchApiData";
import { Container } from "react-bootstrap";
import { Line } from "react-chartjs-2";

export default function HomePage() {
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
        <div>
            <Container fluid>
                <Line data={chartData} options={chartOptions}/>
            </Container>
        </div>
    );
}