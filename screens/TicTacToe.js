import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BannerAdComponent from '../components/Banner_Ad';
import { useInterstitialAd } from '../components/Interstitial_Ad';
import { fp, hp, mp, wp } from '../utils/responsive';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

export default function TicTacToe({ navigation }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
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

  const checkWinner = (newBoard) => {
    for (let combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return newBoard[a];
      }
    }
    if (newBoard.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
  };

  const handlePress = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXTurn ? 'X' : 'O';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGamesPlayed(g => g + 1);
      if (gameWinner === 'X') {
        setXWins(w => w + 1);
        playWinSound();
      } else if (gameWinner === 'O') {
        setOWins(w => w + 1);
        playWinSound();
      } else {
        setDraws(d => d + 1);
      }
      // Show ad every 3 games
      if ((gamesPlayed + 1) % 3 === 0) {
        showAd();
      }
    } else {
      setIsXTurn(!isXTurn);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXTurn(true);
    setWinner(null);
  };

  const resetAll = () => {
    resetGame();
    setXWins(0);
    setOWins(0);
    setDraws(0);
  };

  const renderCell = (index) => {
    const value = board[index];
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          index % 3 !== 2 && styles.cellBorderRight,
          index < 6 && styles.cellBorderBottom,
        ]}
        onPress={() => handlePress(index)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.cellText,
          value === 'X' ? styles.xText : styles.oText
        ]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>❌ Tic Tac Toe ⭕</Text>
      </View>

      {/* Score */}
      <View style={styles.scoreBoard}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, styles.xText]}>X Wins</Text>
          <Text style={styles.scoreValue}>{xWins}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Draws</Text>
          <Text style={styles.scoreValue}>{draws}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreLabel, styles.oText]}>O Wins</Text>
          <Text style={styles.scoreValue}>{oWins}</Text>
        </View>
      </View>

      {/* Turn indicator */}
      <View style={styles.turnContainer}>
        <Text style={styles.turnText}>
          {winner
            ? winner === 'draw'
              ? "🤝 It's a Draw!"
              : `🎉 ${winner} Wins!`
            : `${isXTurn ? 'X' : 'O'}'s Turn`}
        </Text>
      </View>

      {/* Board */}
      <View style={styles.board}>
        <View style={styles.row}>{[0, 1, 2].map(renderCell)}</View>
        <View style={styles.row}>{[3, 4, 5].map(renderCell)}</View>
        <View style={styles.row}>{[6, 7, 8].map(renderCell)}</View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.playAgainBtn} onPress={resetGame}>
          <Text style={styles.btnText}>🔄 New Round</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
          <Text style={styles.resetBtnText}>Reset All</Text>
        </TouchableOpacity>
      </View>

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
  scoreBoard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp(20),
    marginVertical: hp(20),
  },
  scoreItem: {
    backgroundColor: '#16213e',
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
    borderRadius: mp(12),
    alignItems: 'center',
    minWidth: wp(80),
  },
  scoreLabel: {
    color: '#a0a0a0',
    fontSize: fp(12),
    fontWeight: '600',
  },
  scoreValue: {
    color: '#fff',
    fontSize: fp(24),
    fontWeight: '800',
  },
  xText: {
    color: '#e74c3c',
  },
  oText: {
    color: '#3498db',
  },
  turnContainer: {
    alignItems: 'center',
    marginBottom: hp(20),
  },
  turnText: {
    fontSize: fp(22),
    fontWeight: '700',
    color: '#fff',
  },
  board: {
    alignSelf: 'center',
    backgroundColor: '#16213e',
    borderRadius: mp(16),
    padding: wp(10),
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: wp(90),
    height: wp(90),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellBorderRight: {
    borderRightWidth: 3,
    borderRightColor: '#2a3a5e',
  },
  cellBorderBottom: {
    borderBottomWidth: 3,
    borderBottomColor: '#2a3a5e',
  },
  cellText: {
    fontSize: fp(48),
    fontWeight: '900',
  },
  buttons: {
    alignItems: 'center',
    marginTop: hp(30),
    gap: hp(12),
  },
  playAgainBtn: {
    backgroundColor: '#5035FF',
    paddingVertical: hp(14),
    paddingHorizontal: wp(40),
    borderRadius: mp(12),
  },
  btnText: {
    color: '#fff',
    fontSize: fp(18),
    fontWeight: '700',
  },
  resetBtn: {
    paddingVertical: hp(10),
  },
  resetBtnText: {
    color: '#666',
    fontSize: fp(14),
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
