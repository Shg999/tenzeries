import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { fp, hp, mp, screen, wp } from '../utils/responsive';

const games = [
  {
    id: 'tenzies',
    title: 'Tenzies',
    emoji: '🎲',
    description: 'Roll dice until all match!',
    color: '#5035FF',
    gradient: ['#667eea', '#764ba2'],
    screen: 'Game',
    difficulty: 'Easy',
    players: '1 Player',
    category: 'puzzle',
    featured: true,
  },
  {
    id: 'memory',
    title: 'Memory Match',
    emoji: '🧠',
    description: 'Find matching pairs of cards',
    color: '#e74c3c',
    gradient: ['#f093fb', '#f5576c'],
    screen: 'MemoryGame',
    difficulty: 'Medium',
    players: '1 Player',
    category: 'puzzle',
    featured: false,
  },
  {
    id: 'guess',
    title: 'Number Guess',
    emoji: '🔢',
    description: 'Guess the secret number',
    color: '#2ecc71',
    gradient: ['#11998e', '#38ef7d'],
    screen: 'GuessGame',
    difficulty: 'Easy',
    players: '1 Player',
    category: 'brain',
    featured: false,
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    emoji: '⚡',
    description: 'Test your reflexes!',
    color: '#f39c12',
    gradient: ['#f2994a', '#f2c94c'],
    screen: 'ReactionGame',
    difficulty: 'Hard',
    players: '1 Player',
    category: 'action',
    featured: true,
  },
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    emoji: '❌',
    description: 'Classic X and O game',
    color: '#9b59b6',
    gradient: ['#a855f7', '#6366f1'],
    screen: 'TicTacToe',
    difficulty: 'Easy',
    players: '2 Players',
    category: 'classic',
    featured: false,
  },
  {
    id: 'colormatch',
    title: 'Color Match',
    emoji: '🎨',
    description: 'Match colors quickly!',
    color: '#00bcd4',
    gradient: ['#06b6d4', '#0891b2'],
    screen: 'ColorMatch',
    difficulty: 'Medium',
    players: '1 Player',
    category: 'brain',
    featured: false,
  },
  {
    id: 'mathquiz',
    title: 'Math Quiz',
    emoji: '🧮',
    description: 'Quick math challenges!',
    color: '#3498db',
    gradient: ['#3b82f6', '#1d4ed8'],
    screen: 'MathQuiz',
    difficulty: 'Medium',
    players: '1 Player',
    category: 'brain',
    featured: true,
  },
  {
    id: 'whackamole',
    title: 'Whack-a-Mole',
    emoji: '🔨',
    description: 'Tap the appearing moles!',
    color: '#8b5cf6',
    gradient: ['#c084fc', '#7c3aed'],
    screen: 'WhackAMole',
    difficulty: 'Hard',
    players: '1 Player',
    category: 'action',
    featured: false,
  },
];

const categories = [
  { id: 'all', label: 'All', emoji: '🎮' },
  { id: 'action', label: 'Action', emoji: '⚡' },
  { id: 'brain', label: 'Brain', emoji: '🧠' },
  { id: 'puzzle', label: 'Puzzle', emoji: '🧩' },
  { id: 'classic', label: 'Classic', emoji: '🎯' },
];

// Featured Game Card (Large)
const FeaturedCard = ({ game, onPress, fadeAnim }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.featuredCard}
      >
        <View style={[styles.featuredGradient, { backgroundColor: game.gradient[0] }]}>
          <View style={[styles.featuredDecor1, { backgroundColor: game.gradient[1] }]} />
          <View style={[styles.featuredDecor2, { backgroundColor: game.gradient[1] }]} />
          
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ FEATURED</Text>
          </View>

          <View style={styles.featuredContent}>
            <Text style={styles.featuredEmoji}>{game.emoji}</Text>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>{game.title}</Text>
              <Text style={styles.featuredDesc}>{game.description}</Text>
              <View style={styles.featuredMeta}>
                <View style={styles.diffBadge}>
                  <Text style={styles.diffBadgeText}>{game.difficulty}</Text>
                </View>
                <Text style={styles.featuredPlayers}>👤 {game.players}</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuredPlayBtn}>
            <Text style={styles.featuredPlayText}>PLAY NOW →</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Regular Game Card
