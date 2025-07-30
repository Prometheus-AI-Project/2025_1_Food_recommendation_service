import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const fade3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade1, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(fade2, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(fade3, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(onFinish, 800);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* splash1 (위쪽 바구니) */}
      <Animated.Image
        source={require("../assets/images/splash1.png")}
        style={[styles.overlayImage, { opacity: fade1 }]}
      />
      {/* splash2 (바구니 위에 음식 이미지 겹침) */}
      <Animated.Image
        source={require("../assets/images/splash2.png")}
        style={[styles.overlayImage, { opacity: fade2 }]}
      />
      {/* splash3 (푸드래곤 글자, 아래쪽) */}
      <Animated.Image
        source={require("../assets/images/splash3.png")}
        style={[styles.bottomImage, { opacity: fade3 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayImage: {
    position: "absolute",
    top: "40%", // 화면 중앙쯤
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  bottomImage: {
    marginTop: 170, // 음식 이미지 아래에 위치
    width: 140,
    height: 50,
    resizeMode: "contain",
  },
});