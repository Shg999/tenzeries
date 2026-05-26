import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ColorMatch from '../screens/ColorMatch';
import Game from '../screens/Game';
import GuessGame from '../screens/GuessGame';
import HomeScreen from '../screens/HomeScreen';
import MathQuiz from '../screens/MathQuiz';
import MemoryGame from '../screens/MemoryGame';
import ReactionGame from '../screens/ReactionGame';
import ResultScreen from '../screens/ResultScreen';
import TicTacToe from '../screens/TicTacToe';
import WhackAMole from '../screens/WhackAMole';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Game" component={Game} />
      <Stack.Screen name="Result" component={ResultScreen} />
      <Stack.Screen name="MemoryGame" component={MemoryGame} />
      <Stack.Screen name="GuessGame" component={GuessGame} />
      <Stack.Screen name="ReactionGame" component={ReactionGame} />
      <Stack.Screen name="TicTacToe" component={TicTacToe} />
      <Stack.Screen name="ColorMatch" component={ColorMatch} />
      <Stack.Screen name="MathQuiz" component={MathQuiz} />
      <Stack.Screen name="WhackAMole" component={WhackAMole} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
