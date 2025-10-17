const PIECES = {
    PAWN: 'p',
    ROOK: 'r',
    KNIGHT: 'n',
    BISHOP: 'b',
    QUEEN: 'q',
    KING: 'k'
};

const COLORS = {
    WHITE: 'white',
    BLACK: 'black'
};

const PIECE_SYMBOLS = {
    white: {
        p: '♙',
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔'
    },
    black: {
        p: '♟',
        r: '♜',
        n: '♞',
        b: '♝',
        q: '♛',
        k: '♚'
    }
};

class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = COLORS.WHITE;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.moveHistory = [];
        this.lastMove = null;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.gameStatus = 'ongoing';
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.statusMessage = '';
        this.statusColor = '';
        
        this.initializeUI();
        this.renderBoard();
        this.updateTurnIndicator();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        board[0] = [
            { type: PIECES.ROOK, color: COLORS.BLACK },
            { type: PIECES.KNIGHT, color: COLORS.BLACK },
            { type: PIECES.BISHOP, color: COLORS.BLACK },
            { type: PIECES.QUEEN, color: COLORS.BLACK },
            { type: PIECES.KING, color: COLORS.BLACK },
            { type: PIECES.BISHOP, color: COLORS.BLACK },
            { type: PIECES.KNIGHT, color: COLORS.BLACK },
            { type: PIECES.ROOK, color: COLORS.BLACK }
        ];
        
        board[1] = Array(8).fill(null).map(() => ({ type: PIECES.PAWN, color: COLORS.BLACK }));
        
        board[6] = Array(8).fill(null).map(() => ({ type: PIECES.PAWN, color: COLORS.WHITE }));
        
        board[7] = [
            { type: PIECES.ROOK, color: COLORS.WHITE },
            { type: PIECES.KNIGHT, color: COLORS.WHITE },
            { type: PIECES.BISHOP, color: COLORS.WHITE },
            { type: PIECES.QUEEN, color: COLORS.WHITE },
            { type: PIECES.KING, color: COLORS.WHITE },
            { type: PIECES.BISHOP, color: COLORS.WHITE },
            { type: PIECES.KNIGHT, color: COLORS.WHITE },
            { type: PIECES.ROOK, color: COLORS.WHITE }
        ];
        
        return board;
    }

    initializeUI() {
        this.boardElement = document.getElementById('chessboard');
        this.turnPieceElement = document.getElementById('turnPiece');
        this.turnTextElement = document.getElementById('turnText');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.moveListElement = document.getElementById('moveList');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.promotionDialog = document.getElementById('promotionDialog');
        this.promotionOptions = document.getElementById('promotionOptions');
        
        this.newGameBtn.addEventListener('click', () => this.resetGame());
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        const kingInCheck = this.findKingInCheck();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                if (row === 7) {
                    square.dataset.label = String.fromCharCode(97 + col);
                } else if (col === 7) {
                    square.dataset.label = 8 - row;
                }
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('span');
                    pieceElement.className = `piece ${piece.color}`;
                    pieceElement.textContent = PIECE_SYMBOLS[piece.color][piece.type];
                    square.appendChild(pieceElement);
                }
                
                if (this.lastMove && 
                    ((this.lastMove.from.row === row && this.lastMove.from.col === col) ||
                     (this.lastMove.to.row === row && this.lastMove.to.col === col))) {
                    square.classList.add('last-move');
                }
                
                if (kingInCheck && kingInCheck.row === row && kingInCheck.col === col) {
                    square.classList.add('in-check');
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                this.boardElement.appendChild(square);
            }
        }
        
        this.highlightSquares();
    }

    handleSquareClick(row, col) {
        if (this.gameStatus !== 'ongoing') return;
        
        const piece = this.board[row][col];
        
        if (this.selectedSquare) {
            const isLegalMove = this.legalMoves.some(move => 
                move.row === row && move.col === col
            );
            
            if (isLegalMove) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.selectedSquare = null;
                this.legalMoves = [];
            } else if (piece && piece.color === this.currentTurn) {
                this.selectSquare(row, col);
            } else {
                this.selectedSquare = null;
                this.legalMoves = [];
            }
        } else if (piece && piece.color === this.currentTurn) {
            this.selectSquare(row, col);
        }
        
        this.renderBoard();
    }

    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        this.legalMoves = this.getLegalMovesForPiece(row, col);
    }

    highlightSquares() {
        if (!this.selectedSquare) return;
        
        const selectedElement = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        this.legalMoves.forEach(move => {
            const element = this.getSquareElement(move.row, move.col);
            if (element) {
                const isCapture = this.board[move.row][move.col] !== null;
                element.classList.add(isCapture ? 'highlight-capture' : 'highlight-move');
            }
        });
    }

    getSquareElement(row, col) {
        return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        let moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol);
        
        let specialMove = null;
        
        if (piece.type === PIECES.PAWN && toCol !== fromCol && !capturedPiece) {
            this.board[fromRow][toCol] = null;
            specialMove = 'enPassant';
        }
        
        if (piece.type === PIECES.KING && Math.abs(toCol - fromCol) === 2) {
            const rookCol = toCol > fromCol ? 7 : 0;
            const newRookCol = toCol > fromCol ? toCol - 1 : toCol + 1;
            this.board[fromRow][newRookCol] = this.board[fromRow][rookCol];
            this.board[fromRow][rookCol] = null;
            specialMove = 'castling';
        }
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        this.lastMove = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            captured: capturedPiece
        };
        
        if (piece.type === PIECES.PAWN && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
        } else {
            this.enPassantTarget = null;
        }
        
        if (piece.type === PIECES.KING) {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }
        
        if (piece.type === PIECES.ROOK) {
            if (fromCol === 0) {
                this.castlingRights[piece.color].queenside = false;
            } else if (fromCol === 7) {
                this.castlingRights[piece.color].kingside = false;
            }
        }
        
        if (capturedPiece && capturedPiece.type === PIECES.ROOK) {
            const capturedRow = capturedPiece.color === COLORS.WHITE ? 7 : 0;
            if (toRow === capturedRow) {
                if (toCol === 0) {
                    this.castlingRights[capturedPiece.color].queenside = false;
                } else if (toCol === 7) {
                    this.castlingRights[capturedPiece.color].kingside = false;
                }
            }
        }
        
        if (piece.type === PIECES.PAWN && (toRow === 0 || toRow === 7)) {
            this.showPromotionDialog(toRow, toCol, moveNotation);
            return;
        }
        
        this.finalizeTurn(moveNotation);
    }

    finalizeTurn(moveNotation) {
        this.currentTurn = this.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        this.gameStatus = 'ongoing';
        this.statusMessage = '';
        this.statusColor = '';
        
        if (this.isInCheck(this.currentTurn)) {
            if (this.isCheckmate(this.currentTurn)) {
                this.gameStatus = 'checkmate';
                moveNotation += '#';
                const winner = this.currentTurn === COLORS.WHITE ? 'Black' : 'White';
                this.statusMessage = `Checkmate! ${winner} wins.`;
                this.statusColor = '#4caf50';
            } else {
                moveNotation += '+';
                const defender = this.currentTurn === COLORS.WHITE ? 'White' : 'Black';
                this.statusMessage = `${defender} is in check.`;
                this.statusColor = '#fdd835';
            }
        } else if (this.isStalemate(this.currentTurn)) {
            this.gameStatus = 'stalemate';
            this.statusMessage = 'Stalemate. Game drawn.';
            this.statusColor = '#ff9800';
        }
        
        this.addMoveToHistory(moveNotation);
        this.updateTurnIndicator();
        this.renderBoard();
    }

    showPromotionDialog(row, col, moveNotation) {
        const piece = this.board[row][col];
        this.promotionOptions.innerHTML = '';
        
        const promotionPieces = [
            { type: PIECES.QUEEN, name: 'Queen', notation: 'Q' },
            { type: PIECES.ROOK, name: 'Rook', notation: 'R' },
            { type: PIECES.BISHOP, name: 'Bishop', notation: 'B' },
            { type: PIECES.KNIGHT, name: 'Knight', notation: 'N' }
        ];
        
        promotionPieces.forEach(({ type, name, notation }) => {
            const option = document.createElement('div');
            option.className = 'promotion-option';
            option.innerHTML = `
                <span>${PIECE_SYMBOLS[piece.color][type]}</span>
                <div>${name}</div>
            `;
            option.addEventListener('click', () => {
                this.board[row][col].type = type;
                this.promotionDialog.classList.add('hidden');
                this.finalizeTurn(`${moveNotation}=${notation}`);
            });
            this.promotionOptions.appendChild(option);
        });
        
        this.promotionDialog.classList.remove('hidden');
    }

    getMoveNotation(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        const files = 'abcdefgh';
        
        let notation = '';
        
        if (piece.type === PIECES.KING && Math.abs(toCol - fromCol) === 2) {
            return toCol > fromCol ? 'O-O' : 'O-O-O';
        }
        
        if (piece.type !== PIECES.PAWN) {
            notation += piece.type.toUpperCase();
        }
        
        if (capturedPiece || (piece.type === PIECES.PAWN && toCol !== fromCol)) {
            if (piece.type === PIECES.PAWN) {
                notation += files[fromCol];
            }
            notation += 'x';
        }
        
        notation += files[toCol] + (8 - toRow);
        
        return notation;
    }

    getLegalMovesForPiece(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let possibleMoves = [];
        
        switch (piece.type) {
            case PIECES.PAWN:
                possibleMoves = this.getPawnMoves(row, col, piece.color);
                break;
            case PIECES.ROOK:
                possibleMoves = this.getRookMoves(row, col, piece.color);
                break;
            case PIECES.KNIGHT:
                possibleMoves = this.getKnightMoves(row, col, piece.color);
                break;
            case PIECES.BISHOP:
                possibleMoves = this.getBishopMoves(row, col, piece.color);
                break;
            case PIECES.QUEEN:
                possibleMoves = this.getQueenMoves(row, col, piece.color);
                break;
            case PIECES.KING:
                possibleMoves = this.getKingMoves(row, col, piece.color);
                break;
        }
        
        return possibleMoves.filter(move => 
            !this.wouldBeInCheck(row, col, move.row, move.col, piece.color)
        );
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === COLORS.WHITE ? -1 : 1;
        const startRow = color === COLORS.WHITE ? 6 : 1;
        
        const newRow = row + direction;
        if (this.isValidSquare(newRow, col) && !this.board[newRow][col]) {
            moves.push({ row: newRow, col });
            
            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.board[doubleRow][col]) {
                    moves.push({ row: doubleRow, col });
                }
            }
        }
        
        [-1, 1].forEach(colOffset => {
            const newCol = col + colOffset;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === newRow && 
                    this.enPassantTarget.col === newCol) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dRow, dCol]) => {
            let newRow = row + dRow;
            let newCol = col + dCol;
            
            while (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        });
        
        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        directions.forEach(([dRow, dCol]) => {
            let newRow = row + dRow;
            let newCol = col + dCol;
            
            while (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        });
        
        return moves;
    }

    getQueenMoves(row, col, color) {
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });
        
        const homeRow = color === COLORS.WHITE ? 7 : 0;
        if (row === homeRow && col === 4) {
            if (this.castlingRights[color].kingside && 
                !this.board[homeRow][5] && 
                !this.board[homeRow][6] &&
                !this.isSquareUnderAttack(homeRow, 4, color) &&
                !this.isSquareUnderAttack(homeRow, 5, color) &&
                !this.isSquareUnderAttack(homeRow, 6, color)) {
                moves.push({ row: homeRow, col: 6 });
            }
            
            if (this.castlingRights[color].queenside && 
                !this.board[homeRow][3] && 
                !this.board[homeRow][2] && 
                !this.board[homeRow][1] &&
                !this.isSquareUnderAttack(homeRow, 4, color) &&
                !this.isSquareUnderAttack(homeRow, 3, color) &&
                !this.isSquareUnderAttack(homeRow, 2, color)) {
                moves.push({ row: homeRow, col: 2 });
            }
        }
        
        return moves;
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isSquareUnderAttack(row, col, color) {
        const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === opponentColor) {
                    let possibleMoves = [];
                    
                    switch (piece.type) {
                        case PIECES.PAWN:
                            possibleMoves = this.getPawnAttackSquares(r, c, opponentColor);
                            break;
                        case PIECES.ROOK:
                            possibleMoves = this.getRookMoves(r, c, opponentColor);
                            break;
                        case PIECES.KNIGHT:
                            possibleMoves = this.getKnightMoves(r, c, opponentColor);
                            break;
                        case PIECES.BISHOP:
                            possibleMoves = this.getBishopMoves(r, c, opponentColor);
                            break;
                        case PIECES.QUEEN:
                            possibleMoves = this.getQueenMoves(r, c, opponentColor);
                            break;
                        case PIECES.KING:
                            possibleMoves = this.getKingAttackSquares(r, c);
                            break;
                    }
                    
                    if (possibleMoves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    getPawnAttackSquares(row, col, color) {
        const moves = [];
        const direction = color === COLORS.WHITE ? -1 : 1;
        const newRow = row + direction;
        
        [-1, 1].forEach(colOffset => {
            const newCol = col + colOffset;
            if (this.isValidSquare(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol });
            }
        });
        
        return moves;
    }

    getKingAttackSquares(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidSquare(newRow, newCol)) {
                moves.push({ row: newRow, col: newCol });
            }
        });
        
        return moves;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        const tempBoard = this.board.map(row => [...row]);
        const tempEnPassant = this.enPassantTarget;
        
        const piece = this.board[fromRow][fromCol];
        
        if (piece.type === PIECES.PAWN && toCol !== fromCol && !this.board[toRow][toCol]) {
            this.board[fromRow][toCol] = null;
        }
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        const inCheck = this.isInCheck(color);
        
        this.board = tempBoard;
        this.enPassantTarget = tempEnPassant;
        
        return inCheck;
    }

    isInCheck(color) {
        const kingPosition = this.findKing(color);
        if (!kingPosition) return false;
        
        return this.isSquareUnderAttack(kingPosition.row, kingPosition.col, color);
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === PIECES.KING && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    findKingInCheck() {
        if (this.isInCheck(COLORS.WHITE)) {
            return this.findKing(COLORS.WHITE);
        } else if (this.isInCheck(COLORS.BLACK)) {
            return this.findKing(COLORS.BLACK);
        }
        return null;
    }

    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const legalMoves = this.getLegalMovesForPiece(row, col);
                    if (legalMoves.length > 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    isStalemate(color) {
        if (this.isInCheck(color)) return false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const legalMoves = this.getLegalMovesForPiece(row, col);
                    if (legalMoves.length > 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    updateTurnIndicator() {
        const isWhiteTurn = this.currentTurn === COLORS.WHITE;
        
        if (this.gameStatus === 'ongoing') {
            this.turnPieceElement.textContent = isWhiteTurn ? '♔' : '♚';
            this.turnTextElement.textContent = `${isWhiteTurn ? 'White' : 'Black'}'s Turn`;
        } else if (this.gameStatus === 'checkmate') {
            const winnerIsWhite = !isWhiteTurn;
            this.turnPieceElement.textContent = winnerIsWhite ? '♔' : '♚';
            this.turnTextElement.textContent = `${winnerIsWhite ? 'White' : 'Black'} Wins`;
        } else {
            this.turnPieceElement.textContent = '⚖';
            this.turnTextElement.textContent = 'Drawn Game';
        }
        
        if (this.statusMessage) {
            this.gameStatusElement.textContent = this.statusMessage;
            this.gameStatusElement.style.color = this.statusColor || 'var(--color-accent-light)';
        } else {
            this.gameStatusElement.textContent = '';
            this.gameStatusElement.style.color = 'var(--color-accent-light)';
        }
    }

    addMoveToHistory(notation) {
        const moveNumber = Math.ceil((this.moveHistory.length + 1) / 2);
        const isWhiteMove = this.moveHistory.length % 2 === 0;
        
        if (isWhiteMove) {
            if (this.moveHistory.length === 0) {
                this.moveListElement.innerHTML = `
                    <div class="header">#</div>
                    <div class="header">White</div>
                    <div class="header">Black</div>
                `;
            }
            
            const moveEntry = document.createElement('div');
            moveEntry.className = 'move-entry';
            moveEntry.innerHTML = `
                <div>${moveNumber}.</div>
                <div>${notation}</div>
                <div id="black-move-${moveNumber}">...</div>
            `;
            this.moveListElement.appendChild(moveEntry);
        } else {
            const blackMoveElement = document.getElementById(`black-move-${moveNumber}`);
            if (blackMoveElement) {
                blackMoveElement.textContent = notation;
            }
        }
        
        this.moveHistory.push(notation);
        this.moveListElement.scrollTop = this.moveListElement.scrollHeight;
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentTurn = COLORS.WHITE;
        this.selectedSquare = null;
        this.legalMoves = [];
        this.moveHistory = [];
        this.lastMove = null;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.gameStatus = 'ongoing';
        this.statusMessage = '';
        this.statusColor = '';
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveListElement.innerHTML = '';
        this.promotionDialog.classList.add('hidden');
        
        this.renderBoard();
        this.updateTurnIndicator();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});
