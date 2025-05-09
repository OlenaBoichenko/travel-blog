import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const Home = () => {
  return (
    <div className="pt-5">
      <div className="bg-dark text-white py-5" style={{ minHeight: '60vh' }}>
        <div className="hero-image" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7
        }} />
        <Container className="container-lg">
          <Row className="justify-content-center">
            <Col lg={8} md={10} className="text-center">
              <h1 className="display-4 fw-bold mb-4" style={{ position: 'relative', zIndex: 1 }}>
                Из Оттавы в Ванкувер
              </h1>
              <p className="lead mb-4" style={{ position: 'relative', zIndex: 1 }}>
                Присоединяйтесь к нашему путешествию через всю Канаду! 5000 километров, 10-12 дней, множество городов и незабываемых впечатлений.
              </p>
              <Button as={Link} to="/blog" variant="light" size="lg" style={{ position: 'relative', zIndex: 1 }}>
                Читать блог
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="container-lg py-5">
        <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 justify-content-center">
          <Col className="col-sm-6 col-lg-4">
            <Card className="h-100 shadow-sm text-center">
              <Card.Body>
                <h3 className="display-6 text-primary">5000+ км</h3>
                <p className="text-muted mb-0">Общая дистанция</p>
              </Card.Body>
            </Card>
          </Col>
          <Col className="col-sm-6 col-lg-4">
            <Card className="h-100 shadow-sm text-center">
              <Card.Body>
                <h3 className="display-6 text-primary">10-12 дней</h3>
                <p className="text-muted mb-0">Продолжительность</p>
              </Card.Body>
            </Card>
          </Col>
          <Col className="col-sm-6 col-lg-4">
            <Card className="h-100 shadow-sm text-center">
              <Card.Body>
                <h3 className="display-6 text-primary">6 провинций</h3>
                <p className="text-muted mb-0">Через всю страну</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="py-5">
          <Row>
            <Col className="col-lg-8 col-md-10 mx-auto text-center">
              <h2 className="display-5 mb-4">Наш маршрут</h2>
              <p className="text-muted mb-5">
                Из столицы Канады через живописные места к тихоокеанскому побережью
              </p>
            </Col>
          </Row>
          <Row>
            <Col className="col-lg-8 col-md-10 mx-auto">
              <div className="route-list">
                {[
                   { name: 'Ottawa, ON', link: 'https://www.tripadvisor.ru/Tourism-g155004-Ottawa_Ontario-Vacations.html' },
                   { name: 'Sudbury, ON', link: 'https://www.tripadvisor.ru/Tourism-g155016-Sudbury_Northeastern_Ontario_Ontario-Vacations.html' },
                   { name: 'Wawa, ON', link: 'https://www.tripadvisor.ru/Tourism-g182156-Wawa_Northeastern_Ontario_Ontario-Vacations.html' },
                   { name: 'Dryden, ON', link: 'https://www.tripadvisor.ru/Tourism-g181721-Dryden_Kenora_District_Ontario-Vacations.html' }, 
                   { name: 'Minnedosa, MB', link: 'https://www.tripadvisor.ru/Tourism-g1871869-Minnedosa_Manitoba-Vacations.html' },
                   { name: 'Langham, SK', link: 'https://www.tripadvisor.ru/Tourism-g3671650-Langham_Saskatchewan-Vacations.html' }, 
                   { name: 'Wabamun, AB', link: 'https://www.tripadvisor.ru/Tourism-g2464434-Wabamun_Alberta-Vacations.html' }, 
                   { name: 'Valemount, BC', link: 'https://www.tripadvisor.ru/Tourism-g181768-Valemount_British_Columbia-Vacations.html' }, 
                   { name: 'Kamloops, BC', link: 'https://www.tripadvisor.ru/Tourism-g154932-Kamloops_British_Columbia-Vacations.html' }, 
                   { name: 'Vancouver, BC', link: 'https://www.tripadvisor.ru/Tourism-g154943-Vancouver_British_Columbia-Vacations.html' } 
                ].map((city, index) => (
                  <Card key={index} className="mb-3 shadow-sm">
                    <Card.Body className="d-flex align-items-center">
                      <div className="route-number me-3">
                        <span className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                              style={{ width: '40px', height: '40px' }}>
                          {index + 1}
                        </span>
                      </div>
                      <h5 className="mb-0">
                        <a href={city.link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                          {city.name}
                        </a>
                      </h5>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        <div className="py-5">
          <Row>
            <Col className="col-lg-8 col-md-10 mx-auto text-center">
              <h2 className="display-5 mb-4">Что мы увидим</h2>
            </Col>
          </Row>
          <Row className="row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
            {[
              {
                title: 'Великие озера',
                description: 'Крупнейшая система пресноводных озёр на Земле'
              },
              {
                title: 'Канадские прерии',
                description: 'Бескрайние равнины центральной Канады'
              },
              {
                title: 'Скалистые горы',
                description: 'Величественные горные хребты и национальные парки'
              },
              {
                title: 'Тихий океан',
                description: 'Живописное побережье Британской Колумбии'
              },
              {
                title: 'Городские достопримечательности',
                description: 'Уникальная архитектура и культура каждого города'
              },
              {
                title: 'Национальные парки',
                description: 'Удивительная природа и дикая жизнь Канады'
              }
            ].map((item) => (
              <Col key={item.title}>
                <Card className="h-100 shadow-sm text-center">
                  <Card.Body>
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text text-muted">{item.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Home;
