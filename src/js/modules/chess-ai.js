
const AI = {
	positionCount: 0,
	reverseArray(array) {
		return array.slice().reverse();
	},
	makeBestMove(game) {
		return this.getBestMove(game);
		// let bestMove = game.moves({ verbose: true });
		// return bestMove[Math.floor(Math.random() * bestMove.length)];
	},
	getBestMove(game) {
		this.positionCount = 0;
		let depth = 3,
			bestMove = this.minimaxRoot(depth, game, true);
		return bestMove;
	},
	evaluateBoard(board) {
		let totalEvaluation = 0;
		for (let i=0; i<8; i++) {
			for (let j=0; j<8; j++) {
				totalEvaluation = totalEvaluation + this.getPieceValue(board[i][j], i ,j);
			}
		}
		return totalEvaluation;
	},
	getPieceValue(piece, x, y) {
		if (piece === null) return 0;
		let absoluteValue = this.getAbsoluteValue(piece, piece.color === 'w', x ,y);
		return piece.color === 'w' ? absoluteValue : -absoluteValue;
	},
	getAbsoluteValue(piece, isWhite, x ,y) {
		if (piece.type === 'p') {
			return 10 + ( isWhite ? EVAL.pawnWhite[y][x] : EVAL.pawnBlack[y][x] );
		} else if (piece.type === 'r') {
			return 50 + ( isWhite ? EVAL.rookWhite[y][x] : EVAL.rookBlack[y][x] );
		} else if (piece.type === 'n') {
			return 30 + EVAL.knight[y][x];
		} else if (piece.type === 'b') {
			return 30 + ( isWhite ? EVAL.bishopWhite[y][x] : EVAL.bishopBlack[y][x] );
		} else if (piece.type === 'q') {
			return 90 + EVAL.queen[y][x];
		} else if (piece.type === 'k') {
			return 900 + ( isWhite ? EVAL.kingWhite[y][x] : EVAL.kingBlack[y][x] );
		}
		throw "Unknown piece type: " + piece.type;
	},
	minimax(depth, game, alpha, beta, isMaximisingPlayer) {
		this.positionCount++;
		if (depth === 0) {
			return -this.evaluateBoard(game.board());
		}

		let newGameMoves = game.moves({ verbose: true });
		if (isMaximisingPlayer) {
			let bestMove = -9999;
			for (let i = 0; i < newGameMoves.length; i++) {
				game.move(newGameMoves[i]);
				bestMove = Math.max(bestMove, this.minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
				game.undo();
				alpha = Math.max(alpha, bestMove);
				if (beta <= alpha) {
					return bestMove;
				}
			}
			return bestMove;
		} else {
			let bestMove = 9999;
			for (let i = 0; i < newGameMoves.length; i++) {
				game.move(newGameMoves[i]);
				bestMove = Math.min(bestMove, this.minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
				game.undo();
				beta = Math.min(beta, bestMove);
				if (beta <= alpha) {
					return bestMove;
				}
			}
			return bestMove;
		}
	},
	minimaxRoot(depth, game, isMaximisingPlayer) {
		let newGameMoves = game.moves({ verbose: true }),
			bestMove = -9999,
			bestMoveFound;

		newGameMoves.map(newGameMove => {
			game.move(newGameMove);
			let value = this.minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
			game.undo();
			if (value >= bestMove) {
				bestMove = value;
				bestMoveFound = newGameMove;
			}
		});
		return bestMoveFound;
	}
};

const EVAL = {
	pawnWhite: [
		[0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
		[5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
		[1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
		[0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
		[0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
		[0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
		[0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
		[0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
	],
	knight: [
		[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
		[-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
		[-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
		[-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
		[-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
		[-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
		[-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
		[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
	],
	bishopWhite: [
		[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
		[ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
		[ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
		[ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
		[ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
		[ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
		[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
	],
	rookWhite: [
		[  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
		[  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
	],
	queen: [
		[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
		[ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
		[ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
		[  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
		[ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
	],
	kingWhite: [
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
		[ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
		[  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
		[  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
	]
};

EVAL.pawnBlack   = AI.reverseArray(EVAL.pawnWhite);
EVAL.bishopBlack = AI.reverseArray(EVAL.bishopWhite);
EVAL.rookBlack   = AI.reverseArray(EVAL.rookWhite);
EVAL.kingBlack   = AI.reverseArray(EVAL.kingWhite);

