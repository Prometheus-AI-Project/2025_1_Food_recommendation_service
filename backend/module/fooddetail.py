import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "filtered_db_add_cate.xlsx")

def get_nutrition_info(food_name: str):
    """
    음식 이름을 입력하면 해당 음식의 탄수화물, 단백질, 지방(g)과 식품 중량을 반환
    """
    db = pd.read_excel(DB_PATH)
    
    matched = db[db["식품명"] == food_name]
    if matched.empty:
        raise ValueError(f"'{food_name}'을(를) 데이터베이스에서 찾을 수 없습니다.")
    
    food_info = matched.iloc[0]
    return {
        "name": food_name,
        "carb": float(food_info["탄수화물(g)"]),
        "protein": float(food_info["단백질(g)"]),
        "fat": float(food_info["지방(g)"]),
        "serving": float(food_info["식품중량"])
    }