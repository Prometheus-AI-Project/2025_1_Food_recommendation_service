import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

export default function Step3() {
  const { category, taste } = useLocalSearchParams();
  const [selectedFood, setSelectedFood] = useState<string>('');

  const foods = [
    { id: 'beansprout1', name: '콩나물국', image: require('../assets/images/plate.png') },
    { id: 'soybean', name: '된장국', image: require('../assets/images/plate.png') },
    { id: 'beansprout2', name: '콩나물국', image: require('../assets/images/plate.png') },
  ];

//   const handleNext = () => {
//     if (selectedFood) {
//       router.push(`/step4?category=${category}&taste=${taste}&food=${selectedFood}`);
//     }
//   };
const handleSelectFood = (foodId: string) => {
    setSelectedFood(foodId);
    router.push({
      pathname: '/food-detail', // 📍 실제 파일명이 app/food-detail.tsx라면 이렇게 써야함
      params: {
        category: category as string,
        taste: taste as string,
        foodId: foodId,
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
        <Text style={styles.title1}>국 카테고리에서 추천하는 음식이에요</Text>
        <Text style={styles.title2}>음식을 선택해 세부정보를 확인해보세요</Text>

        <View style={styles.foodsContainer}>
          {foods.map((food) => (
            <TouchableOpacity
              key={food.id}
              style={[
                styles.foodButton,
                selectedFood === food.id && styles.selectedFood
              ]}
              // onPress={() => setSelectedFood(food.id)}
              onPress={() => handleSelectFood(food.id)}
            >
              <View style={styles.categoryContent}>
                <Image source={food.image} style={styles.categoryIcon} />
                <Text style={[
                  styles.foodText,
                  selectedFood === food.id && styles.selectedFoodText
                ]}>
                  {food.name}
                </Text>
              </View>
              
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Button */}
      {/* <TouchableOpacity 
        style={[styles.nextButton, !selectedFood && styles.disabledButton]} 
        // onPress={handleNext}
        disabled={!selectedFood}
      >
        <Text style={[styles.nextButtonText, !selectedFood && styles.disabledButtonText]}>
          다음으로
        </Text>
      </TouchableOpacity> */}
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
    width: 70, 
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
  nextButton: {
    margin: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#2C2C2E',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: 'white',
  },
});