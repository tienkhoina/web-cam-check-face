import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendImageBase64 } from "../services/imageService";
import axiosInstance from "../api/axiosInstance"; // Import axiosInstance

const UploadImage: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({ name: "", age: "", gender: "" });
  const navigate = useNavigate();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);

      // Tạo ảnh preview từ file đã chọn
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        sendImageBase64(base64Image);
      };
      reader.readAsDataURL(image);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

  // Lấy thông tin người dùng từ backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get("/userinfo"); // Sử dụng axiosInstance
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div>
      <h1>Upload Image</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        <button type="submit" style={{ marginTop: "20px" }}>
          Upload Image
        </button>
      </form>

      {/* Hiển thị ảnh đã tải lên */}
      {imagePreview && (
        <div style={{ marginTop: "20px" }}>
          <h2>Image Preview:</h2>
          <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: "400px" }} />
        </div>
      )}

      {/* Hiển thị thông tin người dùng */}
      <div style={{ marginTop: "20px" }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {userInfo.name}</p>
        <p><strong>Age:</strong> {userInfo.age}</p>
        <p><strong>Gender:</strong> {userInfo.gender}</p>
      </div>

      {/* Nút điều hướng */}
      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/createUser")}
      >
        Create New User
      </button>
    </div>
  );
};

export default UploadImage;
