import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const UploadImage = ({ user, onImageUploaded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setError("");
    } else {
      setError("Пожалуйста, выберите изображение");
      setImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Пожалуйста, выберите изображение");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", image);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "Не найден токен авторизации. Пожалуйста, войдите в систему заново."
        );
      }

      const response = await axios.post(`${API_URL}/api/gallery`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setTitle("");
        setDescription("");
        setImage(null);
        if (onImageUploaded) {
          onImageUploaded(response.data);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error.response?.status === 403) {
        setError(
          "Доступ запрещен. Убедитесь, что вы вошли как администратор и попробуйте войти заново."
        );
      } else {
        setError(error.message || "Ошибка при загрузке изображения");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4 mx-auto" style={{ maxWidth: "600px" }}>
        <h2 className="h4 fw-bold mb-4 text-center">Загрузить изображение</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="3"
              className="form-control"
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Изображение</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="form-control"
            />
          </div>

          {error && (
            <div className="alert alert-danger text-sm" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100"
          >
            {loading ? "Загрузка..." : "Загрузить"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadImage;
