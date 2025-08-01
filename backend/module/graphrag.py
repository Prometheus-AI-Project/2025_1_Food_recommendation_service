import os
import openai
import pandas as pd
from dotenv import load_dotenv
from neo4j import GraphDatabase
from neo4j.time import Date
from neo4j_graphrag.llm import OpenAILLM
from neo4j_graphrag.retrievers import Text2CypherRetriever
from neo4j_graphrag.generation import GraphRAG

def final_analyze(first_food: str, second_food: str) -> str:
    load_dotenv()
    openai.api_key = os.getenv("OPENAI_API_KEY")

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    nutrient_db = pd.read_excel(os.path.join(BASE_DIR, "filtered_db_add_cate.xlsx"))

    # 음식 데이터 가져오기
    record1 = nutrient_db.loc[nutrient_db["식품명"] == first_food]
    record2 = nutrient_db.loc[nutrient_db["식품명"] == second_food]

    # 음식이 없으면 빈 DataFrame 처리
    if record1.empty:
        record1 = pd.DataFrame([{"식품중량": 0}])
    if record2.empty:
        record2 = pd.DataFrame([{"식품중량": 0}])

    enough_1, lack_1, enough_2, lack_2 = [], [], [], []
    nutrients = [
        "탄수화물(g)", "단백질(g)", "지방(g)", "식이섬유(g)", 
        "칼슘(mg)", "칼륨(mg)", "나트륨(mg)", 
        "비타민 A(μg RAE)", "비타민 C(mg)", "콜레스테롤(mg)"
    ]
    dv = [275, 120, 78, 28, 1300, 3000, 2300, 800, 80, 300]

    # 결측치와 없는 컬럼 안전 처리
    for i, cur in enumerate(nutrients):
        if cur not in nutrient_db.columns:
            continue
        
        v1_raw = record1[cur].iloc[0] if cur in record1 else 0
        v2_raw = record2[cur].iloc[0] if cur in record2 else 0

        v1_raw = 0 if pd.isnull(v1_raw) else v1_raw
        v2_raw = 0 if pd.isnull(v2_raw) else v2_raw

        serving1 = record1["식품중량"].iloc[0] if "식품중량" in record1 else 0
        serving2 = record2["식품중량"].iloc[0] if "식품중량" in record2 else 0

        v1 = (((serving1 / 100) * v1_raw) / dv[i]) * 100
        v2 = (((serving2 / 100) * v2_raw) / dv[i]) * 100

        name = cur.split("(")[0]
        if v1 >= 20:
            enough_1.append(name)
        elif v1 < 5:
            lack_1.append(name)
        if v2 >= 20:
            enough_2.append(name)
        elif v2 < 5:
            lack_2.append(name)

    # Neo4j 연결
    URI = os.getenv("NEO4J_URI")
    USER = os.getenv("NEO4J_USER")
    PASSWORD = os.getenv("NEO4J_PASSWORD")
    AUTH = (USER, PASSWORD)

    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        driver.verify_connectivity()
        llm = OpenAILLM(model_name="gpt-4o", model_params={"temperature": 0.7})

        def get_node_datatype(v):
            if isinstance(v, str): return "STRING"
            if isinstance(v, int): return "INTEGER"
            if isinstance(v, float): return "FLOAT"
            if isinstance(v, bool): return "BOOLEAN"
            if isinstance(v, list): return f"LIST[{get_node_datatype(v[0])}]" if v else "LIST"
            if isinstance(v, Date): return "DATE"
            return "UNKNOWN"

        def get_schema():
            with driver.session() as session:
                node_q = """
                MATCH (n) WITH DISTINCT labels(n) AS node_labels, keys(n) AS property_keys, n
                UNWIND node_labels AS label
                UNWIND property_keys AS key
                RETURN label, key, n[key] AS sample_value
                """
                rel_q = """
                MATCH ()-[r]->() WITH DISTINCT type(r) AS rel_type, keys(r) AS property_keys, r
                UNWIND property_keys AS key
                RETURN rel_type, key, r[key] AS sample_value
                """
                dir_q = """
                MATCH (a)-[r]->(b)
                RETURN DISTINCT labels(a) AS start_label, type(r) AS rel_type, labels(b) AS end_label
                ORDER BY start_label, rel_type, end_label
                """
                nodes = session.run(node_q)
                rels = session.run(rel_q)
                dirs = session.run(dir_q)

                schema = {"nodes": {}, "relationships": {}, "relations": []}
                for r in nodes:
                    label, key, sample = r["label"], r["key"], r["sample_value"]
                    schema["nodes"].setdefault(label, {})[key] = get_node_datatype(sample)
                for r in rels:
                    rel, key, sample = r["rel_type"], r["key"], r["sample_value"]
                    schema["relationships"].setdefault(rel, {})[key] = get_node_datatype(sample)
                for r in dirs:
                    schema["relations"].append(
                        f"(:{r['start_label'][0]})-[:{r['rel_type']}]->(:{r['end_label'][0]})"
                    )
                return schema

        def format_schema(sch):
            out = ["Node properties:"]
            for label, props in sch["nodes"].items():
                out.append(f"{label} {{{', '.join(f'{k}: {v}' for k, v in props.items())}}}")
            out.append("Relationship properties:")
            for rel, props in sch["relationships"].items():
                out.append(f"{rel} {{{', '.join(f'{k}: {v}' for k, v in props.items())}}}")
            out.append("The relationships:")
            out.extend(sch["relations"])
            return "\n".join(out)

        schema = get_schema()
        formatted_schema = format_schema(schema)

        retriever = Text2CypherRetriever(driver=driver, llm=llm, neo4j_schema=formatted_schema)
        rag = GraphRAG(retriever=retriever, llm=llm)

        query = f"""
        너는 두 가지 음식의 영양 정보가  주어지면, 이에  대해 효과를 그래프 데이터 베이스로부터 검색하여 분석 결과를 보여주는  아주 똑똑한 영양 분석 LLM 어시스턴트야. 이 일은 굉장히 중요한 일이기 때문에, 너가 실수하면 사용자의 건강에 안 좋은 영향을 미칠거야.

        ⚠️ Cypher 쿼리를 작성할 때 주의사항:
        1. **UNION을 사용할 경우, 모든 서브쿼리에서 RETURN 컬럼명을 반드시 동일하게 nutrient, effect 로 사용해야 해.**
        2. good_effect, side_effect, lack_effect 관계를 조회하더라도 컬럼명은 nutrient, effect 두 개만 반환해야 한다.
        3. 문법 오류가 없는 Cypher 쿼리를 작성해야 한다.
        
        너는 주어진 정보를 토대로 적절한 cypher 쿼리를 생성해야해:
        1. 풍부한 영양소에 대해서는, good_effect와 side_effect로 연결된 effect 노드를 검색해와야 해.
        2. 부족한 영양소에 대해서는, lack_effect로 연결된 effect 노드를 검색해와야 해.
        3. 각 영양소별로 모든 effect 노드를 다 참고할 필요는 없고, 랜덤하게 각각 적절한 개수로 참고해줘  

        두 가지 음식에 대해 너가 해야할 일은 다음과 같아.
        1. 풍부한 영양소, 부족한 영양소 목록이 주어지면 적절한 cypher 쿼리를 생성하고,
        2. 그래프 데이터베이스에서 해당 쿼리를 실행했을 때의 결과를 해석하여
        3. 자연어로 요약해 설명해 주어야 해.

        자연어 요약:
        1. 풍부한 영양소에 대해서는 해당 음식을 먹었을 때 [풍부한 영양소]가 풍부하여  [good_effect]가 나타날 수 있지만, 과식했을 경우 [풍부한 영양소]로 인해  [side_effect]가 나타날 수 있으니 주의해주어야 한다는 의미가 담겨져 있어야 해.
        2. 부족한 영양소에 대해서는 해당 음식을 먹었을 때 여전히 [부족한 영양소]가 부족하여, [lack_effect]가 나타날 수 있으니 다른 음식을 통해 해당 영양소를 보충해야 한다는 의미가 담겨져 있어야 해.
        3. 만약, 풍부한 영양소나 부족한 영양소 목록이 빈 목록이라면 해당 효과는 언급하지 않아도 돼.


        [예시]
        음식1: 자장밥
        풍부한 영양소: ['탄수화물', '지방', '식이섬유', '칼륨', '나트륨', '비타민 C']
        부족한 영양소: ['칼슘']

        음식2: 콩나물밥
        풍부한 영양소: ['탄수화물', '식이섬유', '칼륨', '나트륨']
        부족한 영양소: ['칼슘', '비타민 A', '비타민 C', '콜레스테롤']

        분석 결과:

        자장밥의 경우 탄수화물이 풍부해 에너지 제공, 근성장 등에 효과적이고, 식이섬유도 풍부하여 변비 예방에도 효과가 있지만, 과식했을 경우 나트륨에 의해 심혈관 질환 및 위 질환에 부정적 영향을 끼칠 수 있습니다. 또한 자장밥에는 칼슘이 상대적으로 부족하여 해당 영양소를 보충하지 않을 시 골다공증이나 우울증 등에 영향을 줄 수 있습니다.

        콩나물밥의 경우 탄수화물이 풍부해 운동 신경 향상 및 에너지 제공에 기여하고, 칼륨도 풍부하여 체내 수분 균형 및 심혈관 질환 예방에도 도움이 될 수 있으나 과식했을 경우 식이섬유에 의해 소화 불량이 일어날 수 있기에 주의해주셔야 합니다. 또한 콩나물밥에는 비타민 A가 상대적으로 부족하여 이를 보충하지 않으면 면역력 하락 및 안구 건조증 등의 증상이 나타날 수 있고, 칼슘 역시 상대적으로 부족하여 보충하지 않으면 근경련 등의 증상이 나타날 수 있으니 주의해주셔야 합니다.


        음식1: {first_food}
        풍부한 영양소: {enough_1}
        부족한 영양소: {lack_1}

        음식2: {second_food}
        풍부한 영양소: {enough_2}
        부족한 영양소: {lack_2}


        분석 결과:  

        """
        result = rag.search(query_text=query)
        print(result)
        return result.answer




