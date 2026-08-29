import { useEffect, useLayoutEffect, useState, useRef } from "preact/hooks";
import { AnimatePresence, motion } from "framer-motion";
import useCalledNumbersStore from "../../../../../store/useCalledNumberStore";
import { getBingoLetter } from "../../../../utils/bingoStats";
import BingoBall from "./BingoBall";
import TubeBall from "./tubeBall";

const MAX_BALLS = 15;
const OVERLAP = 0.1;

function ballLetter(ball) {
  return ball?.letter || getBingoLetter(ball?.number) || "B";
}

function countFullBalls(el) {
  if (!el) return 0;
  const styles = getComputedStyle(el);
  const height =
    el.clientHeight -
    parseFloat(styles.paddingTop) -
    parseFloat(styles.paddingBottom);
  const width =
    el.clientWidth -
    parseFloat(styles.paddingLeft) -
    parseFloat(styles.paddingRight);
  if (width < 8 || height < 8) return 0;
  const stride = width * (1 - OVERLAP);
  if (stride <= 0) return 0;
  if (height < width - 1) return 0;
  return Math.floor((height - width) / stride) + 1;
}

export default function WrapperStructureBall({ gameId, roundKey }) {
  const { prepareForGame, calledNumbers } = useCalledNumbersStore();
  const lastSeenRef = useRef(null);
  const stackRef = useRef(null);
  const [animateEnter, setAnimateEnter] = useState(false);
  const [stemFit, setStemFit] = useState(0);

  useEffect(() => {
    if (!gameId) return;
    prepareForGame(gameId);
  }, [gameId]);

  useEffect(() => {
    lastSeenRef.current = null;
    setAnimateEnter(false);
  }, [gameId, roundKey]);

  useEffect(() => {
    const last = calledNumbers[calledNumbers.length - 1];
    const num = last?.number ?? null;
    if (num != null && num !== lastSeenRef.current) {
      setAnimateEnter(lastSeenRef.current != null || calledNumbers.length === 1);
    } else if (calledNumbers.length === 0) {
      setAnimateEnter(false);
    }
    lastSeenRef.current = num;
  }, [calledNumbers]);

  useLayoutEffect(() => {
    const el = stackRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const measure = () => {
      setStemFit(countFullBalls(el));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [roundKey]);

  const balls = calledNumbers.slice(-MAX_BALLS).reverse();
  const latest = balls[0] || null;
  const stack = balls.slice(1, 1 + Math.max(0, stemFit));

  return (
    <div className="ball-hopper" aria-label="Bolas cantadas">
      <div className="ball-hopper__bulb">
        <TubeBall tone="bulb" />
        <div className="ball-hopper__current">
          <AnimatePresence>
            {latest ? (
              <motion.div
                key={latest.number}
                initial={
                  animateEnter
                    ? { y: -36, opacity: 0, scale: 0.7, rotate: -18 }
                    : false
                }
                animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 240, damping: 16 }}
              >
                <BingoBall
                  letter={ballLetter(latest)}
                  number={latest.number}
                  size="fill"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="ball-hopper__stem">
        <TubeBall tone="stem" />
        <div className="ball-hopper__stack" ref={stackRef}>
          <AnimatePresence initial={false}>
            {stack.map((ball, index) => (
              <motion.div
                key={ball.number}
                className="ball-hopper__item"
                style={{ zIndex: stack.length - index }}
                initial={
                  animateEnter ? { opacity: 0, y: -16 } : false
                }
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32, scale: 0.75 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              >
                <BingoBall
                  letter={ballLetter(ball)}
                  number={ball.number}
                  size="fill"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
