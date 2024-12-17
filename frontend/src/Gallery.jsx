import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { API_URL } from './config';
import UploadImage from './UploadImage';

const Gallery = ({ user }) => {
  const [images, setImages] = useState([]);
  const [userReactions, setUserReactions] = useState({});

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/gallery`);
      setImages(response.data);
      
      // Инициализируем состояние реакций
      const initialReactions = {};
      response.data.forEach(item => {
        initialReactions[item._id] = {
          likes: false,
          hearts: false
        };
      });
      setUserReactions(initialReactions);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleReaction = async (imageId, reactionType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/gallery/${imageId}/reactions`, {
        type: reactionType
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setUserReactions(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [reactionType]: !prev[imageId]?.[reactionType]
        }
      }));

      await fetchImages();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const getReactionCount = (item, reactionType) => {
    if (!item?.reactions) return 0;
    
    const reactions = item.reactions;
    const userReactions = reactions[reactionType] || [];
    const guestReactions = reactions[`guest${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`] || [];
    return userReactions.length + guestReactions.length;
  };

  const handleImageUploaded = (newImage) => {
    setImages(prevImages => [newImage, ...prevImages]);
    setUserReactions(prev => ({
      ...prev,
      [newImage._id]: {
        likes: false,
        hearts: false
      }
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Галерея</h1>
      
      <UploadImage user={user} onImageUploaded={handleImageUploaded} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {images.map((item) => (
          <article key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={`${API_URL}${item.imageUrl}`}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                <span className="text-sm text-gray-500">
                  {format(new Date(item.createdAt), 'dd.MM.yyyy')}
                </span>
              </div>

              <p className="text-gray-700 mb-6">{item.description}</p>

              <div className="flex space-x-6">
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
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
