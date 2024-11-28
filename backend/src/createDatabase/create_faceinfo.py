# file create_tables.py
from src.config.database import engine  # Import engine từ database.py
from src.models.FaceInfo import Base  # Import Base từ model FaceInfo

# Tạo bảng từ model
Base.metadata.create_all(engine)  # Tạo tất cả các bảng từ các model
