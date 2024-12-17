import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './config';

const UploadContent = ({ user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Необходимо авторизоваться');
        setLoading(false);
        return;
      }

      await axios.post(`${API_URL}/api/content`, {
        title,
        description,
        youtubeUrl
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Перенаправляем на страницу блога после успешной загрузки
      navigate('/blog');
    } catch (error) {
      console.error('Error uploading content:', error);
      setError(error.response?.data?.message || 'Ошибка при добавлении видео');
    } finally {
      setLoading(false);
    }
  };

  // Если пользователь не авторизован или не админ, показываем сообщение
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Только администраторы могут добавлять контент
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
  <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: '800px' }}>
    <h1 className="h3 fw-bold mb-4">Добавить новое видео</h1>

    {error && (
      <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
        <svg
          className="bi flex-shrink-0 me-2"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8.93 6.588a.5.5 0 0 0-.86 0L4.288 12.4A.5.5 0 0 0 4.714 13h6.572a.5.5 0 0 0 .427-.8L8.93 6.588zM8 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
        <div>{error}</div>
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          Заголовок
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Описание
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="form-control"
          required
        ></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="youtubeUrl" className="form-label">
          Ссылка на YouTube видео
        </label>
        <input
          type="url"
          id="youtubeUrl"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="form-control"
          required
        />
        <div className="form-text">
          Поддерживаются ссылки формата youtube.com/watch?v= и youtu.be/
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary ${loading ? 'disabled' : ''}`}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Добавление...
            </>
          ) : (
            'Добавить видео'
          )}
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default UploadContent;
