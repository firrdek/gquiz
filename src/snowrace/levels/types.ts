// A stream crossing the whole forest; the player must use the bridge to cross it.
export interface StreamDef {
  y: number; // where the stream starts along the trail
  len: number; // stream width along the trail
  bridgeOff: number; // bridge offset from the trail center line
}

// A fox or raccoon that runs across the trail; the player has to steer clear of it.
export interface AnimalDef {
  y: number;
  kind: 'fox' | 'raccoon';
  dir: 1 | -1; // -1 runs from right to left, 1 from left to right
  at: number; // x offset from the trail center where the animal is when the sled arrives
}

export interface SpeedUpDef {
  y: number;
  speed: number; // new target speed from this point on
}

// The trail splits in two parallel trails between y0 and y1, then rejoins.
export interface SplitDef {
  y0: number;
  y1: number;
  sep: number; // distance of each trail from the main center line
}

// The trail narrows to a half-width of `half` between y0 and y1.
export interface NarrowDef {
  y0: number;
  y1: number;
  half: number;
}

// A complete hand-made track. Add a new file in ./levels and register it in ./index.ts.
export interface LevelDef {
  id: string;
  name: string;
  seed: number; // seeds the (deterministic) forest decoration
  length: number; // y of the goal; the clearing with fire and dog lies just beyond it
  startSpeed: number;
  path: Array<[number, number]>; // [y, center x] control points of the winding trail
  streams: StreamDef[];
  animals: AnimalDef[];
  speedUps: SpeedUpDef[];
  splits: SplitDef[];
  narrows: NarrowDef[];
}
