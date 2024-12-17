import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Home';
import ContentList from './ContentList';
import Login from './Login';
import UploadContent from './UploadContent';
import Gallery from './Gallery';

function App() {
  const [user, setUser] = useState(null);

  // Загружаем пользователя из localStorage при запуске
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    // userData содержит { token, user }
    const { token, user } = userData;
    
    // Сохраняем токен отдельно
    localStorage.setItem('token', token);
    
    // Сохраняем данные пользователя
    localStorage.setItem('user', JSON.stringify(user));
    
    // Устанавливаем данные пользователя в состояние
    setUser(user);
  };

  const handleLogout = () => {
    // Очищаем данные при выходе
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<ContentList user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/upload" element={<UploadContent user={user} />} />
        <Route path="/gallery" element={<Gallery user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
