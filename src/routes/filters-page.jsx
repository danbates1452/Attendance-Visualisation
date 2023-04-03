import { useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";
import Select from 'react-select';

export default function FiltersPage() {
    const [filters, setFilters] = useState([<TableFilters key="filter" tableName="EMPTY"/>]);

    //handle top level selector for individual different tables
    const handleSelect = (event) => {setFilters(<TableFilters tableName={event.target.value}/>)};

    return(
        <Container fluid className="p-3">
            <Form key={'tableNameSelect'}>
                <Row className="pb-3">
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

function View({type, data={}}) {
    if (data === {} || data === undefined) {type = ''} //clear type and cause switch to default if empty data
    
    switch (type) {
        case 'line':
            return (<></>); //TODO: complete this chart generation
        case 'table':
            console.log(data);

            /*
            
            */
            return (
                <Row><Table>
                <thead>
                <tr key={'header'}>
                {Object.keys(data[0]).map((key) => (
                        <th>{key}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((item) => (
                <tr key={item.student_id}>
                    {Object.values(item).map((value) => (
                        <td>{value}</td>
                    ))}
                </tr>
                ))}
                </tbody>
                </Table></Row>
            );
        default: // return nothing
            console.log('defaulted');
            return ('');
    }
}

function StudentFilter() {
    const [viewType, setViewType] = useState('');
    const [viewData, setViewData] = useState({});

    let fetchStudentOptions = FetchAPIData('/api/filter_options/student');
    
    let studentOptions = optionArrayToObjectArray(fetchStudentOptions['student_id']);
    let courseOptions = optionArrayToObjectArray(fetchStudentOptions['course_code']);
    let stageOptions = optionArrayToObjectArray(fetchStudentOptions['stage']);
    let levelOptions = optionArrayToObjectArray(fetchStudentOptions['level']);

    const [student_id, setStudent_id] = useState(""); //form states
    const [course, setCourse] = useState("");
    const [level, setLevel] = useState("");
    const [stage, setStage] = useState("");

    const handleStudent_idChange = (selectedOption) => {setStudent_id(selectedOption)};
    const handleCourseChange = (selectedOption) => {setCourse(selectedOption)};
    const handleLevelChange = (selectedOption) => {setLevel(selectedOption)};
    const handleStageChange = (selectedOption) => {setStage(selectedOption)};

    const handleSubmit = (event) => {
        event.preventDefault();

        let params = new URLSearchParams();
        objectArrayToStringArray(student_id).map((item) => params.append('student_id', item));
        objectArrayToStringArray(course).map((item) => params.append('course_code', item));
        objectArrayToStringArray(level).map((item) => params.append('level', item));
        objectArrayToStringArray(stage).map((item) => params.append('stage', item));

        const url = '/api/filter/student?' + params.toString();

        async function fetchData() {
            const response = await fetch(url);
            const data = await response.json();
            setViewData(Object.values(data));
            setViewType('table');
        }
        fetchData();
    };

    return (
        <>
            <Form key={'StudentForm'} onSubmit={handleSubmit} method="get">
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

                        <Button variant="primary" type="submit">
                            Filter
                        </Button>
                    </Form.Group>
                </Row>
            </Form>
            <View key="StudentView" type={viewType} data={viewData}/>
        </>
    );
}

function snapshotFilter() {
    let fetchSnapshotOptions = FetchAPIData('/api/filter_options/snapshot');
    
    let studentOptions = optionArrayToObjectArray(fetchSnapshotOptions['student_id']);
    let registrationOptions = optionArrayToObjectArray(fetchSnapshotOptions['registration_status']);
    let yearOptions = optionArrayToObjectArray(fetchSnapshotOptions['year']);
    let semesterOptions = optionArrayToObjectArray(fetchSnapshotOptions['semester']);
    let weekOptions = optionArrayToObjectArray(fetchSnapshotOptions['week']);

    return (
        <>
            <Row>
                <Form.Group as={Col}>
                    <Form.Label>Student ID</Form.Label>
                    <Select options={studentOptions}/>

                    <Form.Label>Registration Status</Form.Label>
                    <Select options={registrationOptions}/>
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>Year</Form.Label>
                    <Select options={yearOptions}/>

                    <Form.Label>Semester</Form.Label>
                    <Select options={semesterOptions}/>

                    <Form.Label>Week</Form.Label>
                    <Select options={weekOptions}/>
                </Form.Group>
            </Row>
        </>
    );
}

function courseFilter() {
    let fetchCourseOptions = FetchAPIData('/api/filter_options/course');

    let codeOptions = optionArrayToObjectArray(fetchCourseOptions['code']);
    let titleOptions = optionArrayToObjectArray(fetchCourseOptions['title']);

    return (
        <>
            <Row>
                <Form.Group as={Col}>
                    <Form.Label>Course Code</Form.Label>
                    <Select options={codeOptions}/>
                </Form.Group>

                <Form.Group as={Col}>
                    <Form.Label>Course Title</Form.Label>
                    <Select options={titleOptions}/>
                </Form.Group>
            </Row>
        </>
    );
}

function TableFilters({tableName}) {
    switch (tableName) {
        case 'student': //TODO: pull all course codes and titles (display as "CODE - TITLE") for selection
            return StudentFilter();
        case 'snapshot':
            return snapshotFilter();
        case 'course':
            return courseFilter();
        default:
            return '';
    }
}