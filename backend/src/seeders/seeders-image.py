from sqlalchemy.orm import Session
from datetime import datetime
from src.config.database import engine  # Import engine từ cấu hình database của bạn
from src.models.FaceInfo import FaceInfo  # Import model FaceInfo
import src.algorithm.check_face_algorithm
import src.algorithm.base64_encode_decode
from src.algorithm.check_face_algorithm import get_face_embedding 
from src.algorithm.base64_encode_decode import encode_embedding


# Tạo session để làm việc với cơ sở dữ liệu
session = Session(bind=engine)

newName = input("name:")
newAge = input("age:")
newGender = input("Gender:")
newFacePath = input("Path:")

embedding1 = get_face_embedding(newFacePath)
newFaceCode =  encode_embedding(embedding1)

# Tạo một đối tượng FaceInfo mới
new_face_info = FaceInfo(
    name=newName,
    age=newAge,
    gender=newGender,
    facecode=newFaceCode,
    created_at=datetime.now()
)

# Thêm đối tượng vào session
session.add(new_face_info)

# Thực hiện commit để lưu vào cơ sở dữ liệu
session.commit()

# Đóng session
session.close()

print("Dữ liệu đã được chèn thành công!")
