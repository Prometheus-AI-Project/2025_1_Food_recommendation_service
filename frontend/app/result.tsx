import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from "react-native"
import { useLocalSearchParams, router } from "expo-router"

export default function Result() {
  const { imageUri, prediction } = useLocalSearchParams()

  const handleNext = () => {
    const cleanFoodName = typeof prediction === "string"
      ? prediction.split("(")[0].trim()
      : "";

    router.push({
      pathname: '/step1',
      params: { food_name: cleanFoodName }, // 전처리된 음식명 전달
    });
  };

  return (
    
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "33%" }]} />
        </View>
        <Text style={styles.progressText}>1 / 3</Text>
      </View>

      <View style={styles.content}>
        {/* Food Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri as string }} style={styles.image} resizeMode="cover" />
        </View>

        {/* Food Name */}
        <Text style={styles.foodName}>
          {typeof prediction === "string" ? prediction.split("(")[0].trim() : "맞는 음식이 없음"}
        </Text>

        {/* Recommendation Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>이 음식과 함께할 음식을 추천해드릴게요!</Text>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>다음으로</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
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
    textAlign: "right",
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  imageContainer: {
    width: 280,
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  foodName: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginBottom: 40,
  },
  messageContainer: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 100,
    marginHorizontal: 20,
  },
  messageText: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    fontWeight: "500",
  },
  nextButton: {
    margin: 20,
    height: 50,
    backgroundColor: "#6BFF4A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 50,
  },
  nextButtonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
})
