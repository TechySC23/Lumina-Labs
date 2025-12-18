import { LensType, Scenario } from './types';

export const FOCAL_LENGTH = 100;
export const MAX_OBJECT_POS = -10;
export const MIN_OBJECT_POS = -450;
export const CENTER_X = 400;
export const CENTER_Y = 250;

export const SCENARIOS: Record<LensType, Scenario[]> = {
  [LensType.CONVEX]: [
    { 
      pos: "At Infinity", img: "At F2", nature: "Real, Inverted", size: "Point size",
      condition: (u, f) => Math.abs(u) > 400 
    },
    { 
      pos: "Beyond 2F1", img: "Between F2 & 2F2", nature: "Real, Inverted", size: "Diminished",
      condition: (u, f) => Math.abs(u) > 2 * f && Math.abs(u) <= 400 
    },
    { 
      pos: "At 2F1", img: "At 2F2", nature: "Real, Inverted", size: "Same size",
      condition: (u, f) => Math.abs(Math.abs(u) - 2 * f) < 5 
    },
    { 
      pos: "Between F1 & 2F1", img: "Beyond 2F2", nature: "Real, Inverted", size: "Enlarged",
      condition: (u, f) => Math.abs(u) > f && Math.abs(u) < 2 * f 
    },
    { 
      pos: "At F1", img: "Infinity", nature: "Real, Inverted", size: "Highly Enlarged",
      condition: (u, f) => Math.abs(Math.abs(u) - f) < 5 
    },
    { 
      pos: "Between F1 & O", img: "Same side (Virtual)", nature: "Virtual, Erect", size: "Magnified",
      condition: (u, f) => Math.abs(u) < f 
    },
  ],
  [LensType.CONCAVE]: [
    { 
      pos: "At Infinity", img: "At F1", nature: "Virtual, Erect", size: "Point size",
      condition: (u, f) => Math.abs(u) > 400 
    },
    { 
      pos: "Finite Distance", img: "Between O & F1", nature: "Virtual, Erect", size: "Diminished",
      condition: (u, f) => Math.abs(u) <= 400 
    }
  ]
};

export const CORE_RULES = [
  {
    title: "Parallel Ray Rule",
    desc: "A ray parallel to the principal axis passes through the focus (convex) or appears to diverge from the focus (concave).",
    colorClass: "bg-emerald-500"
  },
  {
    title: "Optical Center Rule",
    desc: "A ray passing through the optical center (O) goes straight without deviating.",
    colorClass: "bg-amber-500"
  },
  {
    title: "Focal Ray Rule",
    desc: "A ray passing through the focus (or directed towards it) becomes parallel to the principal axis after refraction.",
    colorClass: "bg-blue-500"
  }
];

export const GLOSSARY_TERMS = [
  "Refraction", 
  "Focal Length", 
  "Principal Axis", 
  "Optical Center", 
  "Real Image", 
  "Virtual Image", 
  "Inverted Image",
  "Erect Image",
  "Magnification", 
  "Convex Lens",
  "Concave Lens",
  "Power of Lens"
];