import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, wp } from '../utils/responsive';

const COLORS = [
  { name: 'Red', hex: '#e74c3c' },
  { name: 'Blue', hex: '#3498db' },
  { name: 'Green', hex: '#2ecc71' },
  { name: 'Yellow', hex: '#f1c40f' },
  { name: 'Purple', hex: '#9b59b6' },
  { name: 'Orange', hex: '#e67e22' },
  { name: 'Pink', hex: '#e91e63' },
  { name: 'Cyan', hex: '#00bcd4' },
];

export default function ColorMatch({ navigation }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [displayColor, setDisplayColor] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [isMatch, setIsMatch] = useState(true);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { showAd } = useInterstitialAd();
  const winSound = useRef(null);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/game-level-completed.wav')
      );
      winSound.current = sound;
    };
    loadSound();
    return () => {
      if (winSound.current) winSound.current.unloadAsync();
    };
  }, []);

  const playWinSound = async () => {
    if (winSound.current) {
      await winSound.current.replayAsync();
    }
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    generateNewRound();
  };

  const endGame = () => {
    setGameActive(false);
    if (score > highScore) {
      setHighScore(score);
      playWinSound();
    }
    showAd();
  };

  const generateNewRound = () => {
    const randomDisplay = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomText = COLORS[Math.floor(Math.random() * COLORS.length)];
    const shouldMatch = Math.random() > 0.5;
    
    setDisplayColor(randomDisplay);
    setTextColor(shouldMatch ? randomDisplay : randomText);
    setIsMatch(shouldMatch || randomDisplay.name === randomText.name);
  };

  const handleAnswer = (answer) => {
    if (!gameActive) return;

    if (answer === isMatch) {
      setScore(s => s + 1);
      generateNewRound();
    } else {
      // Wrong answer shake
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      
      setTimeLeft(t => Math.max(0, t - 3)); // Penalty
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎨 Color Match</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={[styles.statCard, timeLeft <= 5 && styles.urgentCard]}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={[styles.statValue, timeLeft <= 5 && styles.urgentText]}>{timeLeft}s</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>

      {gameActive ? (
        <>
          {/* Instructions */}
          <Text style={styles.instruction}>
            Does the COLOR of the text match the WORD?
          </Text>

          {/* Color Display */}
          <Animated.View 
            style={[
              styles.colorCard,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            <Text style={[styles.colorText, { color: textColor.hex }]}>
              {displayColor.name}
            </Text>
          </Animated.View>

          {/* Answer Buttons */}
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerBtn, styles.yesBtn]}
              onPress={() => handleAnswer(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.answerBtnText}>✓ YES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerBtn, styles.noBtn]}
              onPress={() => handleAnswer(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.answerBtnText}>✗ NO</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>Wrong answer = -3 seconds!</Text>
        </>
      ) : (
        <View style={styles.startContainer}>
          {score > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>
                {score >= 20 ? '🏆' : score >= 15 ? '🌟' : score >= 10 ? '👍' : '💪'}
              </Text>
              <Text style={styles.resultText}>You scored {score}!</Text>
              {score === highScore && score > 0 && (
                <Text style={styles.newHighScore}>🎉 New High Score!</Text>
              )}
            </View>
          )}
          
          <Text style={styles.howToPlay}>
            Match the TEXT COLOR with the WORD{'\n'}
            Answer as many as you can in 30 seconds!
          </Text>

          <TouchableOpacity style={styles.startBtn} onPress={startGame}>
            <Text style={styles.startBtnText}>
              {score > 0 ? '🔄 Play Again' : '🎮 Start Game'}
            </Text>
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(20),
    marginVertical: hp(20),
  },
  statCard: {
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
    borderRadius: mp(12),
    alignItems: 'center',
    minWidth: wp(80),
  },
  urgentCard: {
    backgroundColor: '#c0392b',
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: fp(12),
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: fp(24),
    fontWeight: '800',
  },
  urgentText: {
    color: '#fff',
  },
  instruction: {
    color: '#888',
    fontSize: fp(14),
    textAlign: 'center',
    marginBottom: hp(20),
  },
  colorCard: {
    backgroundColor: '#16213e',
    marginHorizontal: wp(40),
    paddingVertical: hp(60),
    borderRadius: mp(20),
    alignItems: 'center',
  },
  colorText: {
    fontSize: fp(48),
    fontWeight: '900',
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(20),
    marginTop: hp(40),
    paddingHorizontal: wp(20),
  },
  answerBtn: {
    flex: 1,
    paddingVertical: hp(20),
    borderRadius: mp(16),
    alignItems: 'center',
  },
  yesBtn: {
    backgroundColor: '#2ecc71',
  },
  noBtn: {
    backgroundColor: '#e74c3c',
  },
  answerBtnText: {
    color: '#fff',
    fontSize: fp(22),
    fontWeight: '800',
  },
  hint: {
    color: '#666',
    fontSize: fp(12),
    textAlign: 'center',
    marginTop: hp(20),
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(40),
  },
  resultCard: {
    backgroundColor: '#16213e',
    padding: wp(30),
    borderRadius: mp(20),
    alignItems: 'center',
    marginBottom: hp(30),
  },
  resultEmoji: {
    fontSize: fp(60),
  },
  resultText: {
    color: '#fff',
    fontSize: fp(24),
    fontWeight: '700',
    marginTop: hp(10),
  },
  newHighScore: {
    color: '#f1c40f',
    fontSize: fp(16),
    marginTop: hp(10),
  },
  howToPlay: {
    color: '#888',
    fontSize: fp(14),
    textAlign: 'center',
    lineHeight: hp(22),
    marginBottom: hp(30),
  },
  startBtn: {
    backgroundColor: '#5035FF',
    paddingVertical: hp(18),
    paddingHorizontal: wp(50),
    borderRadius: mp(16),
  },
  startBtnText: {
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '800',
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
