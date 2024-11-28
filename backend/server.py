from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from pathlib import Path
import logging

# Cấu hình logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# Tạo thư mục lưu ảnh nếu chưa tồn tại
image_dir = Path(__file__).parent /"src"/"image"
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
        image_path = image_dir /"received_image.jpg"

       
        with open(image_path, "wb") as f:
            f.write(image_binary)

        return jsonify({"message": "Image received and saved"}), 200
    except Exception as e:
        logging.error(f"Error while saving the image: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
