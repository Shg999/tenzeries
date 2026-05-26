import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, wp } from '../utils/responsive';

const emojis = ['🎮', '🎲', '🎯', '🏆', '⭐', '🔥', '💎', '🚀'];

const generateCards = () => {
  const cards = [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
  return cards;
};

export default function MemoryGame({ navigation }) {
  const [cards, setCards] = useState(generateCards());
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
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

  useEffect(() => {
    if (!gameOver) {
      const timer = setInterval(() => setTime(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver]);

  useEffect(() => {
    if (matches === 8) {
      setGameOver(true);
      playWinSound();
      showAd();
    }
  }, [matches]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].emoji === cards[second].emoji) {
        setCards(prev =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, isMatched: true } : card
          )
        );
        setMatches(m => m + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  }, [flippedCards]);

  const handleCardPress = (index) => {
    if (
      flippedCards.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    setCards(prev =>
      prev.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, index]);
    setMoves(m => m + 1);
  };

  const resetGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧠 Memory Match</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Moves</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{formatTime(time)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pairs</Text>
          <Text style={styles.statValue}>{matches}/8</Text>
        </View>
      </View>

      {/* Game Grid */}
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.isFlipped || card.isMatched
                ? styles.cardFlipped
                : styles.cardHidden,
              card.isMatched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(index)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>
              {card.isFlipped || card.isMatched ? card.emoji : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Game Over */}
      {gameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>🎉 You Won!</Text>
          <Text style={styles.gameOverStats}>
            Moves: {moves} | Time: {formatTime(time)}
          </Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {!gameOver && (
        <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
          <Text style={styles.resetText}>🔄 Reset</Text>
        </TouchableOpacity>
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
  },
  statLabel: {
    color: '#a0a0a0',
    fontSize: fp(12),
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: wp(20),
    gap: wp(10),
  },
  card: {
    width: wp(70),
    height: wp(70),
    borderRadius: mp(12),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cardHidden: {
    backgroundColor: '#e74c3c',
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardMatched: {
    backgroundColor: '#2ecc71',
  },
  cardEmoji: {
    fontSize: fp(32),
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: hp(30),
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
  resetBtn: {
    alignSelf: 'center',
    marginTop: hp(20),
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    paddingHorizontal: wp(30),
    borderRadius: mp(10),
  },
  resetText: {
    color: '#fff',
    fontSize: fp(16),
    fontWeight: '600',
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
