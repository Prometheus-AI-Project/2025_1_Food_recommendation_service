import { Text, View, StyleSheet, TouchableOpacity, StatusBar, Animated, Image } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useState, useEffect, useRef } from "react"
import { router } from "expo-router"

export default function Analyze() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<"camera" | "gallery" | null>(null)
  const spinValue = useRef(new Animated.Value(0)).current

  // Spinning animation for loading
  useEffect(() => {
    if (loading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      )
      spinAnimation.start()
      return () => spinAnimation.stop()
    }
  }, [loading, spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      alert("카메라 권한이 필요합니다!")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
      setSelectedMethod("camera")
    }
  }

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("갤러리 권한이 필요합니다!")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
      setSelectedMethod("gallery")
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("image", {
        uri: selectedImage,
        type: "image/jpeg",
        name: "photo.jpg",
      } as any)

      const response = await fetch("https://d4f3b528543c.ngrok-free.app/analyze", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const result = await response.json()
      router.push(
        `/result?imageUri=${encodeURIComponent(selectedImage)}&prediction=${encodeURIComponent(result.prediction)}` as any,
      )
    } catch (error) {
      console.error("이미지 분석 중 오류 발생:", error)
      alert("이미지 분석 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="black" />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View> */}

      <View style={styles.content}>
        {/* Image Display Area */}
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} resizeMode="cover" />
          </View>
        )}

        {/* Method Selection Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.methodButton, selectedMethod === "camera" && styles.selectedButton]}
            onPress={pickImageFromCamera}
            disabled={loading}
          >
            <View style={styles.buttonIconContainer}>
              <View style={styles.buttonIcon}>
                    <Image source={require("../assets/images/picture.png")} style={styles.iconPlaceholder}></Image>
              </View>
            </View>
            <Text style={styles.buttonText}>촬영하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodButton, selectedMethod === "gallery" && styles.selectedButton]}
            onPress={pickImageFromGallery}
            disabled={loading}
          >
            <View style={styles.buttonIconContainer}>
              <View style={styles.buttonIcon}>
                <Image source={require("../assets/images/picture.png")} style={styles.iconPlaceholder}></Image>
              </View>
            </View>
            <Text style={styles.buttonText}>업로드하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedImage && styles.nextButtonDisabled]}
        onPress={analyzeImage}
        disabled={!selectedImage || loading}
      >
        <Text style={[styles.nextButtonText, !selectedImage && styles.nextButtonTextDisabled]}>다음으로</Text>
      </TouchableOpacity>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            {/* Rotating Circle */}
            <Animated.View style={[styles.loadingCircle, { transform: [{ rotate: spin }] }]}>
              <View style={styles.loadingProgress} />
            </Animated.View>
            {/* Mushroom Image in Center */}
            <View style={styles.mushroomContainer}>
              <Image
                source={require("../assets/images/mushroom.png")}
                style={styles.mushroomImage}
                resizeMode="contain"
              />
            </View>
          </View>
          {/* Loading Text */}
          <Text style={styles.loadingText}>사진을 분석중이에요</Text>
        </View>
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "300",
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  helpButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "400",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    marginBottom: 40,
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  methodButton: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  selectedButton: {
    backgroundColor: "#4CAF50",
  },
  buttonIconContainer: {
    marginBottom: 15,
    marginTop: 15,
    height: 130,
  },
  buttonIcon: {
    width: "100%",
    height: 45,
  },
  iconPlaceholder: {
    width: 100,
    height: 120,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  nextButton: {
    margin: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 50,
  },
  nextButtonDisabled: {
    backgroundColor: "#2C2C2E",
  },
  nextButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    height: 20,
  },
  nextButtonTextDisabled: {
    color: "#666",
  },
  // Loading Styles
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    position: "relative",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  loadingCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E8F5E8",
    borderTopColor: "#4CAF50",
  },
  loadingProgress: {
    width: "100%",
    height: "100%",
  },
  mushroomContainer: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 30,
  },
  mushroomImage: {
    width: 40,
    height: 40,
  },
  loadingText: {
    fontSize: 18,
    color: "white",
    fontWeight: "500",
    marginBottom: 60,
  },
})
