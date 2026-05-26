import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, wp } from '../utils/responsive';

export default function GuessGame({ navigation }) {
  const [secretNumber, setSecretNumber] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Guess a number between 1-100');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState([]);
  const { showAd } = useInterstitialAd();
  const winSound = useRef(null);

  useEffect(() => {
    const loadSound = async () => {
      winSound.current = new Audio.Sound();
      try {
        await winSound.current.loadAsync(require('../assets/sounds/game-level-completed.wav'));
      } catch (error) {
        console.log('Error loading win sound:', error);
      }
    };
    loadSound();
    return () => {
      if (winSound.current) winSound.current.unloadAsync();
    };
  }, []);

  const playWinSound = async () => {
    try {
      await winSound.current?.replayAsync();
    } catch (e) {
      console.log('Win sound error', e);
    }
  };

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) {
      setMessage('Please enter a valid number (1-100)');
      return;
    }

    setAttempts(a => a + 1);
    
    let hint = '';
    if (num === secretNumber) {
      setMessage(`🎉 Correct! The number was ${secretNumber}`);
      setGameOver(true);
      playWinSound();
      showAd();
      hint = '✅ Correct!';
    } else if (num < secretNumber) {
      const diff = secretNumber - num;
      if (diff > 30) {
        setMessage('📈 Way too low! Go much higher');
        hint = '📈 Too low';
      } else if (diff > 10) {
        setMessage('⬆️ Too low! Go higher');
        hint = '⬆️ Low';
      } else {
        setMessage('🔥 Very close! Just a bit higher');
        hint = '🔥 Close (low)';
      }
    } else {
      const diff = num - secretNumber;
      if (diff > 30) {
        setMessage('📉 Way too high! Go much lower');
        hint = '📉 Too high';
      } else if (diff > 10) {
        setMessage('⬇️ Too high! Go lower');
        hint = '⬇️ High';
      } else {
        setMessage('🔥 Very close! Just a bit lower');
        hint = '🔥 Close (high)';
      }
    }

    setHistory(prev => [...prev, { num, hint }]);
    setGuess('');
  };

  const resetGame = () => {
    setSecretNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('Guess a number between 1-100');
    setAttempts(0);
    setGameOver(false);
    setHistory([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔢 Number Guess</Text>
      </View>

      {/* Attempts */}
      <View style={styles.attemptsContainer}>
        <Text style={styles.attemptsLabel}>Attempts</Text>
        <Text style={styles.attemptsValue}>{attempts}</Text>
      </View>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </View>

      {/* Input Area */}
      {!gameOver && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={guess}
            onChangeText={setGuess}
            keyboardType="number-pad"
            placeholder="Enter your guess"
            placeholderTextColor="#666"
            maxLength={3}
          />
          <TouchableOpacity style={styles.guessBtn} onPress={handleGuess}>
            <Text style={styles.guessBtnText}>Guess!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* History */}
      {history.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Your Guesses:</Text>
          <View style={styles.historyList}>
            {history.slice(-6).map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyNum}>{item.num}</Text>
                <Text style={styles.historyHint}>{item.hint}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Game Over */}
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>
            {attempts <= 5 ? '🏆 Amazing!' : attempts <= 7 ? '⭐ Great!' : '👍 Good job!'}
          </Text>
          <Text style={styles.gameOverStats}>
            You guessed it in {attempts} attempts!
          </Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.adContainer}>
        <BannerAdComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingTop: hp(50),
    paddingHorizontal: wp(20),
    paddingBottom: hp(10),
  },
  backBtn: {
    marginBottom: hp(10),
  },
  backText: {
    color: '#5035FF',
    fontSize: fp(16),
    fontWeight: '600',
  },
  title: {
    fontSize: fp(28),
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  attemptsContainer: {
    alignItems: 'center',
    marginVertical: hp(20),
  },
  attemptsLabel: {
    color: '#a0a0a0',
    fontSize: fp(14),
  },
  attemptsValue: {
    color: '#2ecc71',
    fontSize: fp(48),
    fontWeight: '800',
  },
  messageContainer: {
    backgroundColor: '#16213e',
    marginHorizontal: wp(20),
    padding: wp(20),
    borderRadius: mp(16),
    alignItems: 'center',
  },
  message: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(20),
    marginTop: hp(30),
    gap: wp(12),
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: mp(12),
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '700',
    textAlign: 'center',
  },
  guessBtn: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: wp(30),
    borderRadius: mp(12),
    justifyContent: 'center',
  },
  guessBtnText: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '700',
  },
  historyContainer: {
    marginTop: hp(30),
    paddingHorizontal: wp(20),
  },
  historyTitle: {
    color: '#a0a0a0',
    fontSize: fp(14),
    marginBottom: hp(12),
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  historyItem: {
    backgroundColor: '#16213e',
    paddingVertical: hp(8),
    paddingHorizontal: wp(16),
    borderRadius: mp(10),
    alignItems: 'center',
  },
  historyNum: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '700',
  },
  historyHint: {
    color: '#a0a0a0',
    fontSize: fp(10),
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: hp(40),
  },
  gameOverText: {
    fontSize: fp(32),
    fontWeight: '800',
    color: '#2ecc71',
  },
  gameOverStats: {
    fontSize: fp(16),
    color: '#a0a0a0',
    marginTop: hp(10),
  },
  playAgainBtn: {
    backgroundColor: '#2ecc71',
    paddingVertical: hp(14),
    paddingHorizontal: wp(40),
    borderRadius: mp(12),
    marginTop: hp(20),
  },
  playAgainText: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '700',
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    alignItems: 'center',
  },
});
