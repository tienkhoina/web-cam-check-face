from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base  # Sửa lại import từ sqlalchemy.orm
import mysql.connector
from sqlalchemy.exc import OperationalError

# Cấu trúc URL kết nối MySQL
DATABASE_URL = "mysql+mysqlconnector://root:Letienkhoi1710@localhost:3310/check_face_database"

# Tạo engine kết nối đến cơ sở dữ liệu
engine = create_engine(DATABASE_URL, echo=True)  # echo=True để in ra các câu lệnh SQL

# Khởi tạo Base (được nhập từ sqlalchemy.orm)
Base = declarative_base()

# Tạo session để thực hiện thao tác với cơ sở dữ liệu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Kiểm tra kết nối đến cơ sở dữ liệu
try:
    # Thử thực hiện một truy vấn đơn giản để kiểm tra kết nối
    with engine.connect() as connection:
        print("Đã kết nối tới MySQL thành công!")
except OperationalError as e:
    print(f"Lỗi kết nối tới MySQL: {e}")
