import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, ImageBackground, Image } from "react-native"
import { router, useLocalSearchParams } from "expo-router"

export default function FinalResult() {
  const { category, taste, food, foodName } = useLocalSearchParams()

  // Sample result data based on the combination
  const getResultData = () => {
    return {
      grade: "A",
      title: "처음 음식의 부족한 단백질을 이렇게 저렴게 보충해줄 수 있어요!",
      subtitle: "100g 기준",
      description: [
        "대한항공과 아시아나항공의 마일리지 통합안에 대한 정광 당국의 심사 개시가 늦어으로 다가온 가운데 합병 비용 산정에 관심이 쏠리고 있습니다.",
        "항공업계에서는 항공기 탑승으로 적립한 마일리지는 1대 1로 통합할 수 있지만, 신용카드 이용 등으로 쌓은 제휴 마일리지는 1대 1 전환이 어려울 것이라는 관측이 제기됩니다.",
        "오늘(8일) 업계에 따르면 대한항공은 오는 12일까지 공정거래위원회에 아시아의 마일리지 통합 비용과 전환 계획 등을 담은 통합안을 제출할 계획입니다.",
        "이번 통합으로 인해 소비자들은 더욱 다양한 혜택을 누릴 수 있을 것으로 예상되며, 항공업계의 경쟁력 강화에도 기여할 것으로 보입니다.",
        "전문가들은 이러한 변화가 국내 항공산업의 글로벌 경쟁력을 높이는 중요한 전환점이 될 것이라고 분석하고 있습니다.",
        "향후 통합 과정에서 발생할 수 있는 다양한 이슈들에 대한 세심한 검토와 준비가 필요할 것으로 보입니다.",
      ],
    }
  }

  const resultData = getResultData()

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Header with food combination */}
      <View style={styles.header}>
        <View style={styles.combinationContainer}>
          <View style={styles.combinationItem}>
            <Text style={styles.combinationText}>토마토 바질 샐러드</Text>
          </View>
          <Text style={styles.plusSign}>+</Text>
          <View style={styles.combinationItem}>
            <Text style={styles.combinationEmoji}>🍲</Text>
            <Text style={styles.combinationText}>{foodName || "콩나물국"}</Text>
          </View>
          <Text style={styles.questionText}>의 궁합은?</Text>
        </View>
      </View>

      {/* Grade Section */}
      <View style={styles.gradeSection}>
        {/* <ImageBackground
          source={require('../assets/images/FinalBack.png')}
          style={styles.gradeBackground}
          imageStyle={styles.gradeBackgroundImage}
        >
          <Text style={styles.gradeText}>{resultData.grade}</Text>
        </ImageBackground> */}
        {/* 배경 이미지 */}
        <Image source={require('../assets/images/FinalBack.png')} style={styles.backgroundImage} />

        {/* 가운데 Score 이미지 */}
        <Image source={require('../assets/images/Score.png')} style={styles.overlayImage} />
        <Text style={styles.combinationResult}>토마토 바질 샐러드 + {foodName || "콩나물국"}</Text>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <Text style={styles.progressText}>15</Text>
          <View style={styles.progressLine} />
          <Text style={styles.progressText}>40</Text>
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <View style={styles.descriptionHeader}>
          <Text style={styles.descriptionTitle}>{resultData.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{resultData.subtitle}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {resultData.description.map((paragraph, index) => (
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  combinationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  combinationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  combinationText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  combinationEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  plusSign: {
    color: "white",
    fontSize: 16,
    marginHorizontal: 8,
  },
  questionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  gradeSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  gradeBackground: {
    width: '100%',
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  gradeBackgroundImage: {
    borderRadius: 20,
  },
  gradeText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  combinationResult: {
    color: "white",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6BFF4A",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#333",
    marginHorizontal: 10,
  },
  progressText: {
    color: "#666",
    fontSize: 12,
  },
  descriptionSection: {
    flex: 1,
    paddingHorizontal: 20,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
    marginBottom: 15,
  },
  homeButton: {
    margin: 20,
    backgroundColor: "#6BFF4A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  overlayImage: {
    width: 80,
    height: 120,
    resizeMode: 'contain',
    zIndex: 1,
  },
})
