import React, { useState } from "react";
import { sendImageBase64 } from "../services/imageService"; // Import hàm gửi ảnh

const UploadImage: React.FC = () => {
  const [image, setImage] = useState<File | null>(null); // State để lưu ảnh
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State để lưu ảnh base64 cho việc hiển thị

  // Hàm xử lý thay đổi khi người dùng chọn ảnh
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);

      // Tạo ảnh preview từ file đã chọn
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Cập nhật ảnh preview
      };
      reader.readAsDataURL(file); // Đọc ảnh dưới dạng Base64
    }
  };

  // Hàm gửi ảnh lên server
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;  // Đọc file thành Base64
        sendImageBase64(base64Image);  // Gửi ảnh dưới dạng Base64
      };
      reader.readAsDataURL(image);  // Đọc file ảnh
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

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
    </div>
  );
};

export default UploadImage;
