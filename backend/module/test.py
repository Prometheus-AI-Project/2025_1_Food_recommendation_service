import pandas as pd
import os
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from openai import OpenAI
import re

load_dotenv() 

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

import pandas as pd
import numpy as np
from scipy.optimize import minimize

db = pd.read_excel("filtered_db_add_cate.xlsx")

#음식 이름을 입력하면 해당 음식의 탄단지 g, 식품 중량을 출력하는 함수
def get_nutrition_info(food_name, db):
    """
    음식 이름을 입력하면 해당 음식의 탄단지 g, 식품 중량을 출력하는 함수
    :param food_name: 음식 이름
    :param db: 데이터베이스 (pandas DataFrame)
    :return: 딕셔너리 형태로 탄단지 g, 식품 중량 반환
    """
    food_info = db[db['식품명'] == food_name].iloc[0]
    return {
        'carb': food_info['탄수화물(g)'],
        'protein': food_info['단백질(g)'],
        'fat': food_info['지방(g)'],
    }

# 음식 이름 입력
food_name = "짜장면"  # 원하는 음식명으로 변경

# 함수 실행
info = get_nutrition_info(food_name, db)
print(info)

# # 파일 경로를 정확하게 지정 (카테고리 열이 추가된 파일 사용)
# EXCEL_PATH = "./filtered_db_add_cate.xlsx"

# # 데이터 로드
# db = pd.read_excel(EXCEL_PATH)

# def filter_by_nutrition(
#     input_food_name, input_carb, input_protein, input_fat, input_serving,
#     db, target_ratio=(5, 3, 2), tolerance=0.05
# ):
#     """
#     ✅ 입력값
#     - input_food_name: 입력 음식명 (string)
#     - input_carb, input_protein, input_fat: 탄단지 (100g 기준)
#     - input_serving: 입력 음식 1회 제공량 (g)
#     - db: 영양소 데이터프레임
#     - target_ratio: 최적 탄단지 비율 (default 5:3:2)
#     - tolerance: 허용 오차 (default 3%)

#     ✅ 반환값
#     - 조건에 맞는 음식 후보 DataFrame
#     """

#     # 🔸 입력 음식의 절대 탄단지 양 (1회 제공량 기준)
#     input_carb_total = input_carb * (input_serving / 100)
#     input_protein_total = input_protein * (input_serving / 100)
#     input_fat_total = input_fat * (input_serving / 100)

#     # 🔸 데이터프레임 복사
#     df = db.copy()

#     # 🔸 DB 음식 각각 절대 탄단지 양 계산
#     df['절대_탄수화물'] = df['탄수화물(g)'] * (df['식품중량'] / 100)
#     df['절대_단백질'] = df['단백질(g)'] * (df['식품중량'] / 100)
#     df['절대_지방'] = df['지방(g)'] * (df['식품중량'] / 100)

#     # 🔸 입력 음식과 DB 음식 합산 탄단지
#     df['합_탄수화물'] = df['절대_탄수화물'] + input_carb_total
#     df['합_단백질'] = df['절대_단백질'] + input_protein_total
#     df['합_지방'] = df['절대_지방'] + input_fat_total

#     # 🔸 합산 탄단지 비율 계산
#     total = df['합_탄수화물'] + df['합_단백질'] + df['합_지방']
#     df['비율_탄수화물'] = df['합_탄수화물'] / total
#     df['비율_단백질'] = df['합_단백질'] / total
#     df['비율_지방'] = df['합_지방'] / total

#     # 🔸 타겟 비율 계산
#     ratio_sum = sum(target_ratio)
#     target_carb = target_ratio[0] / ratio_sum
#     target_protein = target_ratio[1] / ratio_sum
#     target_fat = target_ratio[2] / ratio_sum

