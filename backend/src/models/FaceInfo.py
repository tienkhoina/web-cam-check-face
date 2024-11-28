from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.mysql import MEDIUMTEXT  # Import MEDIUMTEXT từ MySQL dialect
from src.config.database import Base  # Import Base từ file database.py

# Định nghĩa model FaceInfo
class FaceInfo(Base):
    __tablename__ = 'faceinfo'  # Tên bảng trong cơ sở dữ liệu

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)  # Tên của người
    age = Column(Integer, nullable=True)  # Tuổi (có thể null)
    gender = Column(String(10), nullable=True)  # Giới tính (có thể null)
    facecode = Column(MEDIUMTEXT, nullable=True)  # Giá trị facecode
    created_at = Column(DateTime, nullable=False)  # Thời gian tạo bản ghi

    def __repr__(self):
        return f"<FaceInfo(id={self.id}, name={self.name}, age={self.age}, gender={self.gender})>"
