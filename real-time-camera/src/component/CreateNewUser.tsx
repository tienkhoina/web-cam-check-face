import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance"; // Sử dụng axios instance

const CreateNewUser: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const video = videoRef.current;

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const capturedImage = canvas.toDataURL("image/jpeg");
        setImageData(capturedImage); // Lưu ảnh dưới dạng Base64
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadImage(file); // Lưu file tải lên
      setImageData(null); // Xóa ảnh chụp từ camera (nếu có)
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const sendDataToServer = async (payload: {
    name: string;
    age: string;
    gender: string;
    image: string;
  }) => {
    try {
      const response = await axiosInstance.post("/create-user", payload);
      console.log(response);
      if (response.data.isExist === true) {
        alert("User already exists.");
      } else {
        if (response.data.message === "Face encoding failed") {
          alert("No face detected.");
        } else {
          alert("User created successfully.");
          navigate("/"); // Điều hướng về trang chủ hoặc trang khác
        }
      }
    } catch (error) {
      console.error("Error sending data to server:", error);
      alert("Failed to create user.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      ...formData,
      image: "",
    };

    if (imageData) {
      payload.image = imageData; // Sử dụng ảnh từ camera
      await sendDataToServer(payload);
    } else if (uploadImage) {
      try {
        const base64Image = await convertFileToBase64(uploadImage);
        payload.image = base64Image; // Sử dụng ảnh tải lên
        await sendDataToServer(payload);
      } catch (error) {
        console.error("Error converting file to Base64:", error);
        alert("Failed to process the uploaded image.");
      }
    } else {
      alert("Please provide an image (from camera or upload).");
    }
  };

  return (
    <div>
      <h1>Create New User</h1>

      {/* Camera và Nút Chụp Ảnh */}
      <div>
        <video ref={videoRef} autoPlay style={{ width: "100%", maxHeight: "300px" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <button onClick={handleCaptureImage}>Capture Image</button>
      </div>

      {/* Upload Ảnh */}
      <div>
        <label htmlFor="file-upload">
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileUpload}
          />
          Upload Image
        </label>
      </div>

      {/* Hiển Thị Ảnh */}
      <div>
        {imageData ? (
          <img src={imageData} alt="Captured" style={{ width: "100%", maxHeight: "300px" }} />
        ) : uploadImage ? (
          <p>Image selected: {uploadImage.name}</p>
        ) : (
          <p>No image selected.</p>
        )}
      </div>

      {/* Form Điền Thông Tin */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default CreateNewUser;
