import { TeamType } from "../../Types";
import { Position, Piece } from "../../models";
import { tileIsEmptyOrOccupiedByOpponent } from "./GeneralRules";

export const knightMove = (
    initialPosition: Position, 
    desiredPosition: Position, 
    team: TeamType, 
    boardState: Piece[]
): boolean => {
    if (
        (Math.abs(initialPosition.x - desiredPosition.x) === 2 
        && Math.abs(initialPosition.y - desiredPosition.y) === 1) 
        || (Math.abs(initialPosition.x - desiredPosition.x) === 1 
        && Math.abs(initialPosition.y - desiredPosition.y) === 2)) {
        if (tileIsEmptyOrOccupiedByOpponent(desiredPosition, boardState, team)){
            return true;
        }
    }
    return false;
}

export const getPossibleKnightMoves = (
    knight: Piece, 
    boardState: Piece[]
): Position[] => {
    const possibleMoves: Position[] = [];

    for (let i = -1; i < 2; i += 2) {
        for (let j = -1; j < 2; j += 2) {
            if (knight.position.x - i < 0 || knight.position.x + i > 7) break;
            if (knight.position.y - i < 0 || knight.position.y + i > 7) break;

            const verticalMove = new Position(knight.position.x + i, knight.position.y + j*2);
            const horizontalMove = new Position(knight.position.x + i*2, knight.position.y + j);
            if (tileIsEmptyOrOccupiedByOpponent(verticalMove, boardState, knight.team)){
                possibleMoves.push(verticalMove);
            }
            if (tileIsEmptyOrOccupiedByOpponent(horizontalMove, boardState, knight.team)){
                possibleMoves.push(horizontalMove);
            }
        }
    }

    return possibleMoves;
}