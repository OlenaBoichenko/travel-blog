import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/content');
      // Фильтруем только медиа-контент
      const mediaContent = response.data.map(item => ({
        id: item._id,
        url: item.mediaUrl,
        type: item.mediaType,
        title: item.title,
        description: item.description
      }));
      setMedia(mediaContent);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Галерея путешествия</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'image' ? (
                <img
                  src={`http://localhost:5000${item.url}`}
                  alt={item.title}
                  className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <video
                  src={`http://localhost:5000${item.url}`}
                  className="w-full h-48 object-cover"
                  muted
                  onMouseOver={e => e.target.play()}
                  onMouseOut={e => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium px-4 text-center">
                    {item.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal для просмотра медиа */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              {selectedMedia.type === 'image' ? (
                <img
                  src={`http://localhost:5000${selectedMedia.url}`}
                  alt={selectedMedia.title}
                  className="w-full max-h-[80vh] object-contain"
                />
              ) : (
                <video
                  src={`http://localhost:5000${selectedMedia.url}`}
                  className="w-full max-h-[80vh] object-contain"
                  controls
                  autoPlay
                />
              )}
              <button
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                onClick={() => setSelectedMedia(null)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {selectedMedia.title}
              </h3>
              <p className="text-gray-600">{selectedMedia.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
