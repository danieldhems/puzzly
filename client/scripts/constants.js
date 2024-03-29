export const PuzzleSizes = [
  { numPieces: 9, piecesPerSide: 3 },
  { numPieces: 16, piecesPerSide: 4 },
  { numPieces: 25, piecesPerSide: 5 },
  { numPieces: 36, piecesPerSide: 6 },
  { numPieces: 49, piecesPerSide: 7 },
  { numPieces: 64, piecesPerSide: 8 },
  { numPieces: 81, piecesPerSide: 9 },
  { numPieces: 100, piecesPerSide: 10 },
  { numPieces: 121, piecesPerSide: 11 },
  { numPieces: 144, piecesPerSide: 12 },
  { numPieces: 169, piecesPerSide: 13 },
  { numPieces: 196, piecesPerSide: 14 },
  { numPieces: 256, piecesPerSide: 16 },
  { numPieces: 324, piecesPerSide: 18 },
  { numPieces: 484, piecesPerSide: 22 },
  { numPieces: 576, piecesPerSide: 24 },
  { numPieces: 676, piecesPerSide: 26 },
];

export const LOCAL_STORAGE_PUZZLY_PROGRESS_KEY =
  "LOCAL_STORAGE_PUZZLY_PROGRESS_KEY";
export const LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY =
  "LOCAL_STORAGE_PUZZLY_LAST_SAVE_KEY";

export const PUZZLE_PIECE_CLASSES = ["puzzle-piece", "puzzle-piece-fg"];

export const PIECE_SIZE = 100;

export const ZOOM_INTERVALS = [1, 1.5, 2.5];

export const ELEMENT_IDS = {
  SOLVED_PUZZLE_AREA: "solved-puzzle-area",
  SOLVED_CONTAINER: "group-container-1111",
  SOLVED_CANVAS: "group-canvas-1111",
  PLAY_BOUNDARY: "play-boundary",
  STAGE: "stage",
  PIECES_CONTAINER: "pieces-container",
  BRIDGE: "bridge",
  POCKETS: "pockets",
  DRAGANDSELECT_CONTAINER: "selected-pieces-container",
  POCKET_DRAG_CONTAINER: "active-pieces-container",
};

export const SOLVING_AREA_SIZE_PERCENTAGE = 15;

export const EVENT_TYPES = {
  PIECE_PICKUP: "PIECE_PICKUP",
  PIECE_DROP: "PIECE_DROP",
  CHANGE_SCALE: "CHANGE_SCALE",
  PUZZLE_LOADED: "PUZZLE_LOADED",
  RESIZE: "RESIZE",
  CLEAR_BRIDGE: "CLEAR_BRIDGE",
  DRAGANDSELECT_ACTIVE: "DRAGANDSELECT_ACTIVE",
  DRAGANDSELECT_PIECES_SELECTED: "DRAGANDSELECT_PIECES_SELECTED",
  ADD_TO_POCKET: "ADD_TO_POCKET",
  POCKET_PICKUP: "POCKET_PICKUP",
  POCKET_PUTDOWN: "POCKET_PUTDOWN",
  RETURN_TO_CANVAS: "RETURN_TO_CANVAS",
  MOVE_FINISHED: "MOVE_FINISHED",
  CONNECTION_MADE: "CONNECTION_MADE",
  SAVE: "SAVE",
  SAVE_IN_PROGRESS: "SAVE_IN_PROGRESS",
  SAVE_SUCCESSFUL: "SAVE_SUCCESSFUL",
  NEW_GROUP: "NEW_GROUP",
  GROUP_CREATED: "GROUP_CREATED",
};

export const SIDES = {
  TOP: "TOP",
  RIGHT: "RIGHT",
  BOTTOM: "BOTTOM",
  LEFT: "LEFT",
};

export const SHADOW_OFFSET_RATIO = 0.01;

export const SHAPE_TYPES = {
  PLAIN: 1,
  NATURAL: 2,
};
