import axiosInstance from "../api/axiosInstance";

export const sendImageBase64 = async (imageData: string): Promise<void> => {
  try {
    const response = await axiosInstance.post("/upload", {
      image: imageData,
    });
    console.log("Server response:", response.data);
  } catch (error) {
    console.error("Error sending image:", error);
  }
};