const GameCard = ({ game, onPress, fadeAnim, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.gameCard}
      >
        <View style={[styles.cardGradient, { backgroundColor: game.gradient[0] }]}>
          <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: game.gradient[1] }]} />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.emojiContainer}>
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
              </View>
              <View style={[styles.badge, game.difficulty === 'Hard' && styles.hardBadge]}>
                <Text style={styles.badgeText}>{game.difficulty}</Text>
              </View>
            </View>

            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.playersText}>{game.players}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featuredGames = games.filter(g => g.featured);
  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(g => g.category === selectedCategory);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background decorations */}
      <View style={styles.bgDecor1} />
      <View style={styles.bgDecor2} />
      <View style={styles.bgDecor3} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: headerScale }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome to</Text>
              <Text style={styles.title}>Gamify 🎮</Text>
            </View>
            <View style={styles.gamesCount}>
              <Text style={styles.gamesCountNumber}>{games.length}</Text>
              <Text style={styles.gamesCountLabel}>Games</Text>
            </View>
          </View>
        </Animated.View>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Featured Games</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featuredGames.map((game) => (
              <FeaturedCard
                key={game.id}
                game={game}
                fadeAnim={fadeAnim}
                onPress={() => navigation.navigate(game.screen)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.id && styles.categoryBtnActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Games Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? '🎮 All Games' : `${categories.find(c => c.id === selectedCategory)?.emoji} ${categories.find(c => c.id === selectedCategory)?.label} Games`}
          </Text>
          <View style={styles.gamesGrid}>
            {filteredGames.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                index={index}
                fadeAnim={fadeAnim}
                onPress={() => navigation.navigate(game.screen)}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gamify • Made with ❤️</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Ad Container */}
      <View style={styles.adContainer}>
        <BannerAdComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  bgDecor1: {
    position: 'absolute',
    top: hp(-100),
    right: wp(-100),
    width: wp(300),
    height: wp(300),
    borderRadius: wp(150),
    backgroundColor: '#5035FF',
    opacity: 0.08,
  },
  bgDecor2: {
    position: 'absolute',
    bottom: hp(200),
    left: wp(-80),
    width: wp(200),
    height: wp(200),
    borderRadius: wp(100),
    backgroundColor: '#e74c3c',
    opacity: 0.06,
  },
  bgDecor3: {
    position: 'absolute',
    top: hp(300),
    right: wp(-50),
    width: wp(150),
    height: wp(150),
    borderRadius: wp(75),
    backgroundColor: '#2ecc71',
    opacity: 0.05,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp(100),
  },
  header: {
    paddingTop: hp(50),
    paddingHorizontal: wp(20),
    paddingBottom: hp(10),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: fp(14),
    color: '#666',
    marginBottom: hp(4),
  },
  title: {
    fontSize: fp(28),
    fontWeight: '900',
    color: '#fff',
  },
  gamesCount: {
    backgroundColor: '#5035FF',
    paddingHorizontal: wp(16),
    paddingVertical: hp(10),
    borderRadius: mp(16),
    alignItems: 'center',
  },
  gamesCountNumber: {
    fontSize: fp(24),
    fontWeight: '900',
    color: '#fff',
  },
  gamesCountLabel: {
    fontSize: fp(10),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  section: {
    marginTop: hp(24),
  },
  sectionTitle: {
    fontSize: fp(18),
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp(16),
    paddingHorizontal: wp(20),
  },
  featuredScroll: {
    paddingHorizontal: wp(20),
    gap: wp(16),
  },
  featuredCard: {
    width: screen.width - wp(60),
    borderRadius: mp(24),
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  featuredGradient: {
    padding: wp(24),
    minHeight: hp(180),
    overflow: 'hidden',
  },
  featuredDecor1: {
    position: 'absolute',
    width: wp(150),
    height: wp(150),
    borderRadius: wp(75),
    top: hp(-50),
    right: wp(-30),
    opacity: 0.3,
  },
  featuredDecor2: {
    position: 'absolute',
    width: wp(100),
    height: wp(100),
    borderRadius: wp(50),
    bottom: hp(-30),
    left: wp(-20),
    opacity: 0.2,
  },
  featuredBadge: {
    position: 'absolute',
    top: hp(16),
    right: wp(16),
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: wp(12),
    paddingVertical: hp(6),
    borderRadius: mp(20),
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: fp(11),
    fontWeight: '700',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(10),
  },
  featuredEmoji: {
    fontSize: fp(60),
    marginRight: wp(20),
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: fp(24),
    fontWeight: '900',
    color: '#fff',
    marginBottom: hp(6),
  },
  featuredDesc: {
    fontSize: fp(14),
    color: 'rgba(255,255,255,0.85)',
    marginBottom: hp(10),
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
  },
  diffBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: wp(10),
    paddingVertical: hp(4),
    borderRadius: mp(8),
  },
  diffBadgeText: {
    color: '#fff',
    fontSize: fp(11),
    fontWeight: '700',
  },
  featuredPlayers: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fp(12),
  },
  featuredPlayBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: wp(20),
    paddingVertical: hp(12),
    borderRadius: mp(14),
    marginTop: hp(16),
  },
  featuredPlayText: {
    color: '#fff',
    fontSize: fp(14),
    fontWeight: '800',
  },
  categoriesScroll: {
    paddingHorizontal: wp(20),
    gap: wp(10),
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    borderRadius: mp(14),
    gap: wp(8),
  },
  categoryBtnActive: {
    backgroundColor: '#5035FF',
  },
  categoryEmoji: {
    fontSize: fp(18),
  },
  categoryLabel: {
    color: '#888',
    fontSize: fp(14),
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: wp(20),
    gap: wp(12),
  },
  gameCard: {
    width: (screen.width - wp(52)) / 2,
    borderRadius: mp(18),
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: wp(14),
    minHeight: hp(150),
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: wp(100),
    opacity: 0.3,
  },
  decorCircle1: {
    width: wp(70),
    height: wp(70),
    top: hp(-20),
    right: wp(-20),
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(10),
  },
  emojiContainer: {
    width: wp(44),
    height: wp(44),
    borderRadius: mp(12),
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameEmoji: {
    fontSize: fp(22),
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: mp(6),
  },
  hardBadge: {
    backgroundColor: 'rgba(231,76,60,0.4)',
  },
  badgeText: {
    color: '#fff',
    fontSize: fp(9),
    fontWeight: '700',
  },
  gameTitle: {
    fontSize: fp(15),
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp(4),
  },
  gameDescription: {
    fontSize: fp(10),
    color: 'rgba(255,255,255,0.75)',
    lineHeight: hp(14),
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: hp(10),
  },
  playersText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fp(10),
  },
  footer: {
    alignItems: 'center',
    paddingVertical: hp(30),
    paddingHorizontal: wp(20),
  },
  footerText: {
    color: '#444',
    fontSize: fp(13),
  },
  footerVersion: {
    color: '#333',
    fontSize: fp(11),
    marginTop: hp(4),
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a12',
    paddingVertical: hp(10),
    alignItems: 'center',
  },
});
