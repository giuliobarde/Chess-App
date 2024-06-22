import React, { useRef, useState } from 'react';
import Tile from '../Tile/tile';
import './Chessboard.css';
import { Piece, Position } from '../../models';
import { GRID_SIZE, HORIZONTAL_AXIS, VERTICAL_AXIS } from '../../constants';

interface Props {
    playMove: (piece: Piece, position: Position) => boolean;
    pieces: Piece[];
}

export default function Chessboard({ playMove, pieces }: Props) {
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
    const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
    const chessboardRef = useRef<HTMLDivElement>(null);

    function grabPiece(e: React.MouseEvent) {
        const element = e.target as HTMLElement;
        const chessboard = chessboardRef.current;

        if (element.classList.contains("chess-piece") && chessboard) {
            const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
            const grabY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));
            setGrabPosition(new Position(grabX, grabY));

            const x = e.clientX - 50;
            const y = e.clientY - 50;
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            setActivePiece(element);
        }
    }

    function movePiece(e: React.MouseEvent) {
        if (activePiece) {
            const chessboard = chessboardRef.current;
            if (activePiece && chessboard) {
                const minX = chessboard.offsetLeft - 32;
                const maxX = chessboard.offsetLeft + chessboard.clientWidth - 72;
                const minY = chessboard.offsetTop - 23;
                const maxY = chessboard.offsetTop + chessboard.clientHeight - 72;
                const x = e.clientX - (GRID_SIZE / 2);
                const y = e.clientY - (GRID_SIZE / 2);
                activePiece.style.position = "absolute";
                activePiece.style.left = `${x}px`;
                activePiece.style.top = `${y}px`;

                if (x < minX) {
                    activePiece.style.left = `${minX}px`;
                } else if (x > maxX) {
                    activePiece.style.left = `${maxX}px`;
                }

                if (y < minY) {
                    activePiece.style.top = `${minY}px`;
                } else if (y > maxY) {
                    activePiece.style.top = `${maxY}px`;
                }
            }
        }
    }

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
            const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / GRID_SIZE));

            const currentPiece = pieces.find(
                (p) => p.samePosition(grabPosition)
            );

            if (currentPiece) {
                const destination = new Position(x, y);
                const success = playMove(currentPiece.clone(), destination);

                if (!success) {
                    // Reset to previous position if move is invalid
                    activePiece.style.position = 'relative';
                    activePiece.style.removeProperty('top');
                    activePiece.style.removeProperty('left');
                }
            }
            setActivePiece(null);
        }
    }

    let board = [];

    for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
        for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
            const number = j + i + 2;
            const piece = pieces.find(
                (p) => p.samePosition(new Position(i, j))
            );
            let image = piece ? piece.image : undefined;

            const currentPiece = activePiece && pieces.find(p => p.samePosition(grabPosition));
            const highlight = currentPiece?.possibleMoves ? currentPiece.possibleMoves.some(p => p.samePosition(new Position(i, j))) : false;

            board.push(<Tile key={`${j},${i}`} image={image} number={number} highlight={highlight} />);
        }
    }

    return (
        <div
            onMouseMove={movePiece}
            onMouseDown={grabPiece}
            onMouseUp={dropPiece}
            id="chessboard"
            ref={chessboardRef}
        >
            {board}
        </div>
    );
}
