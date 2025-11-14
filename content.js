const API_URL = 'https://www.chesshub.com/api/v2/fens.json';
const POLL_INTERVAL = 2000;

let lastFen = null;
let lastMoveKey = null;
let overlay = null;
let overlayHost = null;
let pollTimer = null;
let pendingFen = null;
let bestMoveToast = null;
let toastTimeout = null;

const logger = {
  info: (...args) => console.info('[ChessHub]', ...args),
  warn: (...args) => console.warn('[ChessHub]', ...args),
  error: (...args) => console.error('[ChessHub]', ...args)
};

function getOverlayHost(boardElement) {
  const preferred = boardElement.closest?.(
    '.board-layout-board, .board-area, .board-container, .board'
  );
  const host = preferred || boardElement.parentElement || boardElement;
  const computed = window.getComputedStyle(host);
  if (computed.position === 'static') {
    host.style.position = 'relative';
  }
  return host;
}

function ensureOverlay(boardElement) {
  const host = getOverlayHost(boardElement);
  if (overlay && overlay.isConnected && overlayHost === host) {
    return overlay;
  }

  if (overlay && overlay.isConnected) {
    overlay.remove();
  }

  overlayHost = host;
  overlay = document.createElement('div');
  overlay.id = 'chesshub-overlay';
  overlay.style.position = 'absolute';
  overlay.style.pointerEvents = 'none';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.zIndex = '10';

  host.appendChild(overlay);
  return overlay;
}

function clearOverlay() {
  if (!overlay) return;
  overlay.replaceChildren();
  bestMoveToast = null;
}

function algebraicToIndices(square, orientation) {
  if (!square || square.length !== 2) return null;

  const file = square.charCodeAt(0) - 97; // a–h → 0–7
  const rank = parseInt(square[1], 10) - 1; // 1–8 → 0–7

  if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;

  if (orientation === 'black') {
    return { x: 7 - file, y: rank };
  }

  return { x: file, y: 7 - rank };
}

function showBestMoveToast(boardElement, text) {
  if (!text) return;

  const layer = ensureOverlay(boardElement);

  if (!bestMoveToast || !bestMoveToast.isConnected || bestMoveToast.parentElement !== layer) {
    bestMoveToast = document.createElement('div');
    bestMoveToast.id = 'chesshub-best-move-toast';
    bestMoveToast.className = 'chesshub-best-move-toast';
    layer.appendChild(bestMoveToast);
  }

  bestMoveToast.textContent = `Best move: ${text}`;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  // Tự ẩn sau 4s
  toastTimeout = setTimeout(() => {
    if (bestMoveToast && bestMoveToast.isConnected) {
      bestMoveToast.remove();
    }
    bestMoveToast = null;
    toastTimeout = null;
  }, 4000);
}

function highlightMove(boardElement, move) {
  if (!move || !move.from || !move.to) {
    clearOverlay();
    return;
  }

  const orientationSource =
    boardElement.closest?.('[data-orientation]') || boardElement;
  const orientation =
    orientationSource.getAttribute('data-orientation') ||
    orientationSource.getAttribute('orientation') ||
    'white';

  const layer = ensureOverlay(boardElement);
  const boardRect = layer.getBoundingClientRect();
  const squareWidth = boardRect.width / 8;
  const squareHeight = boardRect.height / 8;

  clearOverlay();

  const squares = [
    { square: move.from, className: 'chesshub-highlight-from' },
    { square: move.to, className: 'chesshub-highlight-to' }
  ];

  squares.forEach(({ square, className }) => {
    const indices = algebraicToIndices(square, orientation);
    if (!indices) return;

    const highlight = document.createElement('div');
    highlight.className = `chesshub-highlight ${className}`;
    highlight.style.position = 'absolute';
    highlight.style.width = `${squareWidth}px`;
    highlight.style.height = `${squareHeight}px`;
    highlight.style.left = `${indices.x * squareWidth}px`;
    highlight.style.top = `${indices.y * squareHeight}px`;

    layer.appendChild(highlight);
  });

  // Tạo text kiểu "e2e4" như ảnh
  const moveLabel =
    move.uci ||
    (move.from && move.to ? `${move.from}${move.to}` : '') ||
    move.san ||
    '';

  if (moveLabel) {
    showBestMoveToast(boardElement, moveLabel);
  }
}

function readFen(boardElement) {
  if (!boardElement) return null;

  const fenAttr = boardElement.getAttribute('data-fen') || boardElement.dataset?.fen;
  if (fenAttr) {
    return fenAttr.trim();
  }

  const stateAttr = boardElement.getAttribute('data-state');
  if (stateAttr) {
    try {
      const state = JSON.parse(stateAttr);
      if (state?.fen) {
        return String(state.fen).trim();
      }
    } catch (error) {
      logger.warn('Unable to parse board state attribute', error);
    }
  }

  // Không tự build FEN nữa – chỉ dùng dữ liệu sẵn
  return null;
}

async function fetchAnalysis(fen) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fen })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.analysis?.move || null;
  } catch (error) {
    logger.error('Failed to fetch analysis', error);
    return null;
  }
}

function startPolling(boardElement) {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(async () => {
    if (!boardElement.isConnected) {
      stopPolling();
      waitForBoard();
      return;
    }

    const fen = readFen(boardElement);
    if (!fen || fen === lastFen || fen === pendingFen) {
      return;
    }

    pendingFen = fen;
    const move = await fetchAnalysis(fen);
    pendingFen = null;

    if (!move) {
      lastMoveKey = null;
      clearOverlay();
      lastFen = null;
      return;
    }

    lastFen = fen;
    const moveKey = `${move.from}-${move.to}`;
    if (moveKey === lastMoveKey) {
      return;
    }

    lastMoveKey = moveKey;
    highlightMove(boardElement, move);
  }, POLL_INTERVAL);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  if (overlay) {
    overlay.remove();
    overlay = null;
    overlayHost = null;
  }

  if (bestMoveToast && bestMoveToast.isConnected) {
    bestMoveToast.remove();
  }
  bestMoveToast = null;

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  lastFen = null;
  lastMoveKey = null;
  pendingFen = null;
}

function waitForBoard() {
  const boardElement = document.querySelector('chess-board');
  if (boardElement) {
    logger.info('Board detected, initializing');
    startPolling(boardElement);
    return;
  }
  setTimeout(waitForBoard, 1000);
}

waitForBoard();

window.addEventListener('beforeunload', () => {
  stopPolling();
});
