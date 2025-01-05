import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaMapMarkerAlt, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const previosYear =  new Date().getFullYear() - 1;

  return (
    <footer className="bg-primary text-light py-4 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h5>Contact</h5>
            <p className="mb-1">
              <FaEnvelope className="me-2" />
              <a href="mailto:ol.boichenko.dev@gmail.com" className="text-light text-decoration-none">
                ol.boichenko.dev@gmail.com
              </a>
            </p>
            <p className="mb-1">
              <FaMapMarkerAlt className="me-2" />
              Victoria, BC
            </p>
          </Col>
          
          <Col md={4} className="text-center mb-3 mb-md-0">
            <p className="mb-0">
              © {previosYear}{'-'}{currentYear}{' '}
              <a 
                href="https://olenaportfolio.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-light text-decoration-none"
              >
                Olena Boichenko
              </a>
            </p>
            <p className="text-dark small mb-0">All rights reserved</p>
          </Col>

          <Col md={4} className="text-center text-md-end">
            <h5>Follow Me</h5>
            <div>
              <a 
                href="https://github.com/OlenaBoichenko" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-light me-3"
              >
                <FaGithub size={24} />
              </a>
              <a 
                href="https://www.linkedin.com/in/olena-boichenko-dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-light"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
