import { Audio } from 'expo-av';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BannerAdComponent from '../components/Banner_Ad';
import Die from '../components/Die';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { holdDie, newGame, rollDice, tick } from '../store/tenziesSlice';
import { fp, hp, mp, wp } from '../utils/responsive';

const Game = ({ navigation }) => {
  const dispatch = useDispatch();
  const { dice, rolls, time, tenzies, bestScore } = useSelector(state => state.tenzies);
  const rollSound = useRef(null);
  const { showAd } = useInterstitialAd();

  useEffect(() => {
    // Reset game when entering
    dispatch(newGame());
  }, []);

  useEffect(() => {
    const loadSound = async () => {
      rollSound.current = new Audio.Sound();
      try {
        await rollSound.current.loadAsync(require('../assets/sounds/roll-dice.wav'));
      } catch (error) {
        console.log('Error loading sound:', error);
      }
    };
    loadSound();
    return () => {
      if (rollSound.current) {
        rollSound.current.unloadAsync();
      }
    };
  }, []);

  const handleRoll = async () => {
    try {
      await rollSound.current?.replayAsync();
    } catch (e) {
      console.log('Roll sound error', e);
    }
    dispatch(rollDice());
  };

  useEffect(() => {
    const timer = setInterval(() => dispatch(tick()), 1000);
    return () => clearInterval(timer);
  }, []);

  const score = Math.max(10000 - (rolls * 100 + time * 10), 0);

  useEffect(() => {
    if (tenzies) {
      showAd();
      navigation.navigate('Result', {
        rolls,
        time,
        score,
      });
    }
  }, [tenzies]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.header}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🎲 Rolls</Text>
          <Text style={styles.statValue}>{rolls}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>⏱️ Time</Text>
          <Text style={styles.statValue}>{formatTime(time)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🏆 Best</Text>
          <Text style={styles.statValue}>{bestScore}</Text>
        </View>
      </View>

      {/* Game Card */}
      <View style={styles.gameCard}>
        <View style={styles.gameCardInner}>
          <Text style={styles.title}>🎯 Tenzies</Text>
          <Text style={styles.subtitle}>
            Roll until all dice match. Tap a die to freeze it!
          </Text>

          <View style={styles.grid}>
            {dice.map(die => (
              <Die
                key={die.id}
                value={die.value}
                isHeld={die.isHeld}
                onPress={() => dispatch(holdDie(die.id))}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.rollButton} 
            onPress={handleRoll}
            activeOpacity={0.8}
          >
            <Text style={styles.rollButtonText}>🎲 Roll</Text>
          </TouchableOpacity>

          <Text style={styles.scorePreview}>Current Score: {score}</Text>
        </View>
      </View>

      {/* Ad Container */}
      <View style={styles.adContainer}>
        <BannerAdComponent />
      </View>
    </View>
  );
};

export default Game;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: hp(40),
  },
  headerTop: {
    paddingHorizontal: wp(20),
    marginBottom: hp(10),
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#5035FF',
    fontSize: fp(16),
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(16),
    marginBottom: hp(20),
  },
  statCard: {
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    paddingHorizontal: wp(20),
    borderRadius: mp(16),
    alignItems: 'center',
    minWidth: wp(90),
    elevation: 5,
    shadowColor: '#5035FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: fp(12),
    fontWeight: '600',
    marginBottom: hp(4),
  },
  statValue: {
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '800',
  },
  gameCard: {
    flex: 1,
    marginHorizontal: wp(16),
    marginBottom: hp(16),
    backgroundColor: '#0f3460',
    borderRadius: mp(24),
    padding: wp(6),
    elevation: 10,
    shadowColor: '#5035FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  gameCardInner: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: mp(20),
    padding: wp(20),
    alignItems: 'center',
  },
  title: {
    fontSize: fp(28),
    fontWeight: '800',
    color: '#1a1a2e',
    marginTop: hp(10),
    marginBottom: hp(8),
  },
  subtitle: {
    fontSize: fp(14),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(24),
    paddingHorizontal: wp(10),
    lineHeight: hp(20),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: wp(12),
    padding: wp(16),
    backgroundColor: '#f8f9fa',
    borderRadius: mp(16),
    marginBottom: hp(24),
  },
  rollButton: {
    backgroundColor: '#5035FF',
    paddingVertical: hp(16),
    paddingHorizontal: wp(48),
    borderRadius: mp(16),
    elevation: 6,
    shadowColor: '#5035FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  rollButtonText: {
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '800',
  },
  scorePreview: {
    marginTop: hp(20),
    fontSize: fp(14),
    color: '#888',
    fontWeight: '600',
  },
  adContainer: {
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    paddingHorizontal: wp(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
});