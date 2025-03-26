// app/navigation/StackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../components/MainScreen';
import CalculationScreen from '../components/CalculationScreen';
import PlantaUploadScreen from '../components/PlantaUploadScreen';

export type RootStackParamList = {
  Main: undefined;
  Calculation: undefined;
  PlantaUpload: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Main">
      <Stack.Screen name="Main" component={MainScreen} options={{ title: 'Chat IA - Cemear' }} />
      <Stack.Screen name="Calculation" component={CalculationScreen} options={{ title: 'Cálculo de Materiais' }} />
      <Stack.Screen name="PlantaUpload" component={PlantaUploadScreen} options={{ title: 'Interpretar Planta' }} />
    </Stack.Navigator>
  );
}
