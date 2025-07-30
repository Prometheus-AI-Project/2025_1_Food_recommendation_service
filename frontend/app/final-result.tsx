import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function FinalResult() {
  const { food_name, recommended_food, category_num, detail } = useLocalSearchParams();

  console.log("category_num:", category_num);
  console.log("food_name:", food_name);
  console.log("recommended_food:", recommended_food);
  console.log("detail(raw):", detail);

  // category_num에 따른 이미지 매핑
  const categoryImages: Record<number, any> = {
    1: require("../assets/images/item1.png"),
    2: require("../assets/images/plate.png"),
    3: require("../assets/images/item3.png"),
    4: require("../assets/images/noodle.png"),
    5: require("../assets/images/banchan.png"),
    6: require("../assets/images/item2.png"),
  };

  //  detail을 안전하게 배열로 변환
  let parsedDetails: string[] = [];
  try {
    const parsed = typeof detail === "string" ? JSON.parse(detail) : detail;
    parsedDetails = Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch (error) {
    parsedDetails = ["분석 결과를 불러올 수 없습니다."];
  }

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header with food combination */}
      <View style={styles.header}>
        <View style={styles.combinationContainer}>
          {/* 첫 번째 음식 */}
          <View style={styles.combinationItem}>
            <Text style={styles.combinationText}>{food_name}</Text>
          </View>

          <Text style={styles.plusSign}>+</Text>

          {/* 추천 음식 */}
          <View style={styles.combinationItem}>
            <Image
              source={categoryImages[Number(category_num)] || categoryImages[1]}
              style={styles.foodImage}
            />
            <Text style={styles.combinationText}>{recommended_food}</Text>
          </View>

          <Text style={styles.questionText}>의 궁합은?</Text>
        </View>
      </View>

      {/* Grade Section */}
      <View style={styles.gradeSection}>
        {/* 배경 이미지 */}
        <Image source={require("../assets/images/FinalBack.png")} style={styles.backgroundImage} />

        {/* 가운데 Score 이미지 */}
        <Image source={require("../assets/images/Score.png")} style={styles.overlayImage} />
        {/* <Text style={styles.combinationResult}>
          {food_name} + {recommended_food}
        </Text> */}

        {/* Progress indicator */}
        {/* <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <Text style={styles.progressText}>15</Text>
          <View style={styles.progressLine} />
          <Text style={styles.progressText}>40</Text>
        </View> */}
      </View>

      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <View style={styles.descriptionHeader}>
          <Text style={styles.descriptionTitle}>건강 분석 결과</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>100g 기준</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {parsedDetails.map((paragraph, index) => (
            <Text key={index} style={styles.descriptionText}>
              {paragraph}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Home Button */}
      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonText}>홈으로</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  combinationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap" },
  combinationItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#333",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4
  },
  combinationText: { color: "white", fontSize: 14, fontWeight: "500" },
  plusSign: { color: "white", fontSize: 16, marginHorizontal: 8 },
  questionText: { color: "white", fontSize: 16, fontWeight: "500", marginLeft: 8 },
  foodImage: { width: 20, height: 20, resizeMode: "contain", marginRight: 6 },
  gradeSection: { alignItems: "center", paddingVertical: 40 },
  combinationResult: { color: "white", fontSize: 14, marginBottom: 20, textAlign: "center" },
  progressContainer: { flexDirection: "row", alignItems: "center", width: "80%" },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6BFF4A" },
  progressLine: { flex: 1, height: 2, backgroundColor: "#333", marginHorizontal: 10 },
  progressText: { color: "#666", fontSize: 12 },
  descriptionSection: { flex: 1, paddingHorizontal: 20 },
  descriptionHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  descriptionTitle: { fontSize: 18, fontWeight: "600", color: "white", flex: 1, lineHeight: 24 },
  badge: { backgroundColor: "#333", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginLeft: 10 },
  badgeText: { fontSize: 12, color: "#6BFF4A", fontWeight: "500" },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  descriptionText: { fontSize: 14, color: "#999", lineHeight: 20, marginBottom: 15 },
  homeButton: { margin: 20, backgroundColor: "#6BFF4A", paddingVertical: 16, borderRadius: 12, alignItems: "center", marginBottom: 50 },
  homeButtonText: { fontSize: 16, color: "black", fontWeight: "600",  },
  backgroundImage: { position: "absolute", width: "100%", height: 280, resizeMode: "cover" },
  overlayImage: { width: 90, height: 130, resizeMode: "contain", zIndex: 1 },
});