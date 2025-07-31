from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from module.model import FoodDetector
from module.recommendation import recommend_foods
from module.graphrag import final_analyze
from module.fooddetail import get_nutrition_info
from module.nutriscore import mix_foods_by_full_weight

import uvicorn

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모델 로드
detector = FoodDetector(model_path="module/best.pt")  

@app.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    try:
        img_bytes = await image.read()
        result = detector.predict(img_bytes)

        if result["success"]:
            return result
        else:
            return JSONResponse(content={"error": result["error"]}, status_code=500)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
CATEGORY_MAPPING = {
    "밥": 1,
    "국": 2,
    "양식": 3,
    "면": 4,
    "반찬": 5,
    "디저트": 6
}

@app.post("/recommend")
async def recommend_endpoint(
    food_name: str = Form(...),
    category: str = Form(...)
):
    try:
        recommendations = recommend_foods(food_name, category)

        # category를 바로 번호로 변환
        category_num = CATEGORY_MAPPING.get(category, 0)

        response_data = [
            {"name": food, "category_num": category_num}
            for food in recommendations
        ]

        return {"recommended": response_data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    
@app.post("/nutrition")
async def nutrition_endpoint(
    food_name: str = Form(...)
):
    """
    음식명을 입력받아 탄수화물, 단백질, 지방(g)과 식품 중량 반환
    """
    try:
        nutrition_info = get_nutrition_info(food_name)
        return JSONResponse(content=nutrition_info)
    except Exception as e:
        return JSONResponse(status_code=404, content={"error": str(e)})
    

class FoodPair(BaseModel):
    firstfood: str
    secondfood: str
    

@app.post("/final-analyze")
async def LLM_Analyze(data: FoodPair):
    try:
        result = final_analyze(data.firstfood, data.secondfood)
        return JSONResponse(content={"result": result})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/nutri-grade")
async def nutri_grade_endpoint(
    food1: str = Form(...),
    food2: str = Form(...)
):
    try:
        grade = mix_foods_by_full_weight([food1, food2])
        return JSONResponse(content={"grade": grade})
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)