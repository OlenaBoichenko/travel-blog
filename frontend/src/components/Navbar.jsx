import React, {useState} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const NavigationBar = ({ user, onLogout }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = (path) => location.pathname === path;

  const handleToggle = () => setIsExpanded(!isExpanded); 
  const handleLinkClick = () => setIsExpanded(false); 

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" expanded={isExpanded}>
      <Container>
        <Navbar.Brand as={Link} to="/">Ottawa to Vancouver</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={handleToggle} />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')} onClick={handleLinkClick}>
              Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/blog" active={isActive('/blog')} onClick={handleLinkClick}>
              Блог
            </Nav.Link>
            <Nav.Link as={Link} to="/map" active={isActive('/map')} onClick={handleLinkClick}>
              Интерактивная карта
            </Nav.Link>
            <Nav.Link as={Link} to="/gallery" active={isActive('/gallery')} onClick={handleLinkClick}>
              Галерея
            </Nav.Link>
            {user && user.role === 'admin' && (
              <Nav.Link as={Link} to="/upload" active={isActive('/upload')} onClick={handleLinkClick}>
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
