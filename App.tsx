import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import TagScannerScreen from './screens/TagScannerScreen';
import AssignTagScreen from './screens/AssignTagScreen';
import OfflineModeScreen from './screens/OfflineModeScreen';
import HomeScreen from './screens/HomeScreen';
import AIInsightsScreen from './screens/AIInsightsScreen';
import AIChatScreen from './screens/AIChatScreen';

// Define the navigation stack types
export type RootStackParamList = {
  Home: undefined;
  TagScanner: undefined;
  AssignTag: undefined;
  OfflineMode: undefined;
  AIInsights: undefined;
  AIChat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb', // Blue color
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'RFID Warehouse' }} 
        />
        <Stack.Screen 
          name="TagScanner" 
          component={TagScannerScreen} 
          options={{ title: 'Tag Scanner' }} 
        />
        <Stack.Screen 
          name="AssignTag" 
          component={AssignTagScreen} 
          options={{ title: 'Assign Tag' }} 
        />
        <Stack.Screen 
          name="OfflineMode" 
          component={OfflineModeScreen} 
          options={{ title: 'Offline Mode' }} 
        />
        <Stack.Screen 
          name="AIInsights" 
          component={AIInsightsScreen} 
          options={{ 
            title: 'AI Insights',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="AIChat" 
          component={AIChatScreen} 
          options={{ 
            title: 'AI Assistant',
            headerShown: false
          }} 
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
