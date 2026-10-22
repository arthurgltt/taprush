import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Phase = 'idle' | 'playing' | 'over';

const ROUND_SECONDS = 30;

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetSize = phase === 'playing' ? Math.max(52, 92 - score * 1.6) : 92;

  const moveTarget = (w = area.w, h = area.h) => {
    if (w <= 0 || h <= 0) return;
    const maxX = Math.max(0, w - targetSize);
    const maxY = Math.max(0, h - targetSize);
    setTarget({ x: Math.random() * maxX, y: Math.random() * maxY });
  };

  const stopTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const start = () => {
    stopTimer();
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setPhase('playing');
    moveTarget();
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    timer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setPhase('over');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return stopTimer;
  }, [phase]);

  useEffect(() => {
    if (phase === 'over' && score > best) setBest(score);
  }, [phase, score, best]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ w: width, h: height });
    if (phase !== 'playing') {
      setTarget({
        x: Math.max(0, (width - targetSize) / 2),
        y: Math.max(0, (height - targetSize) / 2),
      });
    }
  };

  const hit = () => {
    if (phase !== 'playing') return;
    setScore((s) => s + 1);
    moveTarget();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.hud}>
        <View style={styles.hudCell}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score}</Text>
        </View>
        <View style={styles.hudCell}>
          <Text style={styles.hudLabel}>TEMPS</Text>
          <Text style={[styles.hudValue, timeLeft <= 5 && styles.hudDanger]}>
            {timeLeft}s
          </Text>
        </View>
        <View style={styles.hudCell}>
          <Text style={styles.hudLabel}>RECORD</Text>
          <Text style={styles.hudValue}>{best}</Text>
        </View>
      </View>

      <View style={styles.arena} onLayout={onLayout}>
        {phase === 'playing' && (
          <Pressable
            onPress={hit}
            hitSlop={8}
            style={[
              styles.target,
              {
                width: targetSize,
                height: targetSize,
                borderRadius: targetSize / 2,
                left: target.x,
                top: target.y,
              },
            ]}
          >
            <View style={styles.targetInner} />
          </Pressable>
        )}

        {phase === 'idle' && (
          <View style={styles.center}>
            <Text style={styles.title}>TAP RUSH</Text>
            <Text style={styles.subtitle}>
              Touche la cible le plus de fois possible en {ROUND_SECONDS}{' '}
              secondes. Elle rétrécit à chaque point.
            </Text>
            <Pressable style={styles.button} onPress={start}>
              <Text style={styles.buttonText}>JOUER</Text>
            </Pressable>
          </View>
        )}

        {phase === 'over' && (
          <View style={styles.center}>
            <Text style={styles.title}>TERMINÉ</Text>
            <Text style={styles.finalScore}>{score}</Text>
            <Text style={styles.subtitle}>
              {score >= best && score > 0
                ? 'Nouveau record !'
                : `Record : ${best}`}
            </Text>
            <Pressable style={styles.button} onPress={start}>
              <Text style={styles.buttonText}>REJOUER</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const SAND = '#F3EAD9';
const TERRACOTTA = '#C8613F';
const DARK = '#1C1A17';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK,
    paddingTop: 64,
    paddingBottom: 24,
  },
  hud: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  hudCell: {
    flex: 1,
    alignItems: 'center',
  },
  hudLabel: {
    color: '#8A8378',
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 4,
  },
  hudValue: {
    color: SAND,
    fontSize: 26,
    fontWeight: '700',
  },
  hudDanger: {
    color: TERRACOTTA,
  },
  arena: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#26231F',
    overflow: 'hidden',
  },
  target: {
    position: 'absolute',
    backgroundColor: TERRACOTTA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetInner: {
    width: '55%',
    height: '55%',
    borderRadius: 999,
    backgroundColor: '#F2B78F',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: SAND,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 12,
  },
  finalScore: {
    color: TERRACOTTA,
    fontSize: 72,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A9A196',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: TERRACOTTA,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
  },
  buttonText: {
    color: '#FFF6EC',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
