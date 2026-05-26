import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fp, mp, wp } from '../utils/responsive';

const diceEmoji = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

export default function Die({ value, isHeld, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.die,
        {
          backgroundColor: isHeld ? '#5035FF' : '#fff',
          borderColor: isHeld ? '#3d28cc' : '#e0e0e0',
          transform: [{ scale: isHeld ? 1.05 : 1 }],
        },
      ]}
    >
      <Text style={[styles.text, { color: isHeld ? '#fff' : '#1a1a2e' }]}>
        {value}
      </Text>
      {isHeld && <View style={styles.heldIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  die: {
    width: wp(52),
    height: wp(52),
    borderRadius: mp(14),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
  },
  text: {
    fontSize: fp(24),
    fontWeight: '800',
  },
  heldIndicator: {
    position: 'absolute',
    top: wp(4),
    right: wp(4),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#2ecc71',
  },
});