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
            <Navbar.Brand as={Link} to="/home">
              <img
              alt=""
              src="/logo512.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
              />{' '}
              <strong >Attendance Visualisation</strong>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="application-navbar"></Navbar.Toggle>
            <Navbar.Collapse id="application-navbar">
              <Nav className="me-auto">
                <Nav.Link eventKey="link-1" as={Link} to="/home">Home</Nav.Link>
                <Nav.Link eventKey="link-2" as={Link} to="/filters">Filters</Nav.Link>
                {/*
                <RoleWrapper role={getCurrentUserRole()} allowedRoles={'admin'}>
                  <Nav.Link eventKey="link-3" as={Link} to="/users">User Management</Nav.Link>
                  <Nav.Link eventKey="link-4"as={Link} to="/data">Data Management</Nav.Link>
                </RoleWrapper>
                <Nav.Link eventKey="link-5" as={Link} to="/login">Login</Nav.Link>
                */}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )
}