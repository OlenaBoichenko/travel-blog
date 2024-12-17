import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isRegistering ? 'register' : 'login';
      const response = await axios.post(`${API_URL}/api/auth/${endpoint}`, {
        username,
        password,
      });

      console.log('Login response:', response.data);

      // Проверяем наличие токена и данных пользователя
      if (response.data.token && (response.data.user || response.data.role)) {
        localStorage.setItem('token', response.data.token);
        
        // Если данные пользователя в response.data.user, используем их
        // Иначе создаем объект пользователя из данных в корне ответа
        const userData = response.data.user || {
          id: response.data.id,
          username: response.data.username,
          role: response.data.role
        };
        
        onLogin({ token: response.data.token, user: userData });
        navigate('/');
      } else {
        setError('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setError(error.response?.data?.message || 'Произошла ошибка при авторизации');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="h3">{isRegistering ? 'Регистрация' : 'Вход в аккаунт'}</h2>
          <p>
            {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Имя пользователя"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            {isRegistering ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
