import { Text, View, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from "react-native"
import { router } from "expo-router"
import { LinearGradient } from 'expo-linear-gradient' // ✅ 추가

export default function Home() {
  const mealHistory = [
    {
      id: 1,
      name: "토마토 바질 샐러드",
      date: "2025.06.07",
      image: require("../assets/images/item1.png"),
      recommend: "마스카포네 치즈케이크",
    },
    {
      id: 2,
      name: "양송이 크림스프",
      date: "2025.06.05",
      image: require("../assets/images/item2.png"),
      recommend: "마스카포네 치즈케이크",
    },
    {
      id: 3,
      name: "양송이 크림스프",
      date: "2025.06.05",
      image: require("../assets/images/item3.png"),
      recommend: "마스카포네 치즈케이크",
    },
  ]

  const goToAnalyze = () => {
    router.push("/analyze")
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Image source={require("../assets/images/logo.png")} />
            </View>
          </View>
          <Text style={styles.appName}>푸드래곤</Text>
          <Text style={styles.subtitle}>
            푸드래곤은 먹을 음식을 찍으면 {"\n"}
            다음 먹을 음식을 추천해주는 서비스에요
          </Text>
        </View>

        {/* 분석하기 버튼 */}
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>오늘의 식사 분석하기</Text>
          <TouchableOpacity onPress={goToAnalyze} style={{ borderRadius: 12, overflow: 'hidden' }}>
            <LinearGradient
              colors={["#6BFF4A", "#8CFF73"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.analyzeButton}
            >
              <View style={styles.analyzeContent}>
                <View style={styles.textContainer}>
                  <Text style={styles.analyzeButtonSubtext}>
                    영양학적으로 균형잡힌 다음 메뉴를 추천받고 싶다면?
                  </Text>
                  <Text style={styles.analyzeButtonText}>방금 먹은 음식 분석하러가기</Text>
                </View>
                <Image
                  source={require("../assets/images/right.png")}
                  style={{ width: 24, height: 24 }}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 식사 히스토리 */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>나의 식사 히스토리</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          {mealHistory.map((meal) => (
            <TouchableOpacity key={meal.id} style={styles.historyItem}>
              <Image source={meal.image} style={styles.historyImage} />
              <View style={styles.historyContent}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.historyName}>{meal.name}</Text>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#6BFF4A",
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "bold", color: "black" }}>+</Text>
                  </View>

                  <Text style={styles.recommendText}>
                      {meal.recommend}</Text>
                </View>
                <Text style={styles.historyDate}>{meal.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    lineHeight: 20,
  },
  analysisSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 20,
  },
  analyzeButton: {
    borderRadius: 12,
    padding: 20,
    position: "relative",
  },
  analyzeContent: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  },

  textContainer: {
    flexShrink: 1, // 텍스트 영역이 줄어들 수 있게
  },
  analyzeButtonSubtext: {
    fontSize: 12,
    color: "black",
    marginBottom: 5,
    opacity: 0.9,
  },
  analyzeButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  arrowContainer: {
  position: 'absolute',
  right: 16, // 여백
  top: '50%',
  transform: [{ translateY: -12 }], // 높이 24px 기준 중앙 정렬
  },
  arrowText: {
    fontSize: 24,
    color: "white",
    fontWeight: "300",
  },
  historySection: {
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: "#999",
  },
  historyItem: {
    padding: 3,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: "#2C2C2E",
    borderRadius: 15,
  },
  historyContent: {
    flex: 1,
    marginLeft: 10,
  },
  historyName: {
    fontSize: 16,
    color: "white",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: "#999",
  },
  recommendText: {
  fontSize: 12,
  color: "#6BFF4A",
  fontWeight: "600",
  marginLeft: 5,
},
  historyImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  historyTag: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  historyTagText: {
    fontSize: 10,
    color: "white",
    fontWeight: "500",
  },
  arrowIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
})