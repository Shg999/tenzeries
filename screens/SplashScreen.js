import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { fp, hp, mp, screen, wp } from '../utils/responsive';

const GAME_EMOJIS = ['🎲', '🧠', '🔢', '⚡', '❌', '🎨', '🧮', '🔨'];

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const letterAnims = useRef(GAME_EMOJIS.map(() => new Animated.Value(0))).current;
  const bgCircle1 = useRef(new Animated.Value(0)).current;
  const bgCircle2 = useRef(new Animated.Value(0)).current;
  const bgCircle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background circles expand
    Animated.stagger(200, [
      Animated.timing(bgCircle1, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bgCircle2, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bgCircle3, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Title slide up
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 600,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Emoji icons stagger animation
    Animated.stagger(80, 
      letterAnims.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        })
      )
    ).start();

    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Background Circles */}
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle1,
          {
            opacity: bgCircle1,
            transform: [{ scale: bgCircle1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle2,
          {
            opacity: bgCircle2,
            transform: [{ scale: bgCircle2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }) }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.bgCircle,
          styles.bgCircle3,
          {
            opacity: bgCircle3,
            transform: [{ scale: bgCircle3.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }) }],
          },
        ]}
      />

      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        <Animated.View style={[styles.logoInner, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.logoEmoji}>🎮</Text>
        </Animated.View>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Gamify</Text>
        <View style={styles.titleUnderline} />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: fadeAnim },
        ]}
      >
        Play • Compete • Win
      </Animated.Text>

      {/* Floating Game Icons */}
      <View style={styles.iconsContainer}>
        {GAME_EMOJIS.map((emoji, index) => {
          const angle = (index / GAME_EMOJIS.length) * 2 * Math.PI;
          const radius = wp(130);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.floatingIcon,
                {
                  left: screen.width / 2 + x - wp(25),
                  top: screen.height / 2 + y - hp(80),
                  opacity: letterAnims[index],
                  transform: [
                    {
                      scale: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      translateY: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.iconEmoji}>{emoji}</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <Animated.View 
            style={[
              styles.loadingProgress,
              {
                transform: [{
                  scaleX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                }],
              },
            ]} 
          />
        </View>
        <Text style={styles.loadingText}>Loading games...</Text>
      </View>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a12',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: wp(500),
  },
  bgCircle1: {
    width: wp(500),
    height: wp(500),
    backgroundColor: '#5035FF',
    opacity: 0.08,
    top: hp(-150),
    right: wp(-150),
  },
  bgCircle2: {
    width: wp(400),
    height: wp(400),
    backgroundColor: '#e74c3c',
    opacity: 0.06,
    bottom: hp(-100),
    left: wp(-100),
  },
  bgCircle3: {
    width: wp(300),
    height: wp(300),
    backgroundColor: '#2ecc71',
    opacity: 0.05,
    top: screen.height / 2 - hp(150),
    left: wp(-100),
  },
  logoContainer: {
    width: wp(140),
    height: wp(140),
    borderRadius: wp(70),
    backgroundColor: '#5035FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#5035FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    marginBottom: hp(30),
  },
  logoInner: {
    width: wp(120),
    height: wp(120),
    borderRadius: wp(60),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: fp(60),
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: hp(10),
  },
  title: {
    fontSize: fp(52),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: wp(80),
    height: hp(4),
    backgroundColor: '#5035FF',
    borderRadius: mp(2),
    marginTop: hp(8),
  },
  tagline: {
    fontSize: fp(16),
    color: '#888',
    letterSpacing: 6,
    fontWeight: '500',
    marginTop: hp(10),
  },
  iconsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingIcon: {
    position: 'absolute',
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    backgroundColor: 'rgba(80, 53, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: fp(24),
  },
  loadingContainer: {
    position: 'absolute',
    bottom: hp(100),
    alignItems: 'center',
  },
  loadingBar: {
    width: wp(200),
    height: hp(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: mp(2),
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: '#5035FF',
    borderRadius: mp(2),
  },
  loadingText: {
    color: '#555',
    fontSize: fp(12),
    marginTop: hp(10),
    letterSpacing: 1,
  },
  version: {
    position: 'absolute',
    bottom: hp(40),
    color: '#333',
    fontSize: fp(12),
  },
});
