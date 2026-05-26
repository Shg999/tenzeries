import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, screen, wp } from '../utils/responsive';

const GRID_SIZE = 3;
const CELL_SIZE = (screen.width - wp(80)) / GRID_SIZE;

export default function WhackAMole({ navigation }) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [molePosition, setMolePosition] = useState(-1);
  const [moleType, setMoleType] = useState('mole'); // mole, golden, bomb
  const [hitFeedback, setHitFeedback] = useState(null);
  const { showAd } = useInterstitialAd();
  
  const gameActiveRef = useRef(false);
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
  
  const moleAnim = useRef(new Animated.Value(0)).current;
  const moleTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (moleTimeout.current) clearTimeout(moleTimeout.current);
    };
  }, []);

  useEffect(() => {
    gameActiveRef.current = gameActive;
  }, [gameActive]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
  }, [timeLeft, gameActive]);

  const showMole = () => {
    if (!gameActiveRef.current) return;

    const newPos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    const rand = Math.random();
    const type = rand < 0.1 ? 'bomb' : rand < 0.25 ? 'golden' : 'mole';
    
    setMolePosition(newPos);
    setMoleType(type);
    
    Animated.spring(moleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    const hideTime = type === 'golden' ? 600 : type === 'bomb' ? 1200 : 900;
    
    moleTimeout.current = setTimeout(() => {
      hideMole();
    }, hideTime);
  };

  const hideMole = () => {
    Animated.timing(moleAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setMolePosition(-1);
      if (gameActiveRef.current) {
        setTimeout(showMole, 300 + Math.random() * 400);
      }
    });
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    gameActiveRef.current = true;
    setHitFeedback(null);
    setMolePosition(-1);
    moleAnim.setValue(0);
    setTimeout(showMole, 500);
  };

  const endGame = () => {
    setGameActive(false);
    gameActiveRef.current = false;
    setMolePosition(-1);
    if (moleTimeout.current) clearTimeout(moleTimeout.current);
    if (score > highScore) {
      setHighScore(score);
      playWinSound();
    }
    showAd();
  };

  const whack = (index) => {
    if (!gameActive || index !== molePosition) return;

    if (moleTimeout.current) clearTimeout(moleTimeout.current);

    let points = 0;
    let feedback = '';

    if (moleType === 'golden') {
      points = 50;
      feedback = '+50 🌟';
    } else if (moleType === 'bomb') {
      points = -30;
      feedback = '-30 💥';
      setTimeLeft(t => Math.max(0, t - 3));
    } else {
      points = 10;
      feedback = '+10';
    }

    setScore(s => Math.max(0, s + points));
    setHitFeedback({ text: feedback, position: index });
    
    setTimeout(() => setHitFeedback(null), 500);
    
    hideMole();
  };

  const getMoleEmoji = () => {
    switch (moleType) {
      case 'golden': return '⭐';
      case 'bomb': return '💣';
      default: return '🐹';
    }
  };

  const renderCell = (index) => {
    const isActive = molePosition === index;
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.cell}
        onPress={() => whack(index)}
        activeOpacity={0.8}
      >
        <View style={styles.hole}>
          {isActive && (
            <Animated.View
              style={[
                styles.mole,
                {
                  transform: [
                    {
                      translateY: moleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    {
                      scale: moleAnim,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.moleEmoji}>{getMoleEmoji()}</Text>
            </Animated.View>
          )}
          {hitFeedback?.position === index && (
            <Text style={[
              styles.hitFeedback,
              hitFeedback.text.includes('-') && styles.negativeFeedback
            ]}>
              {hitFeedback.text}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔨 Whack-a-Mole</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={[styles.statCard, timeLeft <= 5 && styles.urgentCard]}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>

      {gameActive ? (
        <>
          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendItem}>🐹 +10</Text>
            <Text style={styles.legendItem}>⭐ +50</Text>
            <Text style={styles.legendItem}>💣 -30</Text>
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {Array(GRID_SIZE * GRID_SIZE)
              .fill(null)
              .map((_, index) => renderCell(index))}
          </View>
        </>
      ) : (
        <View style={styles.startContainer}>
          {score > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>
                {score >= 300 ? '🏆' : score >= 200 ? '🌟' : score >= 100 ? '👍' : '💪'}
              </Text>
              <Text style={styles.resultScore}>Score: {score}</Text>
              {score === highScore && score > 0 && (
                <Text style={styles.newHighScore}>🎉 New High Score!</Text>
              )}
            </View>
          )}

          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>How to Play:</Text>
            <Text style={styles.instructionText}>🐹 Tap moles for +10 points</Text>
            <Text style={styles.instructionText}>⭐ Golden moles = +50 points!</Text>
            <Text style={styles.instructionText}>💣 Avoid bombs! (-30 & -3 sec)</Text>
          </View>

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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wp(20),
    marginBottom: hp(20),
  },
  legendItem: {
    color: '#888',
    fontSize: fp(14),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: wp(20),
    gap: wp(10),
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  hole: {
    flex: 1,
    backgroundColor: '#0d1b2a',
    borderRadius: mp(20),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#16213e',
  },
  mole: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moleEmoji: {
    fontSize: fp(50),
  },
  hitFeedback: {
    position: 'absolute',
    fontSize: fp(20),
    fontWeight: '800',
    color: '#2ecc71',
  },
  negativeFeedback: {
    color: '#e74c3c',
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
    width: '100%',
  },
  resultEmoji: {
    fontSize: fp(60),
  },
  resultScore: {
    color: '#fff',
    fontSize: fp(28),
    fontWeight: '800',
    marginTop: hp(10),
  },
  newHighScore: {
    color: '#f1c40f',
    fontSize: fp(16),
    marginTop: hp(10),
  },
  instructions: {
    backgroundColor: '#16213e',
    padding: wp(20),
    borderRadius: mp(16),
    marginBottom: hp(30),
    width: '100%',
  },
  instructionTitle: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '700',
    marginBottom: hp(12),
  },
  instructionText: {
    color: '#888',
    fontSize: fp(14),
    marginBottom: hp(6),
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
