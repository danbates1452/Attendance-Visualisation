import { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";
import Select from 'react-select';

export default function FiltersPage() {
    const [filters, setFilters] = useState([<TableFilters tableName="EMPTY"/>]);

    const handleSelect = (event) => {setFilters(<TableFilters tableName={event.target.value}/>)}
    
    return(
        <Container fluid className="p-3">
            <Form>
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
    optionArray.sort();
    for (let key in optionArray) {
        objArr.push({value: optionArray[key], label: optionArray[key]});
    }
    return objArr;
}

function TableFilters({tableName}) {
    let studentOptions; //shared between student and snapshot -> try to only load once as it's a fairly intensive operation to bring in ~1400 rows
    switch (tableName) {
        case 'student': //TODO: pull all course codes and titles (display as "CODE - TITLE") for selection
            
            let fetchStudentOptions = FetchAPIData('/api/filter_options/student');
            console.log(fetchStudentOptions);
            for (let key in fetchStudentOptions) {
                console.log(key, fetchStudentOptions[key]);
            }
            
            if (!studentOptions) studentOptions = optionArrayToObjectArray(fetchStudentOptions['student_id']);

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
        case 'snapshot':
            let fetchSnapshotOptions = FetchAPIData('/api/filter_options/snapshot');
            console.log(fetchSnapshotOptions);
            for (let key in fetchSnapshotOptions) {
                console.log(key, fetchSnapshotOptions[key]);
            }
            
            if (!studentOptions) studentOptions = optionArrayToObjectArray(fetchSnapshotOptions['student_id']);

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
        case 'course':

            break;
        default:
            return '';
    }

    /*
    'snapshot': [
        'student_id',
        'year',
        'semester',
        'week',
        'insert_datetime',
        'registration_status',
    ],
    'course': [
        'code',
        'title'
    ]
}*/
}