import { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";
import Select from 'react-select';

export default function FiltersPage() {
    const [filters, setFilters] = useState([<TableFilters tableName="EMPTY"/>]);

    //handle top level selector for individual different tables
    const handleSelect = (event) => {setFilters(<TableFilters tableName={event.target.value}/>)};
    //handle submission of any table form
    const handleSubmit = (event) => {};
    //update values
    const handleChange = (event) => {};

    return(
        <Container fluid className="p-3">
            <Form onSubmit={handleSubmit}>
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
                {filters}
            </Form>
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

function studentFilter() {
    let fetchStudentOptions = FetchAPIData('/api/filter_options/student');
    
    let studentOptions = optionArrayToObjectArray(fetchStudentOptions['student_id']);
    let courseOptions = optionArrayToObjectArray(fetchStudentOptions['course_code']);
    let stageOptions = optionArrayToObjectArray(fetchStudentOptions['stage']);
    let levelOptions = optionArrayToObjectArray(fetchStudentOptions['level']);

    return (
            <>
                <Row>
                    <Form.Group as={Col}>
                        <Form.Label>Student ID</Form.Label>
                        <Select options={studentOptions} isMulti isClearable isSearchable/>

                        <Form.Label>Course</Form.Label>
                        <Select options={courseOptions} isMulti isClearable isSearchable/>
                    </Form.Group>

                    <Form.Group as={Col}>
                        <Form.Label>Level</Form.Label>
                        <Select options={levelOptions} isMulti isClearable isSearchable defaultValue={levelOptions}/>

                        <Form.Label>Stage</Form.Label>
                        <Select options={stageOptions} isMulti isClearable isSearchable defaultValue={stageOptions}/>
                    </Form.Group>
                </Row>
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
            return studentFilter();
        case 'snapshot':
            return snapshotFilter();
        case 'course':
            return courseFilter();
        default:
            return '';
    }
}