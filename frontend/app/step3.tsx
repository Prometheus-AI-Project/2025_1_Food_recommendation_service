import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { BACKEND_URL } from './config';

export default function Step3() {
  const { category, food_name } = useLocalSearchParams(); 
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [foods, setFoods] = useState<any[]>([]);

  //  카테고리 번호 → 이미지 매핑
  const categoryImages: Record<number, any> = {
    1: require('../assets/images/realRice.png'),
    2: require('../assets/images/plate.png'),
    3: require('../assets/images/realWest.png'),
    4: require('../assets/images/noodle.png'),
    5: require('../assets/images/banchan.png'),
    6: require('../assets/images/realDessert.png'),
  };

  // 백엔드에서 추천 음식 3개 가져오기
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const formData = new FormData();
        formData.append('food_name', food_name as string);
        formData.append('category', category as string);

        const response = await fetch(`${BACKEND_URL}/recommend`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.recommended) {
          // 추천 음식 배열에 이미지 추가
          const mappedFoods = data.recommended.map((item: any, index: number) => ({
            id: `${item.name}-${index}`,
            name: item.name,
            category_num: item.category_num,
            image: categoryImages[item.category_num] || categoryImages[1],
          }));
          setFoods(mappedFoods);
        }
      } catch (error) {
        console.error('추천 음식 가져오기 오류:', error);
      }
    };

    fetchRecommendations();
  }, [category, food_name]);

  const handleSelectFood = (foodName: string, categoryNum: number) => {
    setSelectedFood(foodName);
    router.push({
      pathname: '/food-detail',
      params: {
        category: category as string,
        food_name: food_name as string,  // YOLO 감지 음식
        recommended_food: foodName, 
        category_num: categoryNum.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>3 / 3</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title1}>{category} 카테고리에서 추천하는 음식이에요</Text>
        <Text style={styles.title2}>음식을 선택해 세부정보를 확인해보세요</Text>

        <View style={styles.foodsContainer}>
          {foods.map((food) => (
            <TouchableOpacity
              key={food.id}
              style={[
                styles.foodButton,
                selectedFood === food.id && styles.selectedFood,
              ]}
              onPress={() => handleSelectFood(food.name, food.category_num)}
            >
              <View style={styles.categoryContent}>
                <Image source={food.image} style={styles.categoryIcon} />
                
                {/* 텍스트 가로 스크롤 */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ maxWidth: 50 }} // 버튼 내부에서만 스크롤
                >
                  <Text
                    style={[
                      styles.foodText,
                      selectedFood === food.id && styles.selectedFoodText,
                    ]}
                  >
                    {food.name}
                  </Text>
                </ScrollView>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(107, 255, 74, 0.3)",
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6BFF4A",
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    marginTop: 70,
  },
  title1: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  title2: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF54',
    textAlign: 'center',
    marginBottom: 60,
  },
  foodsContainer: {
    alignItems: 'center',
    gap: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  foodButton: {
    width: 80, 
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
    marginHorizontal: 5,
    alignSelf: 'center',
  },
  selectedFood: {
    backgroundColor: '#333',
    borderWidth: 2,
  },
  categoryIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedFoodText: {
    color: '#666',
    fontWeight: '600',
  },
});