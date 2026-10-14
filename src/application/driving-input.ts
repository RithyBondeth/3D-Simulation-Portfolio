export type MovementInput = {
  x: number;
  z: number;
  brake?: boolean;
  invalidate?: () => void;
};
