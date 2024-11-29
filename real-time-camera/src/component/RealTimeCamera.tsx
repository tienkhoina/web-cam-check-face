import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendImageBase64 } from "../services/imageService"; // Đảm bảo hàm này được định nghĩa
import axiosInstance from "../api/axiosInstance"; // Import axiosInstance

const RealTimeCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "", age: "", gender: "" });

  // Bật camera và chụp ảnh mỗi giây
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

    // Chụp ảnh và gửi ảnh mỗi giây
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const video = videoRef.current;

        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = canvas.toDataURL("image/jpeg");
          sendImageBase64(imageData); // Gửi ảnh về server
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Lấy thông tin người dùng từ backend mỗi giây với axiosInstance
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Gọi API từ backend để lấy thông tin người dùng
        const response = await axiosInstance.get('/userinfo');
        setUserInfo(response.data);  // Cập nhật thông tin người dùng
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }, 1000);  // Gọi mỗi 1 giây

    // Cleanup
    return () => {
      clearInterval(interval);  // Dừng gọi API khi component unmount
    };
  }, []); // Chạy 1 lần khi component mount

  return (
    <div>
      <h1>Real-Time Camera</h1>
      <video ref={videoRef} autoPlay style={{ width: "100%", maxHeight: "400px" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Hiển thị thông tin người dùng */}
      <div style={{ marginTop: "20px" }}>
        <h2>User Information</h2>
        <p><strong>Name:</strong> {userInfo.name}</p>
        <p><strong>Age:</strong> {userInfo.age}</p>
        <p><strong>Gender:</strong> {userInfo.gender}</p>
      </div>

      <button
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/upload")}
      >
        Upload Image
      </button>
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

export default RealTimeCamera;
