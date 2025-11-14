const API_URL = 'https://www.chesshub.com/api/v2/fens.json';
const BOARD_HOME_URL = 'https://www.chesshub.com/';
const POLL_INTERVAL = 2000;
const CSRF_REFRESH_INTERVAL = 5 * 60 * 1000;
const BOARD_SELECTORS = [
  'cg-board',
  'chess-board',
  'chess-board-component',
  '.board-layout-main .board',
  '.board-layout-board',
  '.board-area .board',
  '.board'
];

let lastFen = null;
let lastMoveKey = null;
let overlay = null;
let overlayHost = null;
let boardObserver = null;
let pollTimer = null;
let resizeObserver = null;
let pendingFen = null;
let activeBoard = null;
let csrfToken = null;
let csrfPromise = null;
let lastCsrfRefresh = 0;

const logger = {
  info: (...args) => console.info('[ChessHub]', ...args),
  warn: (...args) => console.warn('[ChessHub]', ...args),
  error: (...args) => console.error('[ChessHub]', ...args)
};

function getOverlayHost(boardElement) {
  const preferred = boardElement.closest?.('.board-layout-board, .board-area, .board-container, .board-wrapper, .board');
  const host = preferred || boardElement.parentElement || boardElement;
  const computed = window.getComputedStyle(host);
  if (computed.position === 'static') {
    host.style.position = 'relative';
  }
  return host;
}

function ensureOverlay(boardElement) {
  if (!boardElement) {
    return null;
  }
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
  overlay.style.zIndex = '10';
  host.appendChild(overlay);
  return overlay;
}

function clearOverlay() {
  if (!overlay) {
    return;
  }
  overlay.replaceChildren();
}

function updateOverlayGeometry(boardElement) {
  if (!overlay || !boardElement) {
    return;
  }
  const hostRect = overlayHost?.getBoundingClientRect();
  const boardRect = boardElement.getBoundingClientRect();
  if (!hostRect) {
    overlay.style.left = '0';
    overlay.style.top = '0';
  } else {
    overlay.style.left = `${boardRect.left - hostRect.left}px`;
    overlay.style.top = `${boardRect.top - hostRect.top}px`;
  }
  overlay.style.width = `${boardRect.width}px`;
  overlay.style.height = `${boardRect.height}px`;
}

function algebraicToIndices(square, orientation) {
  if (!square || square.length !== 2) {
    return null;
  }
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    return null;
  }
  if (orientation === 'black') {
    return { x: 7 - file, y: rank };
  }
  return { x: file, y: 7 - rank };
}

function detectOrientation(boardElement) {
  if (!boardElement) {
    return 'white';
  }
  const orientationSource = boardElement.closest?.('[data-orientation], [orientation], .board-layout, .board-area');
  const sourceAttr = orientationSource?.getAttribute?.('data-orientation') ||
    orientationSource?.getAttribute?.('orientation');
  if (sourceAttr === 'black' || sourceAttr === 'white') {
    return sourceAttr;
  }
  const classCandidates = [boardElement, orientationSource].filter(Boolean);
  for (const candidate of classCandidates) {
    if (candidate.classList?.contains('orientation-black') ||
      candidate.classList?.contains('board-flipped') ||
      candidate.classList?.contains('flipped') ||
      candidate.classList?.contains('flip')) {
      return 'black';
    }
  }
  return 'white';
}

function highlightMove(boardElement, move) {
  if (!move || !move.from || !move.to) {
    clearOverlay();
    return;
  }
  const orientation = detectOrientation(boardElement);
  const layer = ensureOverlay(boardElement);
  if (!layer) {
    return;
  }
  updateOverlayGeometry(boardElement);
  const boardRect = boardElement.getBoundingClientRect();
  const squareWidth = boardRect.width / 8;
  const squareHeight = boardRect.height / 8;
  clearOverlay();
  logger.info('Highlighting move', move);
  const squares = [
    { square: move.from, className: 'chesshub-highlight-from' },
    { square: move.to, className: 'chesshub-highlight-to' }
  ];
  squares.forEach(({ square, className }) => {
    const indices = algebraicToIndices(square, orientation);
    if (!indices) {
      return;
    }
    const highlight = document.createElement('div');
    highlight.className = `chesshub-highlight ${className}`;
    highlight.style.position = 'absolute';
    highlight.style.width = `${squareWidth}px`;
    highlight.style.height = `${squareHeight}px`;
    highlight.style.left = `${indices.x * squareWidth}px`;
    highlight.style.top = `${indices.y * squareHeight}px`;
    layer.appendChild(highlight);
  });
  const label = document.createElement('div');
  label.className = 'chesshub-label';
  label.textContent = `${move.from.toUpperCase()} → ${move.to.toUpperCase()}`;
  layer.appendChild(label);
}

function pieceClassToFenToken(classList) {
  for (const cls of classList) {
    if (/^[wb][kqrbnp]$/.test(cls)) {
      const color = cls[0];
      const piece = cls[1];
      const fenPiece = {
        p: 'p',
        n: 'n',
        b: 'b',
        r: 'r',
        q: 'q',
        k: 'k'
      }[piece];
      if (!fenPiece) {
        continue;
      }
      return color === 'w' ? fenPiece.toUpperCase() : fenPiece;
    }
  }
  return null;
}

