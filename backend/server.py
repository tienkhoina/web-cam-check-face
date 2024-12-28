from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from pathlib import Path
import logging
from src.algorithm.check_face_algorithm import get_face_embedding, get_distance_embedding
from sqlalchemy.orm import Session
from src.config.database import engine  # Sử dụng engine từ file cấu hình database
from src.models.FaceInfo import FaceInfo  # Import model FaceInfo
from src.algorithm.base64_encode_decode import encode_embedding, decode_embedding
from datetime import datetime


# Tạo session và engine từ SQLAlchemy
session = Session(bind=engine)

# Cấu hình logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# Tạo thư mục lưu ảnh nếu chưa tồn tại
image_dir = Path(__file__).parent / "src" / "image"
image_dir.mkdir(exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        data = request.json
        image_data = data.get('image', None)

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # Kiểm tra dữ liệu nhận được

        # Tách header và dữ liệu Base64
        header, encoded = image_data.split(",", 1)
        image_binary = base64.b64decode(encoded)

        # Lưu ảnh vào thư mục
        image_path = image_dir / "received_image.jpg"

        with open(image_path, "wb") as f:
            f.write(image_binary)

        return jsonify({"message": "Image received and saved"}), 200
    except Exception as e:
        logging.error(f"Error while saving the image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/userinfo', methods=['GET'])
def get_user_info():
    try:
        # Lấy embedding của ảnh vừa tải lên
        embedding1 = get_face_embedding(image_dir / "received_image.jpg")
        
        # Kiểm tra xem embedding1 có hợp lệ không
        if embedding1 is None:
            return jsonify({
                "isExists": False,
                "name": "Not have a face",
                "age": "Not have a face",
                "gender": "Not have a face",
            }), 200
        # Lấy tất cả bản ghi từ bảng FaceInfo
        all_records = session.query(FaceInfo).filter(FaceInfo.facecode.isnot(None)).all()
        
        # Khởi tạo biến lưu trữ thông tin người dùng gần nhất
        last = None
        maxdistance = 0
        isExists = False
        
        # So sánh các embedding với dữ liệu trong cơ sở dữ liệu
        for record in all_records:
            facecode = record.facecode
            embedding2 = decode_embedding(facecode)

            # Kiểm tra nếu embedding2 là None
            if embedding2 is None:
                continue  # Bỏ qua bản ghi nếu không có embedding hợp lệ

            distance = get_distance_embedding(embedding1, embedding2)


            if distance > maxdistance:
                maxdistance = distance
                last = record

            # Nếu khoảng cách nhỏ hơn ngưỡng 0.5, coi như người dùng đã tồn tại
            if maxdistance >= 0.8:
                isExists = True
        print("khoảng cách tìm thấy:",maxdistance)        

        # Kiểm tra nếu người dùng đã tồn tại
        if isExists:
            return jsonify({
                "isExists": True,
                "name": last.name,
                "age": last.age,
                "gender": last.gender,
            }), 200
        else:
            return jsonify({
                "isExists": False,
                "name": "Not exists",
                "age": "Not exists",
                "gender": "Not exists",
            }), 200

    except Exception as e:
        logging.error(f"Error loading data: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/create-user', methods=['POST'])
def create_user():
    try:
        data = request.json
        print(data)

        # Kiểm tra các trường bắt buộc
        name = data.get('name', None)
        age = data.get('age', None)
        gender = data.get('gender', None)
        image_data = data.get('image', None)

        if not name or not age or not gender or not image_data:
            return jsonify({"error": "Missing required fields (name, age, gender, or image)"}), 400

        # Tách header và dữ liệu Base64
        header, encoded = image_data.split(",", 1)
        image_binary = base64.b64decode(encoded)

        # Lưu ảnh vào thư mục
        image_path = image_dir / "create_image.jpg"
        with open(image_path, "wb") as f:
            f.write(image_binary)

        # Lấy embedding của ảnh
        embedding1 = get_face_embedding(image_path)
        if embedding1 is None:
            return jsonify({
                "isExist": False,
                "message": "No face detected in the image",
            }), 200

        all_records = session.query(FaceInfo).filter(FaceInfo.facecode.isnot(None)).all()

        # Khởi tạo biến lưu trữ thông tin người dùng gần nhất
        last = None
        maxdistance = 0
        isExists = False

        # So sánh các embedding với dữ liệu trong cơ sở dữ liệu
        for record in all_records:
            facecode = record.facecode
            embedding2 = decode_embedding(facecode)

            # Kiểm tra nếu embedding2 là None
            if embedding2 is None:
                continue  # Bỏ qua bản ghi nếu không có embedding hợp lệ

            distance = get_distance_embedding(embedding1, embedding2)

            if distance > maxdistance:
                maxdistance = distance
                last = record

           
            if maxdistance > 0.8:
                isExists = True

        if isExists:
            return jsonify({
                "isExist": True,
                "message": "User already exists"
            })

        
        facecode_new = encode_embedding(embedding1)
        if not facecode_new:
            return jsonify({
                "isExist": False,
                "message": "Face encoding failed"
            }),200

        # Tạo đối tượng mới cho người dùng
        new_face_info = FaceInfo(
            name=name,
            age=age,
            gender=gender,
            facecode=facecode_new,
            created_at=datetime.now()
            
        )

        session.add(new_face_info)
        session.commit()
        session.close()

        return jsonify({
            "isExist": False,
            "message": "User created successfully"
        }),200

    except Exception as e:
        logging.error(f"Error while creating the user: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
