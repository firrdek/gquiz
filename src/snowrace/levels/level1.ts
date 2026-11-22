import type { LevelDef } from './types';

// Roughly 100 seconds when driven without crashing (440 -> 520 -> 600 units/s).
// Streams sit on the straight peaks of the curves so the bridge can be lined up in time.
const level1: LevelDef = {
  id: 'level1',
  name: 'Spruce Trail',
  seed: 1337,
  length: 51000,
  startSpeed: 440,
  path: [
    [-800, 0], [0, 0], [1500, 0], [2700, 300], [3900, -100], [5000, -350], [6200, -60],
    [7500, 280], [8800, -50], [10000, -300], [11300, 100], [12600, 380], [13700, 150],
    [15000, -250], [16300, -40], [17600, 240], [18800, -120], [20000, -380], [21200, -100],
    [22600, 300], [23900, 60], [25100, -260], [26300, 50], [27600, 350], [28800, 80],
    [30100, -300], [31300, -60], [32500, 260], [33800, -100], [35000, -340], [36300, -30],
    [37600, 290], [38800, 40], [40000, -280], [41400, 0], [42600, 330], [43800, 100],
    [45000, -250], [46300, -50], [47500, 250], [48800, 60], [50000, 0], [51000, 0], [53000, 0],
  ],
  streams: [
    { y: 4955, len: 90, bridgeOff: 0 },
    { y: 14955, len: 90, bridgeOff: 20 },
    { y: 25055, len: 90, bridgeOff: -20 },
    { y: 34955, len: 90, bridgeOff: 0 },
    { y: 44955, len: 90, bridgeOff: 15 },
  ],
  splits: [
    { y0: 7800, y1: 12400, sep: 200 },
    { y0: 27000, y1: 31600, sep: 220 },
  ],
  narrows: [
    { y0: 17000, y1: 19200, half: 72 },
    { y0: 41200, y1: 43600, half: 66 },
  ],
  animals: [
    { y: 2400, kind: 'fox', dir: 1, at: 20 },
    { y: 6500, kind: 'raccoon', dir: -1, at: -15 },
    { y: 13800, kind: 'fox', dir: -1, at: 10 },
    { y: 22400, kind: 'raccoon', dir: 1, at: -10 },
    { y: 37200, kind: 'fox', dir: 1, at: 15 },
    { y: 47600, kind: 'raccoon', dir: -1, at: -10 },
  ],
  speedUps: [
    { y: 17000, speed: 520 },
    { y: 34000, speed: 600 },
  ],
};

export default level1;
