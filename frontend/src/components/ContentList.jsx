import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { API_URL } from '../config';
import { Loader } from './Loader'

const ContentList = ({ user }) => {
  const [content, setContent] = useState([]);
  const [comments, setComments] = useState({});
  const [userReactions, setUserReactions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async (contentId) => {
    const comment = comments[contentId] || '';
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
      setComments(prev => ({ ...prev, [contentId]: '' }));
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

    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1` : null;
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Путевые заметки</h1>
      
      {isLoading ? (
        <div className="lds-container">
            <p>Заметки загружаются...</p>
          <Loader />
        </div>
      ) : (
      <div className="row row-cols-1 g-4">
        {content.map((item) => (
          <div key={item._id} className="col-md-4 d-flex align-items-stretch">
            <div className="card shadow-sm">
              {item.youtubeUrl && (
                <div className="ratio ratio-16x9">
                  <iframe
                    src={getYouTubeEmbedUrl(item.youtubeUrl)}
                    title={item.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 card-title mb-0">{item.title}</h2>
                  <span className="text-muted small">
                    {format(new Date(item.createdAt), 'dd.MM.yyyy')}
                  </span>
                </div>

                <p className="card-text">{item.description}</p>

                <div className="d-flex gap-3 mb-4">
                  <button
                    onClick={() => handleReaction(item._id, 'likes')}
                    className={`btn btn-outline-primary ${userReactions[item._id]?.likes ? 'active' : ''}`}
                  >
                    👍 {getReactionCount(item, 'likes')}
                  </button>
                  <button
                    onClick={() => handleReaction(item._id, 'hearts')}
                    className={`btn btn-outline-danger ${userReactions[item._id]?.hearts ? 'active' : ''}`}
                  >
                    ❤️ {getReactionCount(item, 'hearts')}
                  </button>
                </div>

                <div className="border-top pt-4">
                  <h3 className="h6 mb-4">Комментарии</h3>
                  
                  <div className="list-group mb-4">
                    {(item.comments || []).map((comment, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold">{comment.author}</span>
                          <span className="text-muted small">
                            {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="mb-0">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="input-group">
                    <input
                      type="text"
                      value={comments[item._id] || ''}
                      onChange={(e) =>
                        setComments((prev) => ({ ...prev, [item._id]: e.target.value }))
                      }
                      placeholder="Оставьте комментарий..."
                      className="form-control"
                    />
                    <button
                      onClick={() => handleComment(item._id)}
                      className="btn btn-primary"
                    >
                      Отправить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default ContentList;
