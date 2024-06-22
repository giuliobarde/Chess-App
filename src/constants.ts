import { TeamType, PieceType } from "./Types";
import { Position, Piece } from "./models";
import { Board } from "./models/Board";

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export const GRID_SIZE = 100

const initialPositions = [
    { type: PieceType.ROOK, positions: [{ x: 0, y: 0 }, { x: 7, y: 0 }] },
    { type: PieceType.KNIGHT, positions: [{ x: 1, y: 0 }, { x: 6, y: 0 }] },
    { type: PieceType.BISHOP, positions: [{ x: 2, y: 0 }, { x: 5, y: 0 }] },
    { type: PieceType.QUEEN, positions: [{ x: 3, y: 0 }] },
    { type: PieceType.KING, positions: [{ x: 4, y: 0 }] }
];

const initialBoardState: Piece[] = [];

for (let p = 0; p < 2; p++) {
    const teamType = p === 0 ? TeamType.BLACK : TeamType.WHITE;
    const y = p === 0 ? 7 : 0;
    const pawnY = p === 0 ? 6 : 1;

    // Place major pieces
    initialPositions.forEach(({ type, positions }) => {
        positions.forEach(({ x, y: posY }) => {
            initialBoardState.push(new Piece(new Position(x, y), type, teamType, false));
        });
    });

    // Place pawns
    for (let i = 0; i < 8; i++) {
        initialBoardState.push(new Piece(new Position(i, pawnY), PieceType.PAWN, teamType, false));
    }
}

export const initialBoard: Board = new Board(initialBoardState, 1);

initialBoard.calculateAllMoves();