// Dimensions of the board (3x3 squares), game outcomes and players,
// and dimensions for the board squares, in pixels.

// Tic Tac Toe
export const DIMENSIONS = 3;
export const SQUARE_DIMS = 100;
export const DRAW = 0;
export const PLAYER_X = 1;
export const PLAYER_O = 2;
export const GAME_STATES = {
  notStarted: "not_started",
  inProgress: "in_progress",
  over: "over",
};
export const SCORES: Record<string, number> = {
  1: 1,
  0: 0,
  2: -1,
};
export const GAME_MODES: Record<string, string> = {
  easy: "easy",
  medium: "medium",
  difficult: "difficult",
};

// Photo Gallery
export const PHOTO_STORAGE = 'photos';
