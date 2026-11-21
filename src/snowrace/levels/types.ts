// A stream crossing the whole forest; the player must use the bridge to cross it.
export interface StreamDef {
  y: number; // where the stream starts along the trail
  len: number; // stream width along the trail
  bridgeOff: number; // bridge offset from the trail center line
}

export interface RockDef {
  y: number;
  off: number; // offset from the center of its lane
  s: number; // size
  lane?: -1 | 0 | 1; // inside a split: -1 left trail, 1 right trail (default 0 = main)
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
  rocks: RockDef[];
  speedUps: SpeedUpDef[];
  splits: SplitDef[];
  narrows: NarrowDef[];
}
