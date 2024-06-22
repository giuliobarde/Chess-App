import { PieceType, TeamType } from "../Types";
import { getPossiblePawnMoves, getPossibleKnightMoves, getPossibleBishopMoves, getPossibleRookMoves, getPossibleQueenMoves, getPossibleKingMoves, getCastlingMoves } from "../referee/rules";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export class Board {
    pieces: Piece[];
    totalTurns: number;
    winningTeam?: TeamType;

    constructor(pieces: Piece[], totalTurns: number) {
        this.pieces = pieces;
        this.totalTurns = totalTurns;
    }
    get currentTeam() : TeamType {
        return this.totalTurns % 2 === 0 ? TeamType.BLACK : TeamType.WHITE;
    }

    calculateAllMoves() {
        for (const piece of this.pieces) {
            piece.possibleMoves = this.getValidMoves(piece, this.pieces);
        }

        for (const king of this.pieces.filter(p => p.isKing)) {
            if (king.possibleMoves === undefined) continue; 
            king.possibleMoves = [...king.possibleMoves, ...getCastlingMoves(king, this.pieces)];
        }
        
        this.checkCurrentTeamMoves();

        // Removing opposite team moves
        for (const piece of this.pieces.filter(p => p.team !== this.currentTeam)) {
            piece.possibleMoves = [];
        }

        // If no moves are left for playing team is checkmate
        if (this.pieces.filter(p => p.team === this.currentTeam).some(p => p.possibleMoves !== undefined && p.possibleMoves.length > 0)) return;

        this.winningTeam = (this.currentTeam === TeamType.WHITE) ? TeamType.BLACK : TeamType.WHITE;
    }

    checkCurrentTeamMoves() {
        for (const piece of this.pieces.filter(p => p.team === this.currentTeam)) {
            if (piece.possibleMoves === undefined) continue;

            for (const move of piece.possibleMoves) {
                const simulatedBoard = this.clone();

                simulatedBoard.pieces = simulatedBoard.pieces.filter(p => !p.samePosition(move));

                const clonedPiece = simulatedBoard.pieces.find(p => p.samePiecePosition(piece))!;
                clonedPiece.position = move.clone();

                const clonedKing = simulatedBoard.pieces.find(p => p.isKing && p.team === simulatedBoard.currentTeam)!;

                let safe = true;
                for (const enemy of simulatedBoard.pieces.filter(p => p.team !== simulatedBoard.currentTeam)) {
                    enemy.possibleMoves = simulatedBoard.getValidMoves(enemy, simulatedBoard.pieces);
                
                    if (enemy.isPawn){
                        if (enemy.possibleMoves.some(m => m.x !== enemy.position.x && m.samePosition(clonedKing.position))) {
                            piece.possibleMoves = piece.possibleMoves?.filter(m => !m.samePosition(move));
                        }
                    } else {
                        if (enemy.possibleMoves.some(m => m.samePosition(clonedKing.position))) {
                            piece.possibleMoves = piece.possibleMoves?.filter(m => !m.samePosition(move));
                        }
                    }
                }
            }
        }
    }

    getValidMoves(piece: Piece, boardState: Piece[]) : Position[] {
        switch(piece.type) {
            case PieceType.PAWN:
                return getPossiblePawnMoves(piece, boardState);
            case PieceType.KNIGHT:
                return getPossibleKnightMoves(piece, boardState);
            case PieceType.BISHOP:
                return getPossibleBishopMoves(piece, boardState);
            case PieceType.ROOK:
                return getPossibleRookMoves(piece, boardState);
            case PieceType.QUEEN:
                return getPossibleQueenMoves(piece, boardState);
            case PieceType.KING:
                return getPossibleKingMoves(piece, boardState);
            default:
                return [];
        }
    }

    playMove(
        enPassantMove: boolean, 
        validMove: boolean,
        playedPiece: Piece, 
        destination: Position) : boolean {

        const pieceDirection = (playedPiece.team === TeamType.WHITE) ? 1 : -1;

        // casteling
        if (
            playedPiece.isKing && 
            destination.y === playedPiece.position.y && 
            (Math.abs(destination.x - playedPiece.position.x) === 2)
        ) {
            const rookX = (destination.x < playedPiece.position.x) ? 0 : 7;
            const direction = (destination.x > playedPiece.position.x) ? 1 : -1;
            const newKingXPosition = playedPiece.position.x + 2 * direction;
            
            this.pieces = this.pieces.map(p => {
                if (p.isKing && p.samePiecePosition(playedPiece)) {
                    p.position.x = newKingXPosition;
                } else if (p.isRook && p.position.x === rookX && p.position.y === playedPiece.position.y) {
                    p.position = new Position(playedPiece.position.x + direction, p.position.y);
                }
                return p;
            });

            this.calculateAllMoves();
            return true;
        }

        if (enPassantMove) {
            this.pieces = this.pieces.reduce((results, piece) => {
                if (piece.samePiecePosition(playedPiece)) {
                    if (piece.isPawn) {
                        (piece as Pawn).enPassant = false;
                    }
                    piece.position = destination;
                    piece.hasMoved = true

                    results.push(piece);

                } else if (!piece.samePosition(new Position(destination.x, destination.y - pieceDirection))) {
                    if (piece.isPawn) {
                        (piece as Pawn).enPassant = false;
                    }
                    results.push(piece);
                }
                return results;
            }, [] as Piece[]);

            this.calculateAllMoves();

        } else if (validMove) {
            this.pieces = this.pieces.reduce((results, piece) => {
                if (piece.samePiecePosition(playedPiece)) {
                    if (piece.isPawn) {
                        (piece as Pawn).enPassant = Math.abs(playedPiece.position.y - destination.y) === 2 && piece.isPawn;
                    }
                    piece.position = destination;
                    piece.hasMoved = true;

                    results.push(piece);
                } else if (!piece.samePosition(destination)) {
                    if (piece.isPawn) {
                        (piece as Pawn).enPassant = false;
                    }
                    results.push(piece);
                }
                
                return results;
            }, [] as Piece[]);

            this.calculateAllMoves();

        } else {
            return false;
        }

        return true;
    }

    clone(): Board {
        return new Board(this.pieces.map(p => p.clone()), this.totalTurns);
    }
}