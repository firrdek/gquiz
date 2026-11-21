export interface StreamDef {
  y: number; // where the stream starts along the trail
  len: number; // stream width along the trail
  bridgeOff: number; // bridge offset from the trail center line
}

export interface RockDef {
  y: number;
  off: number; // offset from the trail center line
  s: number; // size
}

export interface SpeedUpDef {
  y: number;
  speed: number; // new target speed from this point on
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
}
