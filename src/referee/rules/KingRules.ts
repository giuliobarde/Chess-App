import { TeamType } from "../../Types";
import { Position, Piece } from "../../models";
import { tileIsEmptyOrOccupiedByOpponent, tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const kingMove = (
    initialPosition: Position, 
    desiredPosition: Position, 
    team: TeamType, 
    boardState: Piece[]
): boolean => {
    if (
        Math.abs(initialPosition.x - desiredPosition.x) <= 1 
        && Math.abs(initialPosition.y - desiredPosition.y) <= 1
    ) {
        if (tileIsOccupied(desiredPosition, boardState)) {
            if (!(tileIsOccupiedByOpponent(desiredPosition, boardState, team))){    
                return false;
            }
        }
        return true;
    }
    return false;
}

export const getPossibleKingMoves = (
    king: Piece, 
    boardState: Piece[]
): Position[] => {
    const possibleMoves: Position[] = [];

    // Helper function to explore one diagonal direction
    const exploreDirection = (x: number, y: number) => {
        const destination = new Position(king.position.x + x, king.position.y + y);

        if (destination.x < 0 || destination.y < 0 || destination.x > 7 || destination.y > 7) return;

        if (tileIsEmptyOrOccupiedByOpponent(destination, boardState, king.team)) {
            possibleMoves.push(destination);
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

export const getCastlingMoves = (
    king: Piece, 
    boardState: Piece[]
): Position[] => {
    const possibleMoves: Position[] = [];

    if(king.hasMoved) return possibleMoves;

    const rooks = boardState.filter(p => p.isRook && p.team === king.team && !p.hasMoved);

    for (const rook of rooks) {
        const direction = (rook.position.x - king.position.x > 0)? 1 : -1;

       // Check all squares between the king and the rook
       let pathClear = true;
       let x = king.position.x + direction;

       while (x !== rook.position.x) {
           const intermediatePosition = new Position(x, king.position.y);

           // Check if the path is clear
           if (boardState.some(p => p.position.samePosition(intermediatePosition))) {
               pathClear = false;
               break;
           }

           x += direction;
       }

       if (!pathClear) continue;

       // Check if the king and the squares it will move through are under attack
       const kingPath = [
           new Position(king.position.x + direction, king.position.y),
           new Position(king.position.x + 2 * direction, king.position.y),
       ];
        const enemyPieces = boardState.filter(p => p.team !== king.team);

        let valid = true;

        for (const enemy of enemyPieces) {
            if (enemy.possibleMoves === undefined) continue;

            for (const move of enemy.possibleMoves) {
                if (king.position.samePosition(move) || kingPath.some(pos => pos.samePosition(move))) {
                    valid = false;
                    break;
                }

                if(!valid) break;
            }

            if(!valid) break;
        }

        if (!valid) continue;

        possibleMoves.push(new Position(king.position.x + 2 * direction, king.position.y));
    }

    return possibleMoves;
}