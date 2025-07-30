import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

export default function FoodDetail() {
  const { category, food_name, recommended_food, category_num } = useLocalSearchParams();

  console.log(food_name)
  console.log(recommended_food)
  console.log(category_num)

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<string[]>([]);
  const [foodName, setFoodName] = useState(recommended_food as string);

  // category_num에 따른 이미지 매핑
  const categoryImages: Record<number, any> = {
    1: require('../assets/images/realRice.png'),
    2: require('../assets/images/plate.png'),
    3: require('../assets/images/realWest.png'),
    4: require('../assets/images/noodle.png'),
    5: require('../assets/images/banchan.png'),
    6: require('../assets/images/realDessert.png'),
  };

  //  nutrition 값 (예시로 고정)
  const nutritionOriginal = { carbs: 19, protein: 19, fat: 19 };
  const nutritionCombined = { carbs: 22, protein: 20, fat: 18 };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://236920e22689.ngrok-free.app/final-analyze", {
          method: "POST",
          headers: {
              Accept: "application/json",
             "Content-Type": "application/json" 
            },
          body: JSON.stringify({
            firstfood: String(food_name),
            secondfood: String(recommended_food),
          }),
        });

        const data = await response.json();

        if (data.result) {
          setDetails(data.result.split("\n").filter((line: string) => line.trim() !== ""));
        } else {
          setDetails(["분석 결과가 없습니다."]);
        }
      } catch (error) {
        console.error("분석 요청 오류:", error);
        setDetails(["오류로 인해 분석 결과를 가져오지 못했습니다."]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [food_name, recommended_food]);

  const handleSelectFood = () => {
    router.push({
      pathname: "/final-result",
      params: {
        category,
        food_name: food_name as string,         
        recommended_food: recommended_food as string, 
        category_num: category_num as string,    
        detail: JSON.stringify(details),
      },
    });
  };

  const handleBack = () => router.back();

  const renderNutritionBar = (value: number, maxValue = 30) => {
    const percentage = (value / maxValue) * 100;
    return (
      <View style={styles.nutritionBarContainer}>
        <View style={styles.nutritionBarBackground}>
          <View style={[styles.nutritionBarFill, { height: `${percentage}%` }]} />
        </View>
        <Text style={styles.nutritionValue}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>음식 세부정보</Text>
        <View style={styles.placeholder} />
      </View> */}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#6BFF4A" style={{ marginTop: 50 }} />
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Food Title */}
            <View style={styles.foodTitleContainer}>
              <Image
                source={categoryImages[Number(category_num)] || categoryImages[1]}
                style={styles.foodImage}
              />
              <Text style={styles.foodName}>{foodName}</Text>
            </View>

            {/* Nutrition Charts */}
            <View style={styles.chartsContainer}>
              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>처음 음식</Text>
                <View style={styles.nutritionChart}>
                  {renderNutritionBar(nutritionOriginal.carbs)}
                  {renderNutritionBar(nutritionOriginal.protein)}
                  {renderNutritionBar(nutritionOriginal.fat)}
                </View>
                <View style={styles.nutritionLabels}>
                  <Text style={styles.nutritionLabel}>탄수화물</Text>
                  <Text style={styles.nutritionLabel}>단백질</Text>
                  <Text style={styles.nutritionLabel}>지방</Text>
                </View>
              </View>

              <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>이 음식을 함께 섭취한다면?</Text>
                <View style={styles.nutritionChart}>
                  {renderNutritionBar(nutritionCombined.carbs)}
                  {renderNutritionBar(nutritionCombined.protein)}
                  {renderNutritionBar(nutritionCombined.fat)}
                </View>
                <View style={styles.nutritionLabels}>
                  <Text style={styles.nutritionLabel}>탄수화물</Text>
                  <Text style={styles.nutritionLabel}>단백질</Text>
                  <Text style={styles.nutritionLabel}>지방</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <View style={styles.descriptionHeader}>
                <Text style={styles.descriptionTitle}>
                  건강과 맛을 고려한 분석 결과입니다
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>100g 기준</Text>
                </View>
              </View>

              <View style={styles.detailsContainer}>
                {details.map((detail, index) => (
                  <Text key={index} style={styles.detailText}>
                    {detail}
                  </Text>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Select Button */}
      <TouchableOpacity style={styles.selectButton} onPress={handleSelectFood}>
        <Text style={styles.selectButtonText}>이 음식 선택하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  foodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  chartsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  chartSection: {
    flex: 1,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 14,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  nutritionChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 120,
    marginBottom: 10,
  },
  nutritionBarContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  nutritionBarBackground: {
    width: 30,
    height: 100,
    backgroundColor: "#333",
    borderRadius: 4,
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  nutritionBarFill: {
    width: "100%",
    backgroundColor: "#6BFF4A",
    borderRadius: 4,
    minHeight: 4,
  },
  nutritionValue: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  nutritionLabels: {
    flexDirection: "row",
    justifyContent: "center",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 8,
    textAlign: "center",
    width: 30,
  },
  descriptionContainer: {
    marginBottom: 100,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    flex: 1,
    lineHeight: 24,
  },
  badge: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 12,
    color: "#6BFF4A",
    fontWeight: "500",
  },
  detailsContainer: {
    gap: 15,
  },
  detailText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  selectButton: {
    margin: 20,
    backgroundColor: "#6BFF4A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 50
  },
  selectButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  foodImage: {
    width: 30,        // 🔹 이미지 크기
    height: 30,
  },
})
