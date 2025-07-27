import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function FoodDetail() {
  const { category, taste, foodId } = useLocalSearchParams()

  // Sample food data - you can replace this with your actual data
  const foodData = {
    beansprout1: {
      name: "콩나물국",
      emoji: "🍲",
      original: { carbs: 19, protein: 19, fat: 19 },
      combined: { carbs: 19, protein: 19, fat: 19 },
      description: "서로 영양을 보완하며, 맛과 건강을 동시에 챙길 수 있는 매우 좋은 조합입니다",
      details: [
        "대한항공과 아시아나항공의 마일리지 통합안에 대한 정광 당국의 심사 개시가 늦어으로 다가온 가운데 합병 비용 산정에 관심이 쏠리고 있습니다.",
        "항공업계에서는 항공기 탑승으로 적립한 마일리지는 1대 1로 통합할 수 있지만, 신용카드 이용 등으로 쌓은 제휴 마일리지는 1대 1 전환이 어려울 것이라는 관측이 제기됩니다.",
        "오늘(8일) 업계에 따르면 대한항공은 오는 12일까지 공정거래위원회에 아시아의 마일리지 통합 비용과 전환 계획 등을 담은 통합안을 제출할 계획입니다.",
      ],
    },
    soybean: {
      name: "된장국",
      emoji: "🍲",
      original: { carbs: 15, protein: 22, fat: 18 },
      combined: { carbs: 20, protein: 25, fat: 20 },
      description: "영양 균형이 잘 맞는 조합으로 건강한 식사를 위한 좋은 선택입니다",
      details: [
        "된장국은 한국의 전통 발효식품으로 풍부한 단백질과 유익한 미생물을 함유하고 있습니다.",
        "이 조합은 필수 아미노산을 골고루 제공하여 영양학적으로 우수한 식단을 구성합니다.",
        "발효 과정에서 생성된 유산균이 장 건강에 도움을 주며, 소화 흡수율을 높여줍니다.",
      ],
    },
    beansprout2: {
      name: "콩나물국",
      emoji: "🍲",
      original: { carbs: 17, protein: 20, fat: 16 },
      combined: { carbs: 22, protein: 24, fat: 19 },
      description: "비타민과 미네랄이 풍부한 조합으로 면역력 강화에 도움이 됩니다",
      details: [
        "콩나물은 비타민 C와 식이섬유가 풍부하여 면역력 강화와 소화 건강에 좋습니다.",
        "저칼로리 고영양 식품으로 다이어트에도 효과적이며 포만감을 오래 유지시켜줍니다.",
        "아스파라긴산이 풍부하여 피로 회복과 숙취 해소에도 도움을 줍니다.",
      ],
    },
  }

  const currentFood = foodData[foodId as keyof typeof foodData] || foodData.beansprout1

  const handleSelectFood = () => {
    router.push({
      pathname: '/final-result',
      params: {
        category: category,
        taste: taste,
        food: foodId,
        foodName: currentFood.name,
      },
    })
  }

  const handleBack = () => {
    router.back()
  }

  const renderNutritionBar = (value: number, maxValue = 30) => {
    const percentage = (value / maxValue) * 100
    return (
      <View style={styles.nutritionBarContainer}>
        <View style={styles.nutritionBarBackground}>
          <View style={[styles.nutritionBarFill, { height: `${percentage}%` }]} />
        </View>
        <Text style={styles.nutritionValue}>{value}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>음식 세부정보</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food Title */}
        <View style={styles.foodTitleContainer}>
          <Text style={styles.foodEmoji}>{currentFood.emoji}</Text>
          <Text style={styles.foodName}>{currentFood.name}</Text>
        </View>

        {/* Nutrition Charts */}
        <View style={styles.chartsContainer}>
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>처음 음식</Text>
            <View style={styles.nutritionChart}>
              {renderNutritionBar(currentFood.original.carbs)}
              {renderNutritionBar(currentFood.original.protein)}
              {renderNutritionBar(currentFood.original.fat)}
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
              {renderNutritionBar(currentFood.combined.carbs)}
              {renderNutritionBar(currentFood.combined.protein)}
              {renderNutritionBar(currentFood.combined.fat)}
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
            <Text style={styles.descriptionTitle}>{currentFood.description}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>100g 기준</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            {currentFood.details.map((detail, index) => (
              <Text key={index} style={styles.detailText}>
                {detail}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Select Button */}
      <TouchableOpacity style={styles.selectButton} onPress={handleSelectFood}>
        <Text style={styles.selectButtonText}>이 음식 선택하기</Text>
      </TouchableOpacity>
    </View>
  )
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
    paddingTop: 60,
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
  },
  selectButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
})
