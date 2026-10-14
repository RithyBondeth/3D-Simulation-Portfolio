import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";

type Motion = { elapsed: MutableRefObject<number>; active: boolean };
const MotionContext = createContext<Motion | null>(null);

/** Ambient motion shares a clock and a 30fps budget. Driving can request extra frames. */
export function SceneMotion({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const { gl, invalidate } = useThree();
  const elapsed = useRef(0);
  const visible = useRef(true);
  const motion = useMemo(() => ({ elapsed, active }), [active]);
  useEffect(() => {
    let timer: number | undefined;
    const stop = () => {
      window.clearInterval(timer);
      timer = undefined;
    };
    const sync = () => {
      stop();
      if (!active || document.hidden || !visible.current) return;
      invalidate();
      timer = window.setInterval(invalidate, 1000 / 30);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      sync();
    });
    observer.observe(gl.domElement);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, gl, invalidate]);
  useFrame((_, dt) => {
    if (active && visible.current && !document.hidden)
      elapsed.current += Math.min(dt, 0.06);
  }, -0.8);
  return (
    <MotionContext.Provider value={motion}>{children}</MotionContext.Provider>
  );
}

export function useSceneMotion(animate: (elapsed: number) => void) {
  const motion = useContext(MotionContext);
  useFrame(() => {
    if (motion?.active) animate(motion.elapsed.current);
  });
}
