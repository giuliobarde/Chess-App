import { TeamType } from "../../Types";
import { Position, Piece } from "../../models";
import { tileIsEmptyOrOccupiedByOpponent, tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const rookMove = (
    initialPosition: Position, 
    desiredPosition: Position, 
    team: TeamType, 
    boardState: Piece[]
): boolean => {
    for(let i = 1; i < 8; i++) {
        let multiplierX = (desiredPosition.x > initialPosition.x) ? 1 : (desiredPosition.x < initialPosition.x) ? -1 : 0;
        let multiplierY = (multiplierX === 0 && desiredPosition.y > initialPosition.y) ? 1 : (desiredPosition.y < initialPosition.y) ? -1 : 0;

        let passedPosition = new Position(initialPosition.x + (i * multiplierX), initialPosition.y + (i * multiplierY));
        
        if (passedPosition.samePosition(desiredPosition)) {
            if (tileIsEmptyOrOccupiedByOpponent(passedPosition,boardState,team)) {
                return true;
            }
        } else {
            if (tileIsOccupied(passedPosition, boardState)) {
                break;
            }
        }
    }
    return false;
}

export const getPossibleRookMoves = (
    rook: Piece, 
    boardState: Piece[]
): Position[] => {
    const possibleMoves: Position[] = [];

    // Helper function to explore one diagonal direction
    const exploreDirection = (dx: number, dy: number) => {
        for (let i = 1; i < 8; i++) {
            if (rook.position.x - i < 0 || rook.position.x + i > 7) break;
            if (rook.position.y - i < 0 || rook.position.y + i > 7) break;
            const destination = new Position(rook.position.x + dx * i, rook.position.y + dy * i);

            if (!tileIsOccupied(destination, boardState)) {
                possibleMoves.push(destination);
            } else if (tileIsOccupiedByOpponent(destination, boardState, rook.team)) {
                possibleMoves.push(destination);
                break;
            } else {
                break;
            }
        }
    };

    // Explore all four diagonal directions
    exploreDirection(1, 0);   // right
    exploreDirection(-1, 0);  // left
    exploreDirection(0, 1);  // top
    exploreDirection(0, -1); // bottom

    return possibleMoves;
};