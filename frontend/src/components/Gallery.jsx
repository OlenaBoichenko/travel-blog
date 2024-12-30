import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { API_URL } from "../config";
import UploadImage from "./UploadImage";
import { Loader } from "./Loader";

const Gallery = ({ user }) => {
  const [images, setImages] = useState([]);
  const [userReactions, setUserReactions] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/gallery`);
      setImages(response.data);

      // Инициализируем состояние реакций
      const initialReactions = {};
      response.data.forEach((item) => {
        initialReactions[item._id] = {
          likes: false,
          hearts: false,
        };
      });
      setUserReactions(initialReactions);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (imageId, reactionType) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${API_URL}/api/gallery/${imageId}/reactions`,
        { type: reactionType },
        { headers }
      );

      // Обновляем состояние реакций
      setUserReactions((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [reactionType]: !prev[imageId][reactionType],
        },
      }));

      // Обновляем список изображений
      fetchImages();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  const getReactionCount = (item, reactionType) => {
    if (!item?.reactions) return 0;

    const reactions = item.reactions;
    const userReactions = reactions[reactionType] || [];
    const guestReactions =
      reactions[
        `guest${reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}`
      ] || [];
    return userReactions.length + guestReactions.length;
  };

  const handleImageUploaded = () => {
    fetchImages(); // Обновляем список изображений после загрузки
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Галерея</h1>

      {user && user.role === "admin" && (
        <div className="mb-4">
          <UploadImage user={user} onImageUploaded={handleImageUploaded} />
        </div>
      )}

      {isLoading ? (
        <div className="lds-container">
            <p>Изображения загружаются...</p>
          <Loader />
        </div>
      ) : (
      <div className="row mt-4">
        {images.map((item) => (
          <div key={item._id} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="ratio ratio-1x1">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="img-fluid"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">{item.title}</h5>
                  <small className="text-muted">
                    {format(new Date(item.createdAt), "dd.MM.yyyy")}
                  </small>
                </div>
                <p className="card-text">{item.description}</p>
                <div className="mt-auto">
                  <div className="d-flex justify-content-start gap-3">
                    <button
                      onClick={() => handleReaction(item._id, "likes")}
                      className={`btn btn-sm d-flex align-items-center gap-1 ${
                        userReactions[item._id]?.likes
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                    >
                      👍 <span>{getReactionCount(item, "likes")}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(item._id, "hearts")}
                      className={`btn btn-sm d-flex align-items-center gap-1 ${
                        userReactions[item._id]?.hearts
                          ? "btn-danger"
                          : "btn-outline-danger"
                      }`}
                    >
                      ❤️ <span>{getReactionCount(item, "hearts")}</span>
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

export default Gallery;
