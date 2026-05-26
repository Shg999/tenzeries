import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, wp } from '../utils/responsive';

const generateQuestion = (difficulty) => {
  const operations = ['+', '-', '×'];
  if (difficulty >= 2) operations.push('÷');
  
  const op = operations[Math.floor(Math.random() * operations.length)];
  let a, b, answer;
  
  const maxNum = difficulty === 1 ? 20 : difficulty === 2 ? 50 : 100;
  
  switch (op) {
    case '+':
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      answer = a * b;
      break;
    case '÷':
      b = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 12) + 1;
      a = b * answer;
      break;
  }
  
  return { question: `${a} ${op} ${b}`, answer };
};

export default function MathQuiz({ navigation }) {
  const [difficulty, setDifficulty] = useState(1);
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
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

  const startGame = (diff) => {
    setDifficulty(diff);
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setTimeLeft(60);
    setGameActive(true);
    setFeedback(null);
    setQuestion(generateQuestion(diff));
    setUserAnswer('');
  };

  const endGame = () => {
    setGameActive(false);
    if (streak > bestStreak) {
      setBestStreak(streak);
      playWinSound();
    }
    showAd();
  };

  const checkAnswer = () => {
    if (!userAnswer) return;
    
    const isCorrect = parseInt(userAnswer) === question.answer;
    
    if (isCorrect) {
      const points = difficulty * 10 * (1 + streak * 0.1);
      setScore(s => s + Math.round(points));
      setStreak(s => s + 1);
      setFeedback({ correct: true, message: streak >= 2 ? `🔥 ${streak + 1} streak!` : '✓ Correct!' });
    } else {
      setFeedback({ correct: false, message: `✗ Answer: ${question.answer}` });
      if (streak > bestStreak) setBestStreak(streak);
      setStreak(0);
    }
    
    setQuestionsAnswered(q => q + 1);
    setUserAnswer('');
    
    setTimeout(() => {
      setQuestion(generateQuestion(difficulty));
      setFeedback(null);
    }, 800);
  };

  const getDifficultyLabel = (diff) => {
    return diff === 1 ? 'Easy' : diff === 2 ? 'Medium' : 'Hard';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🧮 Math Quiz</Text>
      </View>

      {gameActive ? (
        <>
          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={[styles.statCard, timeLeft <= 10 && styles.urgentCard]}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{timeLeft}s</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={[styles.statValue, streak >= 3 && styles.streakText]}>
                {streak >= 3 ? '🔥' : ''}{streak}
              </Text>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.difficultyBadge}>{getDifficultyLabel(difficulty)}</Text>
            <Text style={styles.questionText}>{question?.question} = ?</Text>
          </View>

          {/* Feedback */}
          {feedback && (
            <View style={[styles.feedback, feedback.correct ? styles.correctFeedback : styles.wrongFeedback]}>
              <Text style={styles.feedbackText}>{feedback.message}</Text>
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userAnswer}
              onChangeText={setUserAnswer}
              keyboardType="number-pad"
              placeholder="Your answer"
              placeholderTextColor="#666"
              onSubmitEditing={checkAnswer}
              autoFocus
            />
            <TouchableOpacity style={styles.submitBtn} onPress={checkAnswer}>
              <Text style={styles.submitBtnText}>→</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.menuContainer}>
          {questionsAnswered > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>
                {score >= 500 ? '🏆' : score >= 300 ? '🌟' : score >= 150 ? '👍' : '💪'}
              </Text>
              <Text style={styles.resultScore}>Score: {score}</Text>
              <Text style={styles.resultDetails}>
                Questions: {questionsAnswered} | Best Streak: {bestStreak}
              </Text>
            </View>
          )}

          <Text style={styles.chooseDifficulty}>Choose Difficulty:</Text>

          <View style={styles.difficultyButtons}>
            <TouchableOpacity
              style={[styles.diffBtn, { backgroundColor: '#2ecc71' }]}
              onPress={() => startGame(1)}
            >
              <Text style={styles.diffEmoji}>😊</Text>
              <Text style={styles.diffBtnText}>Easy</Text>
              <Text style={styles.diffDesc}>+, - up to 20</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.diffBtn, { backgroundColor: '#f39c12' }]}
              onPress={() => startGame(2)}
            >
              <Text style={styles.diffEmoji}>🤔</Text>
              <Text style={styles.diffBtnText}>Medium</Text>
              <Text style={styles.diffDesc}>+, -, ×, ÷</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.diffBtn, { backgroundColor: '#e74c3c' }]}
              onPress={() => startGame(3)}
            >
              <Text style={styles.diffEmoji}>🧠</Text>
              <Text style={styles.diffBtnText}>Hard</Text>
              <Text style={styles.diffDesc}>Big numbers!</Text>
            </TouchableOpacity>
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
    paddingHorizontal: wp(20),
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
    fontSize: fp(22),
    fontWeight: '800',
  },
  streakText: {
    color: '#f39c12',
  },
  questionCard: {
    backgroundColor: '#16213e',
    marginHorizontal: wp(20),
    padding: wp(40),
    borderRadius: mp(20),
    alignItems: 'center',
  },
  difficultyBadge: {
    position: 'absolute',
    top: hp(15),
    right: wp(15),
    color: '#666',
    fontSize: fp(12),
  },
  questionText: {
    color: '#fff',
    fontSize: fp(42),
    fontWeight: '800',
  },
  feedback: {
    marginHorizontal: wp(20),
    marginTop: hp(15),
    padding: wp(12),
    borderRadius: mp(10),
    alignItems: 'center',
  },
  correctFeedback: {
    backgroundColor: '#2ecc71',
  },
  wrongFeedback: {
    backgroundColor: '#e74c3c',
  },
  feedbackText: {
    color: '#fff',
    fontSize: fp(16),
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    marginHorizontal: wp(20),
    marginTop: hp(30),
    gap: wp(12),
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: mp(16),
    paddingHorizontal: wp(20),
    paddingVertical: hp(18),
    color: '#fff',
    fontSize: fp(24),
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#5035FF',
    width: wp(70),
    borderRadius: mp(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: fp(28),
    fontWeight: '700',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: wp(20),
    paddingTop: hp(20),
  },
  resultCard: {
    backgroundColor: '#16213e',
    padding: wp(30),
    borderRadius: mp(20),
    alignItems: 'center',
    marginBottom: hp(30),
  },
  resultEmoji: {
    fontSize: fp(50),
  },
  resultScore: {
    color: '#fff',
    fontSize: fp(28),
    fontWeight: '800',
    marginTop: hp(10),
  },
  resultDetails: {
    color: '#888',
    fontSize: fp(14),
    marginTop: hp(8),
  },
  chooseDifficulty: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hp(20),
  },
  difficultyButtons: {
    gap: hp(15),
  },
  diffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(20),
    borderRadius: mp(16),
  },
  diffEmoji: {
    fontSize: fp(32),
    marginRight: wp(15),
  },
  diffBtnText: {
    color: '#fff',
    fontSize: fp(20),
    fontWeight: '800',
    flex: 1,
  },
  diffDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fp(12),
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
