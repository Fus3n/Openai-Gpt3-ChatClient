import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from '@react-navigation/native';


import Home from "./components/Home";
import Settings from './components/Settings';


const Stack = createNativeStackNavigator();


export default function App() {
  return (
   <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{headerShown: false}} name="Home" component={Home} />  
        <Stack.Screen options={{headerShown: false}} name="Settings" component={Settings} />
      </Stack.Navigator>
   </NavigationContainer>

  );
}