function buildFenFromPieces(boardElement) {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const pieces = boardElement.querySelectorAll('.piece');
  pieces.forEach(piece => {
    const classes = piece.className.split(/\s+/).filter(Boolean);
    const squareClass = classes.find(cls => cls.startsWith('square-'));
    const match = squareClass && squareClass.match(/^square-([1-8])([1-8])$/);
    const fenPiece = pieceClassToFenToken(classes);
    if (!match || !fenPiece) {
      return;
    }
    const rankIndex = parseInt(match[1], 10) - 1;
    const fileIndex = parseInt(match[2], 10) - 1;
    if (rankIndex < 0 || rankIndex > 7 || fileIndex < 0 || fileIndex > 7) {
      return;
    }
    board[rankIndex][fileIndex] = fenPiece;
  });
  const rows = [];
  for (let rankIndex = 7; rankIndex >= 0; rankIndex -= 1) {
    let row = '';
    let empty = 0;
    for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
      const piece = board[rankIndex]?.[fileIndex];
      if (!piece) {
        empty += 1;
      } else {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        row += piece;
      }
    }
    if (empty > 0) {
      row += empty;
    }
    rows.push(row || '8');
  }
  const fenPlacement = rows.join('/');
  return `${fenPlacement} w - - 0 1`;
}

function readFen(boardElement) {
  if (!boardElement) {
    return null;
  }
  if (window?.ChessCom?.liveGame?.fen) {
    return String(window.ChessCom.liveGame.fen).trim();
  }
  if (window?.liveGame?.fen) {
    return String(window.liveGame.fen).trim();
  }
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
  try {
    return buildFenFromPieces(boardElement);
  } catch (error) {
    logger.error('Failed to build FEN from pieces', error);
    return null;
  }
}

async function fetchCsrfToken() {
  if (csrfPromise) {
    return csrfPromise;
  }
  csrfPromise = (async () => {
    try {
      const response = await fetch(BOARD_HOME_URL, {
        credentials: 'include',
        mode: 'cors'
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      const match = text.match(/<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"/i);
      csrfToken = match ? match[1] : null;
    } catch (error) {
      logger.warn('Unable to refresh ChessHub CSRF token', error);
      csrfToken = null;
    } finally {
      lastCsrfRefresh = Date.now();
      csrfPromise = null;
    }
    return csrfToken;
  })();
  return csrfPromise;
}

async function fetchAnalysis(fen) {
  if (!fen) {
    return null;
  }
  let attempts = 0;
  try {
    while (attempts < 2) {
      attempts += 1;
      if (!csrfToken && Date.now() - lastCsrfRefresh > CSRF_REFRESH_INTERVAL) {
        await fetchCsrfToken();
      }
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      };
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ fen })
      });
      if (response.status === 403 || response.status === 401) {
        csrfToken = null;
        lastCsrfRefresh = 0;
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data?.analysis?.move || null;
    }
    return null;
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
  if (resizeObserver && overlayHost) {
    resizeObserver.unobserve(overlayHost);
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (overlay) {
    overlay.remove();
    overlay = null;
    overlayHost = null;
  }
  if (boardObserver) {
    boardObserver.disconnect();
    boardObserver = null;
  }
  lastFen = null;
  lastMoveKey = null;
  pendingFen = null;
  activeBoard = null;
}

function handleBoard(boardElement) {
  if (!boardElement) {
    stopPolling();
    clearOverlay();
    return;
  }
  if (activeBoard === boardElement) {
    return;
  }
  activeBoard = boardElement;
  startPolling(boardElement);
  if (boardObserver) {
    boardObserver.disconnect();
  }
  boardObserver = new MutationObserver(() => {
    const fen = readFen(boardElement);
    if (fen && fen !== lastFen) {
      lastFen = null;
      lastMoveKey = null;
      pendingFen = null;
    }
    updateOverlayGeometry(boardElement);
  });
  boardObserver.observe(boardElement, { childList: true, subtree: true, attributes: true });
  const host = getOverlayHost(boardElement);
  if (host) {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    resizeObserver = new ResizeObserver(() => {
      updateOverlayGeometry(boardElement);
    });
    resizeObserver.observe(host);
  }
  updateOverlayGeometry(boardElement);
}

function findBoardElement() {
  for (const selector of BOARD_SELECTORS) {
    const element = document.querySelector(selector);
    if (element) {
      if (element.matches?.('cg-board')) {
        return element;
      }
      if (element.querySelector?.('cg-board')) {
        return element.querySelector('cg-board');
      }
      if (element.querySelector?.('.piece, piece')) {
        return element;
      }
    }
  }
  return null;
}

function waitForBoard() {
  const boardElement = findBoardElement();
  if (boardElement) {
    logger.info('Board detected, initializing');
    handleBoard(boardElement);
    return;
  }
  setTimeout(waitForBoard, 1000);
}

waitForBoard();

window.addEventListener('beforeunload', () => {
  stopPolling();
  if (boardObserver) {
    boardObserver.disconnect();
    boardObserver = null;
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
