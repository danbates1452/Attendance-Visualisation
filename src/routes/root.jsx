import {Navbar, Nav, Container} from 'react-bootstrap';
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {RoleWrapper, getCurrentUserRole} from '../helper/roles';

export default function Root() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            navigate('/home') //auto-redirect to /home from /
        }
    }, [location, navigate])

    return (
        <>
            <Navigation/>
            <div id='body'>
                <Outlet/>
            </div>
        </>
    );
}

function Navigation() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand as={Link} to="/home"><strong >Attendance Visualisation</strong></Navbar.Brand>
            <Navbar.Toggle aria-controls="application-navbar"></Navbar.Toggle>
            <Navbar.Collapse id="application-navbar">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/home">Home</Nav.Link>
                <Nav.Link as={Link} to="/filters">Filters</Nav.Link>
                <RoleWrapper role={getCurrentUserRole()} allowedRoles={'admin'}>
                  <Nav.Link as={Link} to="/upload">Upload Data</Nav.Link>
                  <Nav.Link as={Link} to="/users">User Management</Nav.Link>
                  <Nav.Link as={Link} to="/data">Data Management</Nav.Link>
                </RoleWrapper>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )
}