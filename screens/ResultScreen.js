import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useDispatch, useSelector } from 'react-redux';
import BannerAdComponent from '../components/Banner_Ad';
import { newGame } from '../store/tenziesSlice';
import { fp, hp, mp, wp } from '../utils/responsive';

export default function ResultScreen({ route, navigation }) {
  const { rolls, time, score } = route.params;
  const bestScore = useSelector(state => state.tenzies.bestScore);
  const dispatch = useDispatch();
  const [showConfetti, setShowConfetti] = useState(true);
  const sound = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const isNewHighScore = score >= bestScore && score > 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadSound = async () => {
      sound.current = new Audio.Sound();
      try {
        await sound.current.loadAsync(require('../assets/sounds/game-level-completed.wav'));
        await sound.current.playAsync();
      } catch (error) {
        console.log('Error loading or playing sound:', error);
      }
    };
    loadSound();
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const handleGame = () => {
    dispatch(newGame());
    navigation.replace('Game');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={250}
          origin={{ x: -10, y: 0 }}
          fadeOut
          explosionSpeed={400}
        />
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.trophyContainer}>
          <Text style={styles.trophy}>🏆</Text>
        </View>

        <Text style={styles.title}>
          {isNewHighScore ? '🎉 New High Score! 🎉' : '🎉 You Won! 🎉'}
        </Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎲</Text>
            <Text style={styles.statValue}>{rolls}</Text>
            <Text style={styles.statLabel}>Rolls</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{formatTime(time)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🏅</Text>
            <Text style={styles.statValue}>{bestScore}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGame}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🎮 Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  trophyContainer: {
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(20),
    elevation: 8,
    shadowColor: '#5035FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  trophy: {
    fontSize: fp(48),
  },
  title: {
    fontSize: fp(24),
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp(24),
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#5035FF',
    paddingVertical: hp(20),
    paddingHorizontal: wp(48),
    borderRadius: mp(20),
    alignItems: 'center',
    marginBottom: hp(24),
    elevation: 6,
    shadowColor: '#5035FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  scoreLabel: {
    fontSize: fp(14),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: hp(4),
  },
  scoreValue: {
    fontSize: fp(48),
    fontWeight: '800',
    color: '#fff',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: mp(20),
    paddingVertical: hp(20),
    paddingHorizontal: wp(24),
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: hp(32),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: fp(24),
    marginBottom: hp(8),
  },
  statValue: {
    fontSize: fp(22),
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp(4),
  },
  statLabel: {
    fontSize: fp(12),
    color: '#a0a0a0',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: hp(50),
    backgroundColor: '#2a3a5e',
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingVertical: hp(18),
    paddingHorizontal: wp(48),
    borderRadius: mp(16),
    elevation: 6,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '800',
  },
  homeButton: {
    marginTop: hp(16),
    backgroundColor: '#16213e',
    paddingVertical: hp(14),
    paddingHorizontal: wp(40),
    borderRadius: mp(12),
    borderWidth: 2,
    borderColor: '#5035FF',
  },
  homeButtonText: {
    color: '#5035FF',
    fontSize: fp(16),
    fontWeight: '700',
  },
  adContainer: {
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