#     # 🔸 허용 오차 조건
#     conditions = (
#         (abs(df['비율_탄수화물'] - target_carb) <= tolerance) &
#         (abs(df['비율_단백질'] - target_protein) <= tolerance) &
#         (abs(df['비율_지방'] - target_fat) <= tolerance)
#     )

#     filtered = df[conditions].reset_index(drop=True)

#     return filtered[['식품명', '식품대분류명', '합_탄수화물', '합_단백질', '합_지방',
#                      '비율_탄수화물', '비율_단백질', '비율_지방', '식품중량']]

# def generate_prompt_with_nutrition(candidates_df, user_preference=None):

#     # 음식 이름 리스트만 추출
#     candidate_text = "\n".join([
#         f"- {row['식품명']}"
#         for _, row in candidates_df.iterrows()
#     ])

#     # 사용자 선호 문장 처리
#     preference_text = f"\n\n사용자 선호: {user_preference.strip()}" if user_preference else ""

#     # 프롬프트 구성
#     prompt = f"""
#     당신은 음식 추천 전문가입니다.

#     다음은 추천 가능한 음식 후보 목록입니다.
#     후보 음식 목록:
#     {candidate_text}

#     중요한 것은 음식의 풍미, 조화로움, 식감, 향, 조리 방식 등이며,
#     사용자가 좋아하는 맛 또는 피하고 싶은 요소를 반영해 추천해 주세요.
#     사용자 정보:
#     {preference_text}

#     **각 음식의 맛의 특성과 사용자 기호만을 기준으로** 가장 어울리는 음식 3가지를 선택해 주세요.

#     다음 형식으로 **가장 적절한 3가지 음식**을 골라주세요:

#     1. 음식명: [예시]  
#     추천 이유: [맛과 사용자의 선호도 측면에서 구체적인 설명]

#     2. 음식명: ...  
#     추천 이유: ...

#     3. 음식명: ...  
#     추천 이유: ...
#     """

#     return prompt

# def get_nutrition_info(food_name: str, db: pd.DataFrame):
#     matched = db[db["식품명"] == food_name]
#     if matched.empty:
#         raise ValueError(f"입력한 음식 '{food_name}'을(를) 데이터베이스에서 찾을 수 없습니다.")
    
#     row = matched.iloc[0]
#     return {
#         "carb": row["탄수화물(g)"],
#         "protein": row["단백질(g)"],
#         "fat": row["지방(g)"],
#         "serving": row["식품중량"]
#     }

# # 벡터 임베딩 모델 및 벡터스토어 로드

# VECTORSTORE_DIR = "../vectorstore_json"
# embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# vectorstore = FAISS.load_local(
#     VECTORSTORE_DIR,
#     embedding_model,
#     allow_dangerous_deserialization=True
# )

# # 입력 음식 정보
# input_food_name = "알밥"     # 기준 음식
# input_category = "밥"      # 추천받고 싶은 음식 카테고리

# # 사용자 기호 입력
# preference = """
#     음식을 좋아합니다. 
# """

# # 입력 음식의 영양 정보 조회
# info = get_nutrition_info(input_food_name, db)

# # 추천받고자 하는 카테고리 음식 필터링
# filtered_db = db[db["카테고리"] == input_category]

# # 탄단지 비율 기반 후보 필터링
# result = filter_by_nutrition(
#     input_food_name,
#     info["carb"],
#     info["protein"],
#     info["fat"],
#     info["serving"],
#     filtered_db
# )

# prompt = generate_prompt_with_nutrition(result, preference)

# response = client.chat.completions.create(
#     model="gpt-4o",   # 또는 "gpt-4", "gpt-3.5-turbo"
#     messages=[
#         {"role": "user", "content": prompt}
#     ],
#     temperature=0.7,
# )

# text = response.choices[0].message.content

# food_names = re.findall(r'음식명:\s*([^\n]+)', text)

# print("✅ 추천 음식 리스트:")
# for idx, food in enumerate(food_names, 1):
#     print(f"{idx}. {food}")
