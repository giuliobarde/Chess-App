import { TeamType } from "../../Types";
import { Position, Piece } from "../../models";
import { tileIsOccupied, tileIsEmptyOrOccupiedByOpponent, tileIsOccupiedByOpponent } from "./GeneralRules";

export const bishopMove = (
    initialPosition: Position, 
    desiredPosition: Position, 
    team: TeamType, 
    boardState: Piece[]
): boolean => {
    if (Math.abs(initialPosition.x - desiredPosition.x) === Math.abs(initialPosition.y - desiredPosition.y)) {
        const horizontalDirection = desiredPosition.x > initialPosition.x ? 1 : -1; // Right or Left
        const verticalDirection = desiredPosition.y > initialPosition.y ? 1 : -1; // Up or Down

        for (let i = 1; i < Math.abs(desiredPosition.x - initialPosition.x); i++) {
            const x = initialPosition.x + i * horizontalDirection;
            const y = initialPosition.y + i * verticalDirection;
            if (tileIsOccupied(new Position(x, y), boardState)) {
                return false;
            }
        }
        if (tileIsEmptyOrOccupiedByOpponent(desiredPosition, boardState, team)) {
            return true;
        }
    }
    return false;
}

export const getPossibleBishopMoves = (
    bishop: Piece, 
    boardState: Piece[]
): Position[] => {
    const possibleMoves: Position[] = [];

    // Helper function to explore one diagonal direction
    const exploreDirection = (dx: number, dy: number) => {
        for (let i = 1; i < 8; i++) {
            const destination = new Position(bishop.position.x + dx * i, bishop.position.y + dy * i);
            
            if (destination.x < 0 || destination.y < 0 || destination.x > 7 || destination.y > 7) return;

            if (!tileIsOccupied(destination, boardState)) {
                possibleMoves.push(destination);
            } else if (tileIsOccupiedByOpponent(destination, boardState, bishop.team)) {
                possibleMoves.push(destination);
                break;
            } else {
                break;
            }
        }
    };

    // Explore all four diagonal directions
    exploreDirection(1, 1);   // bottom-right
    exploreDirection(1, -1);  // top-right
    exploreDirection(-1, 1);  // bottom-left
    exploreDirection(-1, -1); // top-left

    return possibleMoves;
};