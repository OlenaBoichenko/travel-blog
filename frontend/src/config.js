// Определяем URL API в зависимости от окружения
export const API_URL = import.meta.env.PROD 
  ? 'https://travel-blog-gyl6.onrender.com'
  : 'http://localhost:5001';
