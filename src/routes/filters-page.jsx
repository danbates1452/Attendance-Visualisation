import { useEffect, useState } from "react";
import { Col, Container, Form, Row, Tab } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";
import Select from 'react-select';

export default function FiltersPage() {
    const [filters, setFilters] = useState([<TableFilters tableName="EMPTY"/>]);

    const handleSelect = (event) => {setFilters(<TableFilters tableName={event.target.value}/>)}

    return(
        <Container fluid className="p-3">
            FILTER UI
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
/*
const all_filters = {
    'student': [
        'student_id',
        'level',
        'stage',
        'course_code'
    ],
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

function TableFilters({tableName}) {
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

        let studentOptions = [];
        let fetchStudent = FetchAPIData('/api/filter/student'); //no args so we get all students
        for (let key in fetchStudent) {
            studentOptions.push({value: key, label: key})
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
            break;
        case 'snapshot':

            break;
        case 'course':

            break;
        default:
            return '';
    }
}