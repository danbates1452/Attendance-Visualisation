import { useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import FetchAPIData from "../helper/fetchApiData";

export default function FiltersPage() {
    const [table, setTable] = useState([{table: ''}])

    return(
        <Container>
            FILTER UI
            <Form>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label htmlFor="tableSelect">Table</Form.Label>
                            <Form.Select id="tableSelect" onChange={this.FilterOptions}>
                                <option selected disabled hidden>Select a table</option>
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
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label></Form.Label>
                        </Form.Group>
                    </Col>
                    <Col>

                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

function FilterOptions(table) {
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
    }
    let filters = (<></>);
    if (table !== null && Object.keys(all_filters).includes(table)) {
        //if the table name is in filters object
        filters = all_filters[table];
        filters = filtersToForm(filters);
    }

    
}

function filtersToForm(filter_names) {

}