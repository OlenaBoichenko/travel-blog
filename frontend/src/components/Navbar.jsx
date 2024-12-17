import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const NavigationBar = ({ user, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">Ottawa to Vancouver</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')}>
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/blog" active={isActive('/blog')}>
              Блог
            </Nav.Link>
            <Nav.Link as={Link} to="/map" active={isActive('/map')}>
              Интерактивная карта
            </Nav.Link>
            <Nav.Link as={Link} to="/gallery" active={isActive('/gallery')}>
              Галерея
            </Nav.Link>
            {user && user.role === 'admin' && (
              <Nav.Link as={Link} to="/upload" active={isActive('/upload')}>
                Добавить пост
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {user ? (
              <Button variant="light" onClick={onLogout}>
                Выйти
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn btn-light">
                Войти
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
