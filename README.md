# Chess Game Website

A fully functional, browser-based chess game built with HTML, CSS, and JavaScript. Play chess with a friend in hot-seat mode with a beautiful, modern interface.

## Features

### Game Board & UI
- ✅ 8x8 chessboard with alternating light and dark squares
- ✅ All 32 chess pieces (16 white, 16 black) with distinct Unicode symbols
- ✅ Responsive design that works on desktop and mobile devices
- ✅ Clean, modern dark-themed interface with smooth animations
- ✅ Visual feedback for piece selection and legal moves
- ✅ Coordinate labels on the board edges

### Complete Chess Rules
- ✅ **Piece Movement**: Proper movement rules for all pieces (pawns, rooks, knights, bishops, queens, kings)
- ✅ **Move Validation**: Prevents illegal moves automatically
- ✅ **Turn-Based Gameplay**: White moves first, then alternates between players
- ✅ **Piece Capture**: Click and capture opponent pieces
- ✅ **Pawn Promotion**: Choose from Queen, Rook, Bishop, or Knight when reaching the opposite end
- ✅ **Castling**: Both kingside (O-O) and queenside (O-O-O) castling supported
- ✅ **En Passant**: Special pawn capture move implemented

### Game State & Features
- ✅ **Check Detection**: Visual indication when king is in check
- ✅ **Checkmate Detection**: Automatic game end when checkmate occurs
- ✅ **Stalemate Detection**: Recognizes draw conditions
- ✅ **Move Highlighting**: Shows all legal moves for the selected piece
- ✅ **Move History**: Complete log of all moves in algebraic notation
- ✅ **Last Move Indicator**: Highlights the squares involved in the most recent move
- ✅ **Current Player Indicator**: Shows whose turn it is with visual piece symbol
- ✅ **New Game Button**: Reset and start a fresh game at any time

## How to Play

1. **Open the Game**: Simply open `index.html` in any modern web browser
2. **Select a Piece**: Click on any piece of the current player's color
3. **View Legal Moves**: Green circles show possible moves, red circles show captures
4. **Make a Move**: Click on a highlighted square to move the selected piece
5. **Special Moves**:
   - **Castling**: Move the king two squares toward a rook to castle
   - **En Passant**: Capture an opponent's pawn that just moved two squares
   - **Promotion**: When a pawn reaches the opposite end, choose which piece to promote to
6. **Win the Game**: Checkmate your opponent's king or force a stalemate

## Technical Details

### Files
- `index.html` - Main HTML structure and layout
- `styles.css` - Complete styling and responsive design
- `chess.js` - Game logic, rules engine, and UI interactions

### Browser Compatibility
Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### No Dependencies
Pure vanilla JavaScript - no frameworks or libraries required!

## Game Logic Highlights

- **Legal Move Calculation**: Ensures all moves follow chess rules
- **Check Prevention**: Players cannot make moves that leave their own king in check
- **Castling Rights Tracking**: Automatically prevents castling after king/rook movement
- **En Passant Window**: Tracks the one-turn window for en passant captures
- **Move Notation**: Records moves in standard algebraic notation with special symbols (+, #, =)

## Future Enhancements (Optional)

Some ideas for extending the game:
- Add AI opponent with difficulty levels
- Implement move undo/redo
- Add timer/clock for timed games
- Save/load game states
- Multiplayer over network
- Opening book and endgame tablebase
- Analysis mode showing best moves

## License

Free to use and modify for personal or educational purposes.

---

**Enjoy playing chess!** ♔♕♖♗♘♙
