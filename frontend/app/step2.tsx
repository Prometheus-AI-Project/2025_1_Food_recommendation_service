import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

export default function Step2() {
  const { category } = useLocalSearchParams();
  const [selectedTaste, setSelectedTaste] = useState<string>('');

  const tastes = [
    { id: 'spicy', name: '매운맛', emoji: '🥵' },
    { id: 'sour1', name: '신맛', emoji: '😋' },
    { id: 'sour2', name: '신맛', emoji: '😋' },
    { id: 'sour3', name: '신맛', emoji: '😋' },
    { id: 'sour4', name: '신맛', emoji: '😋' },
  ];

  const handleNext = () => {
    if (selectedTaste) {
      router.push(`/step3?category=${category}&taste=${selectedTaste}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
        <Text style={styles.progressText}>3 / 5</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>원하는 맛을 선택해주세요</Text>

        <View style={styles.tastesContainer}>
          {tastes.map((taste) => (
            <TouchableOpacity
              key={taste.id}
              style={[
                styles.tasteButton,
                selectedTaste === taste.id && styles.selectedTaste
              ]}
              onPress={() => setSelectedTaste(taste.id)}
            >
              <Text style={styles.tasteEmoji}>{taste.emoji}</Text>
              <Text style={[
                styles.tasteText,
                selectedTaste === taste.id && styles.selectedTasteText
              ]}>
                {taste.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={[styles.nextButton, !selectedTaste && styles.disabledButton]} 
        onPress={handleNext}
        disabled={!selectedTaste}
      >
        <Text style={[styles.nextButtonText, !selectedTaste && styles.disabledButtonText]}>
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
    paddingTop: 60,
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
    backgroundColor: "#07BD52",
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'right',
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 60,
  },
  tastesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  tasteButton: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedTaste: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  tasteEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  tasteText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedTasteText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  nextButton: {
    margin: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
});