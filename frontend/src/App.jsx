import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Home';
import ContentList from './ContentList';
import Login from './Login';
import UploadContent from './UploadContent';
import Gallery from './Gallery';
import InteractiveMap from './components/InteractiveMap';
import { API_URL } from './config';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.message) {
          setUser(data);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
      });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const navLinks = [
    { to: '/', text: 'Главная' },
    { to: '/map', text: 'Интерактивная карта' },
    { to: '/gallery', text: 'Галерея' },
    { to: '/upload', text: 'Загрузить контент', requiresAuth: true },
    { to: '/login', text: 'Вход', hideWhenAuth: true },
    { to: '/blog', text: 'Блог' },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        links={navLinks}
      />
      <main className="flex-grow-1 container py-5 mt-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<ContentList user={user} />} />
          <Route path="/map" element={<InteractiveMap />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/upload" element={<UploadContent user={user} />} />
          <Route path="/gallery" element={<Gallery user={user} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
