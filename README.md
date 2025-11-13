# Chess.com ChessHub Assistant

This Chrome extension calls the ChessHub public API to fetch suggested moves for the current position on Chess.com. The best move is highlighted on the board so you can see the recommended continuation at a glance.

## Features

- Detects Chess.com boards on live games, analysis boards, and puzzles.
- Reads the current position (FEN) directly from the page or reconstructs it from the visible pieces.
- Queries `https://www.chesshub.com/api/v2/fens.json` for the recommended move.
- Highlights the suggested move with colored overlays for the from- and to-squares.

## Installation

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the folder that contains `manifest.json`.
5. Navigate to [Chess.com](https://www.chess.com) and open a game; the recommended move will be highlighted automatically.

## Notes

- The extension polls the ChessHub API when the position changes (every 2 seconds by default).
- If the board does not expose a full FEN string, the extension reconstructs the piece placement but assumes default turn/castling/en passant data.
- Highlight colors can be customized via `styles.css`.
