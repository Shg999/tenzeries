import { newGame } from '@/store/tenziesSlice';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useDispatch, useSelector } from 'react-redux';

export function ResultScreen({ route, navigation }) {
  const { rolls, time, score } = route.params;
  const bestScore = useSelector(state => state.tenzies.bestScore);
  const dispatch = useDispatch();
  const [showConfetti, setShowConfetti] = useState(true)
  const sound = useRef(null)

  useEffect(() => {
    const loadSound = async () => {
      sound.current = new Audio.Sound();
      try {
        await sound.current.loadAsync(require('../assets/sounds/game-level-completed.wav'));
        await sound.current.playAsync();
      } catch (error) {
        console.log('Error loading or playing sound:', error);
      }
    }
    loadSound();
    return () => {
      if(sound.current){
        sound.current.unloadAsync();
      }
    }
  }, [])

  const handleGame = () => {
    dispatch(newGame());
    navigation.replace('Game');
  };

  return (
    <View style={styles.result}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut
        />
      )}

      <Text style={styles.title}>🎉 Congratulations 🎉</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Roll Count</Text>
          <Text style={styles.value}>{rolls}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time Taken</Text>
          <Text style={styles.value}>
            {Math.floor(time / 60)}:{time % 60}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Your Score</Text>
          <Text style={[styles.value, styles.highlight]}>{score}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>High Score</Text>
          <Text style={[styles.value, styles.highlight]}>{bestScore}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGame}>
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ResultScreen;

const styles = StyleSheet.create({
  result: {
    flex: 1,
    backgroundColor: '#F5F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5035FF',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },

  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },

  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  highlight: {
    color: '#2ECC71',
  },

  button: {
    marginTop: 25,
    backgroundColor: '#5035FF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
