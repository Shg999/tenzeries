import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Game from '../screens/Game';
import ResultScreen from '../screens/ResultScreen';

const Stack = createNativeStackNavigator();
function AppNavigator() {
    return (
            <Stack.Navigator screenOptions={{headerShown:false}}>
                <Stack.Screen name="Game" component={Game} />
                <Stack.Screen name="Result" component={ResultScreen} />
            </Stack.Navigator>
    )
}

export default AppNavigator
