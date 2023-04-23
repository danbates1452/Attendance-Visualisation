import { useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";
import Select from 'react-select';
import {v4 as uuidv4} from 'uuid';
import { ExtractChartData, LinearChartOptions } from "../helper/chartHandling";
import { Line } from "react-chartjs-2";

export default function FiltersPage() {
    const [filters, setFilters] = useState([<TableFilters key="filter" tableName="EMPTY"/>]);

    //handle top level selector for individual different tables
    const handleSelect = (event) => {setFilters(<TableFilters tableName={event.target.value}/>)};

    return(
        <Container fluid className="pl-3 pr-3 pt-2">
            <Form key={'tableNameSelect'}>
                <Row className="pb-1">
                    <Col></Col>
                    <Form.Group as={Col}>
                        <Form.Label htmlFor="tableSelect">Table</Form.Label>
                        <Form.Select id="tableSelect" onChange={handleSelect} defaultValue="null">
                            <option disabled hidden value="null">Select a table</option>
                            <option value="student">Students</option>
                            <option value="snapshot">Snapshots</option>
                            <option value="course">Courses</option>
                        </Form.Select>
                        </Form.Group>
                    <Col></Col>
                </Row>
            </Form>
            {filters}
        </Container>
    );
}

function optionArrayToObjectArray(optionArray) {
    let objArr = [];
    if (optionArray !== undefined) {
        optionArray = Object.keys(optionArray).map((key) => optionArray[key]); //convert object representing an array, into an array
        optionArray.sort();
    }
    for (let key in optionArray) {
        objArr.push({value: optionArray[key], label: optionArray[key]});
    }
    return objArr;
}

function objectArrayToStringArray(objectArray) {
    let strArray = [];
    for (let key in objectArray) {
        strArray.push(objectArray[key]['value']);
    }
    return strArray;
}

const allSnapshotDatapoints = [
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
  ];
function View({type, data={}}) {
    if (data === {} || data === undefined || data[0] === undefined) {type = ''} //clear type and cause switch to default if empty data
    
    switch (type) {
        case 'line':
            return (
                <Row>
                    <Line data={ExtractChartData(data, allSnapshotDatapoints)} options={LinearChartOptions('Filtered Teaching Attendance', 'Sessions Attended', 'Week')}/>
                </Row>
            );
        case 'table':
            return (
                <Row><Table>
                <thead>
                <tr key={'header'}>
                {Object.keys(data[0]).map((key) => (
                        <th key={key}>{key}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item) => (
                <tr key={uuidv4()}>
                    {Object.values(item).map((value) => (
                        <td key={uuidv4()}>{value}</td>
                    ))}
                </tr>
                ))}
                </tbody>
                </Table></Row>
            );
        default: // return nothing
            return ('');
    }
}

function TableFilters({tableName}) {
    //student view
    const [studentViewType, setStudentViewType] = useState('');
    const [studentViewData, setStudentViewData] = useState({});
    //snapshot view
    const [snapshotViewType, setSnapshotViewType] = useState('');
    const [snapshotViewData, setSnapshotViewData] = useState({});
    //course view
    const [courseViewType, setCourseViewType] = useState('');
    const [courseViewData, setCourseViewData] = useState({});

    //student states
    const [student_id, setStudent_id] = useState(""); //shared between student and snapshot
    const [course, setCourse] = useState("");
    const [level, setLevel] = useState("");
    const [stage, setStage] = useState("");
    //snapshot states
    const [registration_status, setRegistration_status] = useState("");
    const [year, setYear] = useState("");
    const [semester, setSemester] = useState("");
    const [week, setWeek] = useState("");
    //course states
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");

    //student selector handlers
    const handleStudent_idChange = (selectedOption) => {setStudent_id(selectedOption)}; //shared by student and snapshot
    const handleCourseChange = (selectedOption) => {setCourse(selectedOption)};
    const handleLevelChange = (selectedOption) => {setLevel(selectedOption)};
    const handleStageChange = (selectedOption) => {setStage(selectedOption)};
    //snapshot selector handlers
    const handleRegistration_statusChange = (selectedOption) => {setRegistration_status(selectedOption)};
    const handleYearChange = (selectedOption) => {setYear(selectedOption)};
    const handleSemesterChange = (selectedOption) => {setSemester(selectedOption)};
    const handleWeekChange = (selectedOption) => {setWeek(selectedOption)};
    //course selector handlers
    const handleCodeChange = (selectedOption) => {setCode(selectedOption)};
    const handleTitleChange = (selectedOption) => {setTitle(selectedOption)};

    async function fetchData(url, tableName) {
        const response = await fetch(url);
        const data = await response.json();
        switch (tableName) {
            case 'student':
                setStudentViewData(Object.values(data));
                setStudentViewType('table');
                break;
            case 'snapshot':
                setSnapshotViewData(Object.values(data));
                //setSnapshotViewType('table');
                setSnapshotViewType('line');
                break;
            case 'course':
                setCourseViewData(Object.values(data));
                setCourseViewType('table');
                break;
            default:
                //do nothing - shouldn't reach this
                break;
        }
    }

    const handleStudentSubmit = (event) => {
        event.preventDefault();

        let params = new URLSearchParams();
        objectArrayToStringArray(student_id).map((item) => params.append('student_id', item));
        objectArrayToStringArray(course).map((item) => params.append('course_code', item));
        objectArrayToStringArray(level).map((item) => params.append('level', item));
        objectArrayToStringArray(stage).map((item) => params.append('stage', item));

        const url = '/api/filter/student?' + params.toString();

        fetchData(url, 'student');
    };

    const handleSnapshotSubmit = (event) => {
        event.preventDefault();

        let params = new URLSearchParams();
        objectArrayToStringArray(student_id).map((item) => params.append('student_id', item));
        objectArrayToStringArray(registration_status).map((item) => params.append('registration_status', item));
        objectArrayToStringArray(year).map((item) => params.append('year', item));
        objectArrayToStringArray(semester).map((item) => params.append('semester', item));
        objectArrayToStringArray(week).map((item) => params.append('week', item));

        const url = '/api/filter/snapshot?' + params.toString();

        fetchData(url, 'snapshot');
    };

    const handleCourseSubmit = (event) => {
        event.preventDefault();

        let params = new URLSearchParams();
        objectArrayToStringArray(code).map((item) => params.append('code', item));
        objectArrayToStringArray(title).map((item) => params.append('title', item));
        
        const url = '/api/filter/course?' + params.toString();

        fetchData(url, 'course');
    };

    let studentOptions;
    switch (tableName) {
        case 'student': //pull all course codes and titles (display as "CODE - TITLE") for selection
            let fetchStudentOptions = FetchAPIData('/api/filter_options/student');
    
            studentOptions = optionArrayToObjectArray(fetchStudentOptions['student_id']);
            let courseOptions = optionArrayToObjectArray(fetchStudentOptions['course_code']);
            let stageOptions = optionArrayToObjectArray(fetchStudentOptions['stage']);
            let levelOptions = optionArrayToObjectArray(fetchStudentOptions['level']);
        
            return (
                <>
                    <Form key={'StudentForm'} onSubmit={handleStudentSubmit}>
                        <Row>
                            <Form.Group as={Col}>
                                <Form.Label>Student ID</Form.Label>
                                <Select options={studentOptions} onChange={handleStudent_idChange} value={student_id} isMulti isClearable isSearchable/>
    
                                <Form.Label>Course</Form.Label>
                                <Select options={courseOptions} onChange={handleCourseChange} value={course} isMulti isClearable isSearchable/>
                            </Form.Group>
    
                            <Form.Group as={Col}>
                                <Form.Label>Level</Form.Label>
                                <Select options={levelOptions} onChange={handleLevelChange} value={level} isMulti isClearable isSearchable defaultValue={levelOptions}/>
    
                                <Form.Label>Stage</Form.Label>
                                <Select options={stageOptions} onChange={handleStageChange} value={stage} isMulti isClearable isSearchable defaultValue={stageOptions}/>
                            </Form.Group>
                        </Row>
                        <Row className='p-2 ml-3 mr-3'>
                            <Button variant="primary" type="submit">Filter</Button>
                        </Row>
                    </Form>
                    <View key="StudentView" type={studentViewType} data={studentViewData}/>
                </>
            );
        case 'snapshot':
            let fetchSnapshotOptions = FetchAPIData('/api/filter_options/snapshot');
    
            studentOptions = optionArrayToObjectArray(fetchSnapshotOptions['student_id']);
            let registrationOptions = optionArrayToObjectArray(fetchSnapshotOptions['registration_status']);
            let yearOptions = optionArrayToObjectArray(fetchSnapshotOptions['year']);
            let semesterOptions = optionArrayToObjectArray(fetchSnapshotOptions['semester']);
            let weekOptions = optionArrayToObjectArray(fetchSnapshotOptions['week']);

            return (
                <>
                    <Form key={'SnapshotForm'} onSubmit={handleSnapshotSubmit}>
                        <Row>
                            <Form.Group as={Col}>
                                <Form.Label>Student ID</Form.Label>
                                <Select options={studentOptions} onChange={handleStudent_idChange} isMulti isClearable isSearchable/>

                                <Form.Label>Registration Status</Form.Label>
                                <Select options={registrationOptions}  onChange={handleRegistration_statusChange} isMulti isClearable isSearchable/>
                            </Form.Group>

                            <Form.Group as={Col}>
                                <Form.Label>Year</Form.Label>
                                <Select options={yearOptions}  onChange={handleYearChange} isMulti isClearable isSearchable/>

                                <Form.Label>Semester</Form.Label>
                                <Select options={semesterOptions}  onChange={handleSemesterChange} isMulti isClearable isSearchable/>

                                <Form.Label>Week</Form.Label>
                                <Select options={weekOptions}  onChange={handleWeekChange} isMulti isClearable isSearchable/>
                            </Form.Group>
                        </Row>
                        <Row className='p-2 ml-3 mr-3'>
                            <Button variant="primary" type="submit">Filter</Button>
                        </Row>
                    </Form>
                    <View key="SnapshotView" type={snapshotViewType} data={snapshotViewData}/>
                </>
            );
                case 'course':
                    let fetchCourseOptions = FetchAPIData('/api/filter_options/course');

                    let codeOptions = optionArrayToObjectArray(fetchCourseOptions['code']);
                    let titleOptions = optionArrayToObjectArray(fetchCourseOptions['title']);
                
                    return (
                        <>
                            <Form key={'CourseForm'} onSubmit={handleCourseSubmit}>
                                <Row>
                                    <Form.Group as={Col}>
                                        <Form.Label>Course Code</Form.Label>
                                        <Select options={codeOptions}  onChange={handleCodeChange} isMulti isClearable isSearchable/>
                                    </Form.Group>
                    
                                    <Form.Group as={Col}>
                                        <Form.Label>Course Title</Form.Label>
                                        <Select options={titleOptions}  onChange={handleTitleChange} isMulti isClearable isSearchable/>
                                    </Form.Group>
                                </Row>
                                <Row className='p-2 ml-3 mr-3'>
                                    <Button variant="primary" type="submit">Filter</Button>
                                </Row>
                            </Form>
                            <View key="CourseView" type={courseViewType} data={courseViewData}/>
                        </>
                    );
        default:
            return '';
    }
}