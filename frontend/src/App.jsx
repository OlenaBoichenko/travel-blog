import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './Home';
import ContentList from './ContentList';
import Login from './Login';
import UploadContent from './UploadContent';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<ContentList user={user} />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/upload" element={<UploadContent user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
