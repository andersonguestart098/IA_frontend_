// app/components/CalculationScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CalculationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de cálculo de materiais</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
});
