import cv2
import dlib
import numpy as np
import os

# Đảm bảo rằng file mô hình nằm trong cùng thư mục với script
current_dir = os.path.dirname(os.path.abspath(__file__))  # Lấy đường dẫn thư mục chứa script hiện tại
shape_predictor_path = os.path.join(current_dir, "shape_predictor_5_face_landmarks.dat")
face_rec_model_path = os.path.join(current_dir, "dlib_face_recognition_resnet_model_v1.dat")

# Tải mô hình nhận diện khuôn mặt và nhận diện đặc trưng
detector = dlib.get_frontal_face_detector()
sp = dlib.shape_predictor(shape_predictor_path)
face_rec_model = dlib.face_recognition_model_v1(face_rec_model_path)

def get_face_embedding(image_path):
    """
    Tạo embeddings khuôn mặt từ ảnh.
    Args:
        image_path (str): Đường dẫn ảnh đầu vào.
    Returns:
        numpy.ndarray: Vector đặc trưng của khuôn mặt, hoặc None nếu không phát hiện được khuôn mặt.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Không thể đọc ảnh từ đường dẫn đã cho.")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)
    if len(faces) == 0:
        print("Không phát hiện được khuôn mặt.")
        return None
    shape = sp(gray, faces[0])
    face_descriptor = np.array(face_rec_model.compute_face_descriptor(image, shape))
    return face_descriptor

def compare_faces_dlib(image1_path, image2_path, threshold=0.6):
    """
    So sánh hai ảnh khuôn mặt bằng embeddings từ Dlib ResNet.
    Args:
        image1_path (str): Đường dẫn ảnh đầu tiên.
        image2_path (str): Đường dẫn ảnh thứ hai.
        threshold (float): Ngưỡng khoảng cách để quyết định (0.6 là ngưỡng phổ biến).
    Returns:
        bool: True nếu hai ảnh cùng một người, False nếu không.
    """
    embedding1 = get_face_embedding(image1_path)
    embedding2 = get_face_embedding(image2_path)

    if embedding1 is None or embedding2 is None:
        raise ValueError("Không phát hiện được khuôn mặt trong một hoặc cả hai ảnh.")

    distance = np.linalg.norm(embedding1 - embedding2)
    print(f"Khoảng cách giữa hai khuôn mặt: {distance}")

    return distance < threshold
