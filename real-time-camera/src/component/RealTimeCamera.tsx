import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate từ React Router
import {sendImageBase64} from "../services/imageService"

const RealTimeCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const navigate = useNavigate();  // Khai báo useNavigate để chuyển hướng

  useEffect(() => {
    // Bật camera
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

    // Chụp ảnh và gửi ảnh mỗi 0.5 giây nếu đang chụp
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const video = videoRef.current;

        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = canvas.toDataURL("image/jpeg"); // Lấy Base64
          sendImageBase64(imageData); // Gửi ảnh về server
        }
      }
    }, 500);

    // Cleanup
    return () => {
      clearInterval(interval);
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isCapturing]);

  // Hàm xử lý khi nhấn nút Upload
  const handleUploadClick = () => {
    setIsCapturing(false);  // Ngừng chụp ảnh
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());  // Tắt camera
    navigate("/upload");  // Điều hướng đến trang UploadImage
  };

  return (
    <div>
      <h1>Real-Time Camera</h1>
      <video ref={videoRef} autoPlay style={{ width: "100%", maxHeight: "400px" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button onClick={handleUploadClick} style={{ marginTop: "20px" }}>
        Upload Image
      </button>
    </div>
  );
};

export default RealTimeCamera;
