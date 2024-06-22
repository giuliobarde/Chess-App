import { useEffect, useRef, useState } from "react";
import Chessboard from "../Chessboard/Chessboard";
import { bishopMove, kingMove, knightMove, pawnMove, queenMove, rookMove } from "../../referee/rules";
import { initialBoard } from "../../constants";
import { Piece, Position } from "../../models";
import { TeamType, PieceType } from "../../Types";
import { Pawn } from "../../models/Pawn";
import { Board } from "../../models/Board";

export default function Referee() {
    const [board, setBoard] = useState<Board>(initialBoard.clone());
    const [promotionPawn, setPromotionPawn] = useState<Piece>();
    const modalRef = useRef<HTMLDivElement>(null);
    const checkmateModalRef = useRef<HTMLDivElement>(null);

       function playMove(playedPiece: Piece, destination: Position) : boolean {
        if (playedPiece.possibleMoves === undefined) return false;
        if (playedPiece.team === TeamType.WHITE && board.totalTurns % 2 !== 1) return false;
        if (playedPiece.team === TeamType.BLACK && board.totalTurns % 2 !== 0) return false;

        let playedMoveIsValid = false;

        const validMove = playedPiece.possibleMoves?.some(m => m.samePosition(destination));

        if (!validMove) return false;

        const enPassantMove = isEnPassantMove(
            playedPiece.position,
            destination,
            playedPiece.type,
            playedPiece.team,
        );

        setBoard(() => {
            const clonedBoard = board.clone();
            clonedBoard.totalTurns++;
            
            playedMoveIsValid = clonedBoard.playMove(enPassantMove, validMove, playedPiece, destination);            
 
            if (clonedBoard.winningTeam !== undefined){
                checkmateModalRef.current?.classList.remove("hidden");
            }

            return clonedBoard;
        })

        let promotionRow = (playedPiece.team === TeamType.WHITE) ? 7 : 0;

        if (destination.y === promotionRow && playedPiece.isPawn) {
            modalRef.current?.classList.remove("hidden");
            setPromotionPawn((previousPromotionPawn) => {
                const clonedPlayedPiece = playedPiece.clone();
                clonedPlayedPiece.position = destination.clone();
                return clonedPlayedPiece;
            });
        }

        return playedMoveIsValid;
    }

    function isEnPassantMove(
        initialPosition: Position,
        desiredPosition: Position,
        type: PieceType,
        team: TeamType
    ) {
        const pieceDirection = team === TeamType.WHITE ? 1 : -1;

        if (type === PieceType.PAWN) {
            if (
                Math.abs(desiredPosition.x - initialPosition.x) === 1 &&
                desiredPosition.y - initialPosition.y === pieceDirection
            ) {
                const capturedPawnPosition = new Position(desiredPosition.x, desiredPosition.y - pieceDirection);
                const capturedPawn = board.pieces.find(
                    (p) =>
                        p.position.x === capturedPawnPosition.x &&
                        p.position.y === capturedPawnPosition.y &&
                        p.type === PieceType.PAWN &&
                        p.team !== team &&
                        (p as Pawn).enPassant
                );
                return Boolean(capturedPawn);
            }
        }
        return false;
    }

    function isValidMove(
        initialPosition: Position,
        desiredPosition: Position,
        type: PieceType,
        team: TeamType,
    ) {
        let validMove = false;
        switch(type) {
            case PieceType.PAWN:
                validMove = pawnMove(initialPosition, desiredPosition, team, board.pieces);
                break;
            case PieceType.KNIGHT:
                validMove = knightMove(initialPosition, desiredPosition, team, board.pieces);
                break;
            case PieceType.BISHOP:
                validMove = bishopMove(initialPosition, desiredPosition, team, board.pieces);
                break;
            case PieceType.ROOK:
                validMove = rookMove(initialPosition, desiredPosition, team, board.pieces);
                break;
            case PieceType.QUEEN:
                validMove = queenMove(initialPosition, desiredPosition, team, board.pieces);
                break;
            case PieceType.KING:
                validMove = kingMove(initialPosition, desiredPosition, team, board.pieces);
        }
        return validMove;
    }

    function pawnPromotion (selection: PieceType) {
        if (promotionPawn === undefined) {
            return;
        }

        setBoard((previousBoard) => {
            const clonedBoard = board.clone();
            clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
                if (piece.samePiecePosition(promotionPawn)) {
                    results.push(new Piece(piece.position.clone(), selection, piece.team, true));
                } else {
                    results.push(piece);
                }
                return results;
            }, [] as Piece[]);

            clonedBoard.calculateAllMoves();
            return clonedBoard;
        });


        modalRef.current?.classList.add("hidden");
    }

    function promotionTeamType() {
        return (promotionPawn?.team === TeamType.WHITE) ? "w" : "b";
    }

    function restartGame() {
        checkmateModalRef.current?.classList.add("hidden");
        setBoard(initialBoard.clone());
    }
    
    return (
    <>
    <p style={{color: "white", fontSize: "24px"}}>Total turns: {board.totalTurns}; {(board.totalTurns % 2 === 1) ? "white" : "black"} moves</p>
        <div className="modal hidden" ref={modalRef}>
            <div className="modal-body">
                <img onClick={() => pawnPromotion(PieceType.ROOK)} src={`/assets/images/rook_${promotionTeamType()}.png`}/>
                <img onClick={() => pawnPromotion(PieceType.BISHOP)} src={`/assets/images/bishop_${promotionTeamType()}.png`}/>
                <img onClick={() => pawnPromotion(PieceType.KNIGHT)} src={`/assets/images/knight_${promotionTeamType()}.png`}/>
                <img onClick={() => pawnPromotion(PieceType.QUEEN)} src={`/assets/images/queen_${promotionTeamType()}.png`}/>
            </div>
        </div>
        <div className="modal hidden" ref={checkmateModalRef}>
            <div className="modal-body">
                <div className="checkmate-body">
                    <span>{board.winningTeam === TeamType.WHITE ? "White" : "Black"} team won the game!</span>
                    <button onClick={restartGame}>play again</button>
                </div>
            </div>
        </div>
        <Chessboard playMove={playMove}
                    pieces={board.pieces}/>
    </>
    )
}