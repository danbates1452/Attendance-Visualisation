import { useEffect, useState } from "react";
import { Col, Container, Form, Row, Tab } from "react-bootstrap";
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


function getStudentIDOptions() {
    let studOptions = [];
    let fetchStudent = FetchAPIData('/api/filter/student'); //no args so we get all students
    for (let key in fetchStudent) {
        studOptions.push({value: key, label: key})
    }
    return studOptions;
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
            let levelOptions = [
                {value: 'ug', label: 'Undergraduate'},
                {value: 'pgt', label: 'Postgraduate Taught'}
            ]; 

            let stageOptions = [
                {value: 1, label: '1'},
                {value: 2, label: '2'},
                {value: 3, label: '3'},
                {value: 4, label: '4'},
                {value: 5, label: '5'}
            ];

            let courseOptions = [];
            let fetchCourse = FetchAPIData('/api/courses'); //all courses
            for (let key in fetchCourse) {
                courseOptions.push({value: key, label: key + ' ' + fetchCourse[key]['title']});
            }
            
            if (!studentOptions) { //if unset
                studentOptions = getStudentIDOptions();
            }
            
            //<Form.Control type="text" pattern="/^\d+$/"/>
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
            if (!studentOptions) { //if unset
                studentOptions = getStudentIDOptions();
            }

            console.log(studentOptions);

            let fetchSnapshotOptions = FetchAPIData('/api/filter_options/snapshot');
            console.log(fetchSnapshotOptions);
            for (let key in fetchSnapshotOptions) {
                console.log(key, fetchSnapshotOptions[key]);
            }

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
            break;
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