import type { ExhaustScrollPose } from '@/components/home/valvetronic-exhaust-motion';

/** One down-and-away path, followed by a small rigid-body settle at contact. */
export function valvetronicIntroPose(progress: number, compact = false): ExhaustScrollPose {
  const p = Math.max(0, Math.min(1, progress));
  const fall = Math.min(1, p / .8);
  const travel = fall * fall;
  const contact = Math.max(0, (p - .8) / .2);
  const settle = Math.sin(contact * Math.PI) * Math.exp(-contact * 3) * .025;
  const startHeight = compact ? 1.65 : 1.2;
  const height = startHeight * (1 - travel) + settle;
  return {
    azimuth: 0,
    elevation: .65,
    roll: 0,
    bodyPitch: 0,
    radius: 9.4,
    zoom: 9.4 / (5.2 + 4.2 * travel),
    framingY: (compact ? .6 : .38) * height / startHeight,
    target: [0, -.2, -.4 + height],
    lift: 0,
    modelOffset: [0, 0, height],
    visible: true,
    exposure: .84,
    environment: .78,
    key: 1.5,
    rim: 1.05,
    lightX: -2,
    lightZ: 8,
    reflectionYaw: -.2,
    reflectionRoll: .04,
    typeOpacity: 0,
    detailOpacity: 0,
    hintOpacity: 0,
    floatAmount: 0,
  };
}
