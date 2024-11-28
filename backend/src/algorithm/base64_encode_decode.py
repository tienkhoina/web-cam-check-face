import base64
import numpy as np

def encode_embedding(embedding):
    """
    Mã hóa một embedding (list hoặc numpy array) thành chuỗi base64.
    
    Args:
        embedding (list or numpy.ndarray): Mảng các số thực (float).
        
    Returns:
        str: Chuỗi base64 đã mã hóa.
    """
    # Chuyển embedding thành numpy array nếu nó là list
    embedding_array = np.array(embedding, dtype=np.float32)
    # Chuyển numpy array thành bytes
    embedding_bytes = embedding_array.tobytes()
    # Mã hóa bytes thành chuỗi base64
    base64_str = base64.b64encode(embedding_bytes).decode('utf-8')
    return base64_str

def decode_embedding(base64_str):
    """
    Giải mã một chuỗi base64 thành embedding (numpy array).
    
    Args:
        base64_str (str): Chuỗi base64 đã mã hóa.
        
    Returns:
        numpy.ndarray: Mảng các số thực (float).
    """
    # Giải mã chuỗi base64 thành bytes
    embedding_bytes = base64.b64decode(base64_str)
    # Chuyển bytes thành numpy array
    embedding_array = np.frombuffer(embedding_bytes, dtype=np.float32)
    return embedding_array
