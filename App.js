import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import AddDorm from './screens/addDorm';
import FindDorm from './screens/findDorm';

const Stack = createNativeStackNavigator();



export default function App() {
  useEffect(() => {
    (async () => {
      // Request location permission
      await Location.requestForegroundPermissionsAsync();
      console.log("App started");
    })();
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddDorm" component={AddDorm} />
        <Stack.Screen name="FindDorm" component={FindDorm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
