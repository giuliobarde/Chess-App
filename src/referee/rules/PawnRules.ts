import { TeamType } from "../../Types";
import { Position, Piece } from "../../models";
import { Pawn } from "../../models/Pawn";
import { tileIsOccupied, tileIsOccupiedByOpponent } from "./GeneralRules";

export const pawnMove = (
    initialPosition: Position, 
    desiredPosition: Position, 
    team: TeamType, 
    boardState: Piece[]
) => {
    const specialRow = (team === TeamType.WHITE) ? 1 : 6;
    const pieceDirection = (team === TeamType.WHITE) ? 1 : -1;

    // MOVEMENT
    if (
        initialPosition.x === desiredPosition.x 
        && initialPosition.y === specialRow 
        && desiredPosition.y - initialPosition.y === 2 * pieceDirection
    ) {
        if (
            !tileIsOccupied(desiredPosition, boardState) 
            && !tileIsOccupied(new Position(desiredPosition.x, desiredPosition.y - pieceDirection), boardState)
        ) {
            return true;
        }
    } else if (
        initialPosition.x === desiredPosition.x 
        && desiredPosition.y - initialPosition.y === pieceDirection
    ) {
        if (
            !tileIsOccupied(desiredPosition, boardState)
        ) {
            return true;
        }
    }
    // ATTACK
    else if (
        (desiredPosition.x - initialPosition.x === 1 || desiredPosition.x - initialPosition.x === -1) 
        && desiredPosition.y - initialPosition.y === pieceDirection
    ) {
        if (tileIsOccupiedByOpponent(desiredPosition, boardState, team)) {
            return true;
        }
    }
    return false;
}

export const getPossiblePawnMoves = (pawn: Piece, boardState: Piece[]) : Position[] => {
    const possibleMoves: Position[] = [];

    const specialRow = (pawn.team === TeamType.WHITE) ? 1 : 6;
    const pieceDirection = (pawn.team === TeamType.WHITE) ? 1 : -1;

    const normalMove = new Position(pawn.position.x, pawn.position.y + pieceDirection);
    const specialMove = new Position(pawn.position.x, pawn.position.y + pieceDirection*2);
    const upperLeftAttack = new Position(pawn.position.x - 1, pawn.position.y + pieceDirection);
    const upperRightAttack = new Position(pawn.position.x + 1, pawn.position.y + pieceDirection);
    const leftPosition = new Position(pawn.position.x - 1, pawn.position.y);
    const rightPosition = new Position(pawn.position.x + 1, pawn.position.y);

    if(!tileIsOccupied(normalMove, boardState)) {
        possibleMoves.push(normalMove);

        if (pawn.position.y === specialRow && 
            !tileIsOccupied(specialMove, boardState)) {
            possibleMoves.push(specialMove);
        }
    }

    if (tileIsOccupiedByOpponent(upperLeftAttack, boardState,pawn.team)) {
        possibleMoves.push(upperLeftAttack);
    } else if (!tileIsOccupied(upperLeftAttack, boardState)) {
        const leftPiece = boardState.find(p => p.samePosition(leftPosition));
        if (leftPiece != null && (leftPiece as Pawn).enPassant) {
            possibleMoves.push(upperLeftAttack);
        }
    }

    if (tileIsOccupiedByOpponent(upperRightAttack, boardState,pawn.team)) {
        possibleMoves.push(upperRightAttack);
    } else if (!tileIsOccupied(upperRightAttack, boardState)) {
        const rightPiece = boardState.find(p => p.samePosition(rightPosition));
        if (rightPiece != null && (rightPiece as Pawn).enPassant) {
            possibleMoves.push(upperRightAttack);
        }
    }

    return possibleMoves;
}