import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

export default function Step1() {
  const { food_name } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = [
    { id: '밥', name: '밥', image: require('../assets/images/rice.png') },
    { id: '국', name: '국', image: require('../assets/images/soup.png') },
    { id: '양식', name: '양식', image: require('../assets/images/western.png') },
    { id: '면', name: '면', image: require('../assets/images/noodles.png') },
    { id: '반찬', name: '반찬', image: require('../assets/images/side.png') },
    { id: '디저트', name: '디저트', image: require('../assets/images/dessert.png') },
  ];

  const handleNext = () => {
    if (selectedCategory) {
      router.push({
        pathname: '/step3',
        params: { 
          food_name, // YOLO 감지 음식 전달
          category: selectedCategory 
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressText}>2 / 3</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>원하는 카테고리를 선택해주세요</Text>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={styles.categoryContent}>
                <Image source={category.image} style={styles.categoryIcon} />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}
                >
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedCategory && styles.disabledButton]}
        onPress={handleNext}
        disabled={!selectedCategory}
      >
        <Text style={[styles.nextButtonText, !selectedCategory && styles.disabledButtonText]}>
          다음으로
        </Text>
      </TouchableOpacity>
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
    marginTop: 80,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 60,
  },
  categoriesContainer: {
    marginLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
},
  categoryButton: {
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
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    color: '#ccc',
    fontWeight: '500',
  },
  selectedCategory: {
    backgroundColor: '#1F2F1F',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedCategoryText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  nextButton: {
    margin: 20,
    backgroundColor: '#6BFF4A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 50,
  },
  disabledButton: {
    backgroundColor: '#2C2C2E',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: 'white',
  },
});