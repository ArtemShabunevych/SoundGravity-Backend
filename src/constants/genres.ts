export const GENRES = [
  "rock", "pop", "jazz", "electronic", "hiphop",
  "classical", "rnb", "folk", "metal", "blues", "reggae", "country", "other"
] as const;

export type Genre = typeof GENRES[number];
