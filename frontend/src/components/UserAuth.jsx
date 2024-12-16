import React, { useState } from 'react';
import axios from 'axios';

const UserAuth = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  const checkUsername = async (username) => {
    if (username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/check-username', { username });
      setIsUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking username:', error);
    }
    setIsCheckingUsername(false);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    checkUsername(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      return;
    }
    if (password.length < 4) {
      setError('Пароль должен содержать минимум 4 символа');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/auth', {
        username,
        password
      });
      
      localStorage.setItem('guestUser', JSON.stringify(response.data));
      onAuthSuccess(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка при авторизации');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Регистрация для комментирования</h3>
      <p className="text-sm text-gray-600 mb-4">
        Введите желаемое имя пользователя и пароль. Если имя свободно, будет создан новый аккаунт.
        Если имя занято, нужно будет ввести правильный пароль.
      </p>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Имя пользователя (минимум 3 символа)"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full p-2 border rounded ${
                isUsernameAvailable === true ? 'border-green-500' :
                isUsernameAvailable === false ? 'border-yellow-500' : ''
              }`}
              required
              minLength={3}
            />
            {username.length >= 3 && (
              <div className="text-sm mt-1">
                {isCheckingUsername ? (
                  <span className="text-gray-500">Проверка имени...</span>
                ) : isUsernameAvailable ? (
                  <span className="text-green-500">Имя свободно - будет создан новый аккаунт</span>
                ) : (
                  <span className="text-yellow-500">Имя занято - введите пароль для входа</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div>
          <input
            type="password"
            placeholder="Пароль (минимум 4 символа)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
            minLength={4}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {isUsernameAvailable ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default UserAuth;
