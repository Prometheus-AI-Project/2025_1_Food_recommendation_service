import os
import re
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI

# 임베딩 및 벡터스토어 관련
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

EXCEL_PATH = os.path.join(BASE_DIR, "filtered_db_add_cate.xlsx")
VECTORSTORE_DIR = os.path.join(BASE_DIR, "vectorstore_json")

#  DB 및 벡터스토어 로드
db = pd.read_excel(EXCEL_PATH)
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.load_local(
    VECTORSTORE_DIR,
    embedding_model,
    allow_dangerous_deserialization=True
)

# 음식 영양 정보 추출 함수
def get_nutrition_info(food_name: str, db: pd.DataFrame):
    matched = db[db["식품명"] == food_name]
    if matched.empty:
        raise ValueError(f"입력한 음식 '{food_name}'을(를) 데이터베이스에서 찾을 수 없습니다.")
    row = matched.iloc[0]
    return {
        "carb": row["탄수화물(g)"],
        "protein": row["단백질(g)"],
        "fat": row["지방(g)"],
        "serving": row["식품중량"]
    }

# 탄단지 비율 필터링 함수
def filter_by_nutrition(input_food_name, input_carb, input_protein, input_fat, input_serving,
                        db, target_ratio=(5, 3, 2), tolerance=0.05):
    df = db.copy()

    input_carb_total = input_carb * (input_serving / 100)
    input_protein_total = input_protein * (input_serving / 100)
    input_fat_total = input_fat * (input_serving / 100)

    df['절대_탄수화물'] = df['탄수화물(g)'] * (df['식품중량'] / 100)
    df['절대_단백질'] = df['단백질(g)'] * (df['식품중량'] / 100)
    df['절대_지방'] = df['지방(g)'] * (df['식품중량'] / 100)

    df['합_탄수화물'] = df['절대_탄수화물'] + input_carb_total
    df['합_단백질'] = df['절대_단백질'] + input_protein_total
    df['합_지방'] = df['절대_지방'] + input_fat_total

    total = df['합_탄수화물'] + df['합_단백질'] + df['합_지방']
    df['비율_탄수화물'] = df['합_탄수화물'] / total
    df['비율_단백질'] = df['합_단백질'] / total
    df['비율_지방'] = df['합_지방'] / total

    ratio_sum = sum(target_ratio)
    target_carb = target_ratio[0] / ratio_sum
    target_protein = target_ratio[1] / ratio_sum
    target_fat = target_ratio[2] / ratio_sum

    conditions = (
        (abs(df['비율_탄수화물'] - target_carb) <= tolerance) &
        (abs(df['비율_단백질'] - target_protein) <= tolerance) &
        (abs(df['비율_지방'] - target_fat) <= tolerance)
    )

    return df[conditions].reset_index(drop=True)

def generate_prompt_with_nutrition(candidates_df, user_preference=None):
    candidate_text = "\n".join([f"- {row['식품명']}" for _, row in candidates_df.iterrows()])
    preference_text = f"\n\n사용자 선호: {user_preference.strip()}" if user_preference else ""
    
    prompt = f"""
    당신은 음식 추천 전문가입니다.

    다음은 추천 가능한 음식 후보 목록입니다:
    {candidate_text}

    음식의 풍미, 식감, 향, 조리 방식, 그리고 사용자의 기호를 고려해 가장 어울리는 음식 3가지를 추천해 주세요.

    {preference_text}

    ⚠️ 음식 이름만 아래 형식으로 출력해 주세요. 절대로 코드블럭(예: ```json) 없이, 순수한 리스트만 출력하세요:
    - 음식 이름을 출력할때 식품명을 **절대로** 마음대로 수정하지 말고 {candidate_text}에 있는 음식 명 그대로 출력하세요

    예시:
    ["김치찌개", "된장국", "불고기"]
    """
    return prompt

def recommend_foods(food_name: str, category: str) -> list:
    try:
        print(f"[1] 입력 음식: {food_name}, 카테고리: {category}")
        
        # 영양 정보 추출
        info = get_nutrition_info(food_name, db)
        print(f"[2] {food_name}의 영양 정보: {info}")

        # 카테고리 필터링
        filtered_db = db[db["카테고리"] == category]
        print(f"[3] '{category}' 카테고리 음식 개수: {len(filtered_db)}")

        # 탄단지 비율 기준으로 필터링
        result = filter_by_nutrition(
            food_name,
            info["carb"],
            info["protein"],
            info["fat"],
            info["serving"],
            filtered_db
        )
        print(f"[4] 탄단지 비율 필터링 결과 개수: {len(result)}")

        # 프롬프트 생성
        prompt = generate_prompt_with_nutrition(result, "")
        print(f"[5] 생성된 프롬프트:\n{prompt}")

        # GPT 호출
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        print(f"[6] GPT 응답 원문:\n{response.choices[0].message.content}")

        # 결과 파싱
        try:
            food_names = eval(response.choices[0].message.content.strip())
            print(f"[7] 파싱된 음식 리스트: {food_names}")
            return food_names[:3] if isinstance(food_names, list) else []
        except Exception as e:
            print(f"[7-ERROR] GPT 응답 파싱 실패: {e}")
            return []

    except Exception as e:
        print(f"[ERROR] 추천 실패: {e}")
        return []