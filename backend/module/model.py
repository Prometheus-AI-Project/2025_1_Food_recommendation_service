from ultralytics import YOLO
from PIL import Image
import io

class FoodDetector:
    def __init__(self, model_path='best.pt'):
        self.model = YOLO(model_path)  
        self.class_names = self.model.names 

    def predict(self, image_bytes):
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            results = self.model(img)

            # 가장 높은 확률의 클래스 선택
            boxes = results[0].boxes
            if boxes is not None and len(boxes.cls) > 0:
                class_id = int(boxes.cls[0].item())
                confidence = float(boxes.conf[0].item())
                predicted_class = self.class_names[class_id]

                return {
                    'prediction': f'{predicted_class} (신뢰도: {confidence:.2f})',
                    'success': True
                }
            else:
                return {
                    'prediction': '객체를 찾을 수 없습니다.',
                    'success': True
                }

        except Exception as e:
            return {
                'error': str(e),
                'success': False
            }