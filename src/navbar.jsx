import {Navbar, Nav, Container} from 'react-bootstrap';
import {RoleWrapper, getCurrentUserRole} from './roles';

export default function Navigation(isAdmin=false) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand href='#'><strong >Attendance Visualisation</strong></Navbar.Brand>
            <Navbar.Toggle aria-controls="application-navbar"></Navbar.Toggle>
            <Navbar.Collapse id="application-navbar">
              <Nav className="me-auto">
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="/filter">Filters</Nav.Link>
                <RoleWrapper role={getCurrentUserRole()} allowedRoles={'admin'}>
                  <Nav.Link href="/upload">Upload Data</Nav.Link>
                  <Nav.Link href="/users">User Management</Nav.Link>
                  <Nav.Link href="/data">Data Management</Nav.Link>
                </RoleWrapper>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )
}