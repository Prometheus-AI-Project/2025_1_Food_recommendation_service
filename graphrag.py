import os
import openai
from neo4j_graphrag.llm import OpenAILLM
from neo4j import GraphDatabase, basic_auth
from neo4j.time import Date
from neo4j_graphrag.retrievers import Text2CypherRetriever
from neo4j_graphrag.generation import GraphRAG
import pandas as pd


first_food = ""
second_food = ""

nutrient_db = pd.read_excel("filtered_db_add_cate.xlsx")

record1 = nutrient_db.loc[nutrient_db["식품명"] == first_food]


record2 = nutrient_db.loc[nutrient_db["식품명"] == second_food]

enough_1 = []
lack_1 = []

enough_2 = []
lack_2 = []
nutrients = ["탄수화물(g)", "단백질(g)", "지방(g)", "식이섬유(g)", "칼슘(mg)", "칼륨(mg)", "나트륨(mg)", "비타민 A(μg RAE)", "비타민 C(mg)", "콜레스테롤(mg)"]
dv = [275, 120, 78, 28, 1300, 3000, 2300, 800, 80, 300]

for i in range(len(nutrients)):
  cur_nutrient = nutrients[i]
  percent_dv1 = ((((record1["식품중량"]/100)*record1[cur_nutrient])/dv[i]) * 100).iloc[0]
  
  percent_dv2 = ((((record2["식품중량"]/100)*record2[cur_nutrient])/dv[i]) * 100).iloc[0]
  
  if (percent_dv1 >= 20):
    enough_1.append(cur_nutrient[:cur_nutrient.index("(")])
  elif (percent_dv1 < 5):
    lack_1.append(cur_nutrient[:cur_nutrient.index("(")])
  
  if (percent_dv2 >= 20):
    enough_2.append(cur_nutrient[:cur_nutrient.index("(")])
  elif (percent_dv2 < 5):
    lack_2.append(cur_nutrient[:cur_nutrient.index("(")])
  


openai.api_key = os.getenv("OPENAI_API_KEY")

URI = ""
AUTH = ("neo4j", "")

with GraphDatabase.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity()

llm = OpenAILLM(model_name="gpt-4o", model_params={"temperature": 0.7})


def get_node_datatype(value):
    if isinstance(value, str):
        return "STRING"
    elif isinstance(value, int):
        return "INTEGER"
    elif isinstance(value, float):
        return "FLOAT"
    elif isinstance(value, bool):
        return "BOOLEAN"
    elif isinstance(value, list):
        return f"LIST[{get_node_datatype(value[0])}]" if value else "LIST"
    elif isinstance(value, Date):
        return "DATE"
    else:
        return "UNKNOWN"

def get_schema(uri, user, password):
    
    driver = GraphDatabase.driver(
        uri,
        auth=basic_auth(user, password))

    with driver.session() as session:
        # 노드 프로퍼티 및 타입 추출
        node_query = """
        MATCH (n)
        WITH DISTINCT labels(n) AS node_labels, keys(n) AS property_keys, n
        UNWIND node_labels AS label
        UNWIND property_keys AS key
        RETURN label, key, n[key] AS sample_value
        """
        nodes = session.run(node_query)

        # 관계 프로퍼티 및 타입 추출
        rel_query = """
        MATCH ()-[r]->()
        WITH DISTINCT type(r) AS rel_type, keys(r) AS property_keys, r
        UNWIND property_keys AS key
        RETURN rel_type, key, r[key] AS sample_value
        """
        relationships = session.run(rel_query)

        # 관계 유형 및 방향 추출
        rel_direction_query = """
        MATCH (a)-[r]->(b)
        RETURN DISTINCT labels(a) AS start_label, type(r) AS rel_type, labels(b) AS end_label
        ORDER BY start_label, rel_type, end_label
        """
        rel_directions = session.run(rel_direction_query)

        # 스키마 딕셔너리 생성
        schema = {"nodes": {}, "relationships": {}, "relations": []}

        for record in nodes:
            label = record["label"]
            key = record["key"]
            sample_value = record["sample_value"] # 데이터 타입을 추론하기 위한 샘플 데이터
            inferred_type = get_node_datatype(sample_value)
            if label not in schema["nodes"]:
                schema["nodes"][label] = {}
            schema["nodes"][label][key] = inferred_type

        for record in relationships:
            rel_type = record["rel_type"]
            key = record["key"]
            sample_value = record["sample_value"] # 데이터 타입을 추론하기 위한 샘플 데이터
            inferred_type = get_node_datatype(sample_value)
            if rel_type not in schema["relationships"]:
                schema["relationships"][rel_type] = {}
            schema["relationships"][rel_type][key] = inferred_type

        for record in rel_directions:
            start_label = record["start_label"][0]
            rel_type = record["rel_type"]
            end_label = record["end_label"][0]
            schema["relations"].append(f"(:{start_label})-[:{rel_type}]->(:{end_label})")

        return schema

def format_schema(schema):
    result = []

    # 노드 프로퍼티 출력
    result.append("Node properties:")
    for label, properties in schema["nodes"].items():
        props = ", ".join(f"{k}: {v}" for k, v in properties.items())
        result.append(f"{label} {{{props}}}")

    # 관계 프로퍼티 출력
    result.append("Relationship properties:")
    for rel_type, properties in schema["relationships"].items():
        props = ", ".join(f"{k}: {v}" for k, v in properties.items())
        result.append(f"{rel_type} {{{props}}}")

    # 관계 프로퍼티 출력
    result.append("The relationships:")
    for relation in schema["relations"]:
        result.append(relation)

    return "\n".join(result)



schema = get_schema(URI, "neo4j", "jAORUhZ30fJuUCsmIqKiYDFlRnD6cmn2QIVphA7GAwo")
neo4j_schema = format_schema(schema)


# Text2CypherRetriever
retriever = Text2CypherRetriever(
    driver=driver,
    llm=llm,  # type: ignore
    neo4j_schema=neo4j_schema
)


rag = GraphRAG(retriever=retriever, llm=llm)

query_text = f"""너는 두 가지 음식의 영양 정보가  주어지면, 이에  대해 효과를 그래프 데이터 베이스로부터 검색하여 분석 결과를 보여주는  아주 똑똑한 영양 분석 LLM 어시스턴트야. 이 일은 굉장히 중요한 일이기 때문에, 너가 실수하면 사용자의 건강에 안 좋은 영향을 미칠거야.

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

response = rag.search(query_text=query_text)
print(response.answer)

















