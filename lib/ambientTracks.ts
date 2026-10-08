/** Original Beopity instrumentals. Regenerate with scripts/generate-beopity-music.py. */
export interface AmbientTrack {
  id: string;
  title: string;
  artist: "Beopity";
  src: string;
  duration: number;
  accent: string;
}

export const AMBIENT_TRACKS = [
  {
    "id": "mosslight",
    "title": "Mosslight",
    "artist": "Beopity",
    "src": "/beopity/music/mosslight.mp3",
    "duration": 101.903,
    "accent": "#b3d6ba"
  },
  {
    "id": "rain-on-linen",
    "title": "Rain on Linen",
    "artist": "Beopity",
    "src": "/beopity/music/rain-on-linen.mp3",
    "duration": 109.31,
    "accent": "#b6c9dd"
  },
  {
    "id": "amber-window",
    "title": "Amber Window",
    "artist": "Beopity",
    "src": "/beopity/music/amber-window.mp3",
    "duration": 105.0,
    "accent": "#e7c39a"
  },
  {
    "id": "slow-orbit",
    "title": "Slow Orbit",
    "artist": "Beopity",
    "src": "/beopity/music/slow-orbit.mp3",
    "duration": 115.727,
    "accent": "#c4bcdf"
  },
  {
    "id": "lavender-haze",
    "title": "Lavender Haze",
    "artist": "Beopity",
    "src": "/beopity/music/lavender-haze.mp3",
    "duration": 97.615,
    "accent": "#cfc0de"
  },
  {
    "id": "paper-lanterns",
    "title": "Paper Lanterns",
    "artist": "Beopity",
    "src": "/beopity/music/paper-lanterns.mp3",
    "duration": 101.333,
    "accent": "#e3baac"
  },
  {
    "id": "soft-current",
    "title": "Soft Current",
    "artist": "Beopity",
    "src": "/beopity/music/soft-current.mp3",
    "duration": 97.421,
    "accent": "#a9cdd0"
  },
  {
    "id": "midnight-garden",
    "title": "Midnight Garden",
    "artist": "Beopity",
    "src": "/beopity/music/midnight-garden.mp3",
    "duration": 106.0,
    "accent": "#a8b9ce"
  },
  {
    "id": "peach-horizon",
    "title": "Peach Horizon",
    "artist": "Beopity",
    "src": "/beopity/music/peach-horizon.mp3",
    "duration": 99.811,
    "accent": "#e9c2b6"
  },
  {
    "id": "stillwater",
    "title": "Stillwater",
    "artist": "Beopity",
    "src": "/beopity/music/stillwater.mp3",
    "duration": 107.627,
    "accent": "#b9d3c5"
  }
] as const satisfies readonly AmbientTrack[];
