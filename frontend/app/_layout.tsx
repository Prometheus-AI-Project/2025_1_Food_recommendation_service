import { Stack } from 'expo-router';
import { useState } from "react";
import SplashScreen from "./SplashScreen";


export default function Layout() {
  const [isSplashFinished, setSplashFinished] = useState(false);
  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setSplashFinished(true)} />;
  }
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: 'black' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ 
          title: '',
          headerBackTitle: '',  
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: "black",
         }} 
        
      />
      <Stack.Screen
        name="analyze"
        options={{
          title: '', // 타이틀 없애기
          headerTintColor: 'white', // ← Back 버튼 색상
          headerBackTitle: " ",     // ← Back 텍스트 변경
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: '', // 타이틀 없애기
          headerTintColor: 'white', // ← Back 버튼 색상   
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="step1"
        options={{
          title: '', // 타이틀 없애기
          headerTintColor: 'white', // ← Back 버튼 색상     // ← Back 텍스트 변경
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="step2"
        options={{
          title: '', // 타이틀 없애기
          headerTintColor: '#4CAF50', // ← Back 버튼 색상
          headerBackTitle: '이전',     // ← Back 텍스트 변경
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="step3"
        options={{
          title: '', // 타이틀 없애기
          headerTintColor: 'white', // ← Back 버튼 색상
          headerBackTitle: "",     // ← Back 텍스트 변경
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="food-detail"
        options={{
          title: '음식 세부정보', // 타이틀 없애기
          headerTintColor: 'white', // ← Back 버튼 색상
          headerBackTitle: "",     // ← Back 텍스트 변경
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      <Stack.Screen
        name="final-result"
        options={{
          title: "", // 타이틀 없애기
          headerTintColor: 'white', // ← Back 버튼 색상
          headerBackTitle: "이전",     // ← Back 텍스트 변경
          headerStyle: { backgroundColor: 'black' },
          headerBackTitleStyle: {
            fontSize: 16,
          },
        }}
      />
      
    </Stack>
  );
}