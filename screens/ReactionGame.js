import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, wp } from '../utils/responsive';

export default function ReactionGame({ navigation }) {
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, go, result, tooEarly
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const { showAd } = useInterstitialAd();
  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
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
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameState('ready');
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    timeoutRef.current = setTimeout(() => {
      setGameState('go');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      startGame();
    } else if (gameState === 'ready') {
      clearTimeout(timeoutRef.current);
      setGameState('tooEarly');
    } else if (gameState === 'go') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setAttempts(prev => [...prev, time]);
      setGamesPlayed(g => g + 1);
      
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        playWinSound();
      }
      // Show ad every 5 attempts
      if ((gamesPlayed + 1) % 5 === 0) {
        showAd();
      }
      setGameState('result');
    } else if (gameState === 'result' || gameState === 'tooEarly') {
      setGameState('waiting');
    }
  };

  const getAverageTime = () => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };

  const getReactionRating = (time) => {
    if (time < 200) return { emoji: '⚡', text: 'Incredible!', color: '#9b59b6' };
    if (time < 250) return { emoji: '🔥', text: 'Amazing!', color: '#e74c3c' };
    if (time < 300) return { emoji: '🚀', text: 'Great!', color: '#f39c12' };
    if (time < 350) return { emoji: '👍', text: 'Good!', color: '#2ecc71' };
    if (time < 400) return { emoji: '😊', text: 'Average', color: '#3498db' };
    return { emoji: '🐢', text: 'Keep practicing!', color: '#95a5a6' };
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting': return '#1a1a2e';
      case 'ready': return '#e74c3c';
      case 'go': return '#2ecc71';
      case 'tooEarly': return '#e67e22';
      case 'result': return '#1a1a2e';
      default: return '#1a1a2e';
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case 'waiting': return 'Tap to Start';
      case 'ready': return 'Wait for green...';
      case 'go': return 'TAP NOW!';
      case 'tooEarly': return 'Too early! Tap to try again';
      case 'result': {
        const rating = getReactionRating(reactionTime);
        return `${rating.emoji} ${reactionTime}ms`;
      }
      default: return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, gameState !== 'waiting' && gameState !== 'result' && { color: '#fff' }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚡ Reaction Time</Text>
      </View>

      {/* Stats */}
      {(gameState === 'waiting' || gameState === 'result') && (
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Best</Text>
            <Text style={styles.statValue}>{bestTime ? `${bestTime}ms` : '-'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{attempts.length > 0 ? `${getAverageTime()}ms` : '-'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tries</Text>
            <Text style={styles.statValue}>{attempts.length}</Text>
          </View>
        </View>
      )}

      {/* Game Area */}
      <TouchableOpacity 
        style={styles.gameArea} 
        onPress={handleTap}
        activeOpacity={1}
      >
        <Text style={styles.gameMessage}>{getMessage()}</Text>
        
        {gameState === 'result' && (
          <View style={styles.resultDetails}>
            <Text style={[styles.ratingText, { color: getReactionRating(reactionTime).color }]}>
              {getReactionRating(reactionTime).text}
            </Text>
            <Text style={styles.tapAgain}>Tap to try again</Text>
          </View>
        )}

        {gameState === 'waiting' && (
          <Text style={styles.instructions}>
            When the screen turns green, tap as fast as you can!
          </Text>
        )}
      </TouchableOpacity>

      {/* Recent attempts */}
      {attempts.length > 0 && (gameState === 'waiting' || gameState === 'result') && (
        <View style={styles.attemptsContainer}>
          <Text style={styles.attemptsTitle}>Recent:</Text>
          <View style={styles.attemptsList}>
            {attempts.slice(-5).map((time, index) => (
              <View key={index} style={[styles.attemptBadge, { backgroundColor: getReactionRating(time).color }]}>
                <Text style={styles.attemptText}>{time}ms</Text>
              </View>
            ))}
          </View>
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
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: fp(12),
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '800',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(40),
  },
  gameMessage: {
    fontSize: fp(36),
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  resultDetails: {
    alignItems: 'center',
    marginTop: hp(20),
  },
  ratingText: {
    fontSize: fp(24),
    fontWeight: '700',
  },
  tapAgain: {
    color: '#a0a0a0',
    fontSize: fp(16),
    marginTop: hp(20),
  },
  instructions: {
    color: '#a0a0a0',
    fontSize: fp(16),
    textAlign: 'center',
    marginTop: hp(30),
    lineHeight: hp(24),
  },
  attemptsContainer: {
    paddingHorizontal: wp(20),
    marginBottom: hp(80),
  },
  attemptsTitle: {
    color: '#a0a0a0',
    fontSize: fp(14),
    marginBottom: hp(10),
  },
  attemptsList: {
    flexDirection: 'row',
    gap: wp(10),
    flexWrap: 'wrap',
  },
  attemptBadge: {
    paddingVertical: hp(6),
    paddingHorizontal: wp(14),
    borderRadius: mp(20),
  },
  attemptText: {
    color: '#fff',
    fontSize: fp(14),
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
