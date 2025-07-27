from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from module.model import FoodDetector

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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)