import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { API_URL } from './config';

const ContentList = ({ user }) => {
  const [content, setContent] = useState([]);
  const [comment, setComment] = useState('');
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/content`);
      setContent(response.data);
      const initialReactions = {};
      response.data.forEach(item => {
        initialReactions[item._id] = {
          likes: false,
          hearts: false
        };
      });
      setUserReactions(initialReactions);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleComment = async (contentId) => {
    if (!comment.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/api/content/${contentId}/comments`, {
        text: comment,
        author: user ? user.username : 'Гость'
      });

      setContent(content.map(item =>
        item._id === contentId
          ? { ...item, comments: [...(item.comments || []), response.data] }
          : item
      ));
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReaction = async (contentId, reactionType) => {
    try {
      await axios.post(`${API_URL}/api/content/${contentId}/reactions`, {
        type: reactionType
      });

      setUserReactions(prev => ({
        ...prev,
        [contentId]: {
          ...prev[contentId],
          [reactionType]: !prev[contentId][reactionType]
        }
      }));

      await fetchContent();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const getReactionCount = (item, reactionType) => {
    const reactions = item.reactions || {};
    const userReactions = reactions[reactionType] || [];
    const guestReactions = reactions[`guest${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`] || [];
    return userReactions.length + guestReactions.length;
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId;
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1];
    }

    if (videoId && videoId.includes('&')) {
      videoId = videoId.split('&')[0];
    }

    // Добавляем параметры для улучшения производительности и уменьшения рекламы
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Путевые заметки</h1>
      
      <div className="space-y-8">
        {content.map((item) => (
          <article key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* YouTube видео */}
            {item.youtubeUrl && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getYouTubeEmbedUrl(item.youtubeUrl)}
                  className="absolute top-0 left-0 w-full h-full"
                  title={item.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}

            {/* Контент */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                <span className="text-sm text-gray-500">
                  {format(new Date(item.createdAt), 'dd.MM.yyyy')}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{item.description}</p>

              {/* Реакции */}
              <div className="flex space-x-6 mb-6">
                <button
                  onClick={() => handleReaction(item._id, 'likes')}
                  className={`flex items-center space-x-2 transition-all ${
                    userReactions[item._id]?.likes 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <span className="text-2xl">👍</span>
                  <span className="font-medium">{getReactionCount(item, 'likes')}</span>
                </button>

                <button
                  onClick={() => handleReaction(item._id, 'hearts')}
                  className={`flex items-center space-x-2 transition-all ${
                    userReactions[item._id]?.hearts 
                      ? 'text-red-600' 
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <span className="text-2xl">❤️</span>
                  <span className="font-medium">{getReactionCount(item, 'hearts')}</span>
                </button>
              </div>

              {/* Комментарии */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Комментарии</h3>
                
                <div className="space-y-4 mb-6">
                  {(item.comments || []).map((comment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author}
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>

                {/* Форма комментария */}
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Оставьте комментарий..."
                    className="flex-1 min-w-0 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleComment(item._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ContentList;
