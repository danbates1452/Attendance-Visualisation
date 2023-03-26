import { useEffect, useState } from "react";
import { Col, Container, Form, Row, Tab } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";

export default function FiltersPage() {
    const [filters, setFilters] = useState([<TableFilters tableName="EMPTY"/>]);

    const handleSelect = (event) => {setFilters(<TableFilters tableName={event.target.value}/>)}

    return(
        <Container>
            FILTER UI
            <Form>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label htmlFor="tableSelect">Table</Form.Label>
                            <Form.Select id="tableSelect" onChange={handleSelect} defaultValue="null">
                                <option disabled hidden value="null">Select a table</option>
                                <option value="student">Students</option>
                                <option value="snapshot">Snapshots</option>
                                <option value="course">Courses</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col></Col>
                    <Col></Col>
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
            return (
                <>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Student ID</Form.Label>
                                <Form.Control type="text" pattern="/^\d+$/"/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Level</Form.Label>
                                <Form.Select defaultValue="null">
                                    <option disabled hidden value="null">Select a Level</option>
                                    <option value="ug">Undergraduate</option>
                                    <option value="pgt">Postgraduate Taught</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Stage</Form.Label>
                                <Form.Select defaultValue={["null"]} multiple>
                                    <option disabled hidden value="null">Select a Stage</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Course Code</Form.Label>
                                <Form.Control type="text"/> 
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>

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