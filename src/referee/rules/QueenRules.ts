import { TeamType } from "../../Types";
import { Position, Piece } from "../../models";
import { tileIsEmptyOrOccupiedByOpponent, tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const queenMove = (
    initialPosition: Position, 
    desiredPosition: Position, 
    team: TeamType, 
    boardState: Piece[]
): boolean => {
    for(let i = 1; i < 8; i++) {
        let multiplierX = (desiredPosition.x > initialPosition.x) ? 1 : (desiredPosition.x < initialPosition.x) ? -1 : 0;
        let multiplierY = (desiredPosition.y > initialPosition.y) ? 1 : (desiredPosition.y < initialPosition.y) ? -1 : 0;

        let passedPosition: Position = new Position(initialPosition.x + (i * multiplierX), initialPosition.y + (i * multiplierY));
        
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

export const getPossibleQueenMoves = (
    queen: Piece, 
    boardState: Piece[]
): Position[] => {
    const possibleMoves: Position[] = [];

    // Helper function to explore one diagonal direction
    const exploreDirection = (dx: number, dy: number) => {
        for (let i = 1; i < 8; i++) {
            const destination = new Position(queen.position.x + dx * i, queen.position.y + dy * i);
            
            if (destination.x < 0 || destination.y < 0 || destination.x > 7 || destination.y > 7) break;

            if (!tileIsOccupied(destination, boardState)) {
                possibleMoves.push(destination);
            } else if (tileIsOccupiedByOpponent(destination, boardState, queen.team)) {
                possibleMoves.push(destination);
                break;
            } else {
                break;
            }
        }
    };

    // Explore all four diagonal directions
    exploreDirection(0, 1);  // top
    exploreDirection(1, -1);  // top-right
    exploreDirection(1, 0);   // right
    exploreDirection(1, 1);   // bottom-right
    exploreDirection(0, -1); // bottom
    exploreDirection(-1, 1);  // bottom-left
    exploreDirection(-1, 0);  // left
    exploreDirection(-1, -1); // top-left

    return possibleMoves;
};