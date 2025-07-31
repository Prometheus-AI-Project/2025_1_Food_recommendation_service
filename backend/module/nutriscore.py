import pandas as pd
import os
from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "filtered_db_add_cate.xlsx")

nutrient_fields = [
    '에너지(kcal)', '단백질(g)', '지방(g)', '탄수화물(g)', '당류(g)', '식이섬유(g)', '칼슘(mg)',
    '칼륨(mg)', '나트륨(mg)', '비타민 A(μg RAE)', '비타민 C(mg)', '콜레스테롤(mg)',
    '아미노산(mg)', '아르기닌(mg)', '토코트리에놀(mg)'
]

df = pd.read_excel(DB_PATH)

# 🔹 Nutri-Score 계산
def kcal_to_kj(kcal):
    return kcal * 4.184

def get_score(val, table):
    for idx, t in enumerate(table):
        if val <= t:
            return idx
    return len(table)

def nutri_score_row(row):
    energy_kj = kcal_to_kj(row['에너지(kcal)'])
    sugar = row['당류(g)']
    sat_fat = row.get('포화지방(g)', row['지방(g)'])
    sodium = row['나트륨(mg)']
    fiber = row['식이섬유(g)']
    protein = row['단백질(g)']

    energy_table = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350]
    sugar_table = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45]
    sat_fat_table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    sodium_table = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900]
    fiber_table = [0.9, 1.9, 2.8, 3.7, 4.7]
    protein_table = [1.6, 3.2, 4.8, 6.4, 8.0]

    neg = get_score(energy_kj, energy_table) + \
          get_score(sugar, sugar_table) + \
          get_score(sat_fat, sat_fat_table) + \
          get_score(sodium, sodium_table)
    pos = get_score(fiber, fiber_table) + get_score(protein, protein_table)

    score = neg - pos

    if score <= -1:
        return "A"
    elif score <= 2:
        return "B"
    elif score <= 10:
        return "C"
    else:
        return "C"

# 🔹 혼합 음식 등급 계산
def mix_foods_by_full_weight(food_names):
    total_weight = 0
    sum_nutrients = {field: 0 for field in nutrient_fields}
    has_sat_fat = '포화지방(g)' in df.columns
    sum_sat_fat = 0

    for food_name in food_names:
        if not (df['식품명'] == food_name).any():
            raise ValueError(f"'{food_name}'이(가) 데이터에 없습니다.")
        row = df[df['식품명'] == food_name].iloc[0]
        weight = float(row['식품중량'])
        total_weight += weight
        for field in nutrient_fields:
            v = row.get(field, 0)
            v = 0 if pd.isnull(v) else float(v)
            sum_nutrients[field] += v
        if has_sat_fat:
            sat_fat = row['포화지방(g)']
            sat_fat = 0 if pd.isnull(sat_fat) else float(sat_fat)
            sum_sat_fat += sat_fat

    if total_weight == 0:
        raise ValueError("모든 식품명이 데이터에 없습니다.")

    mix_row = {}
    for field in nutrient_fields:
        mix_row[field] = sum_nutrients[field] * (100 / total_weight)
    if has_sat_fat:
        mix_row['포화지방(g)'] = sum_sat_fat * (100 / total_weight)

    return nutri_score_row(mix_row)