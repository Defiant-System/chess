
const AI = {
	makeBestMove() {
		var bestMove = this.uglyMoves();
		return bestMove[Math.floor(Math.random() * bestMove.length)];
	},
	uglyMoves() {
		return game.moves({ verbose: true });
	}
};

/*
const AI = {
	positionCount: 0,
	reverseArray(array) {
		return array.slice().reverse();
	},
	minimaxRoot(depth, game, isMaximisingPlayer) {
		let newGameMoves = this.uglyMoves(),
			bestMove = -9999,
			bestMoveFound;

		newGameMoves.map(newGameMove => {
			this.uglyMove(newGameMove);
			// let value = this.minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
			// game.undo();
			// if(value >= bestMove) {
			// 	bestMove = value;
			// 	bestMoveFound = newGameMove;
			// }
		});
		return bestMoveFound;
	},
	minimax(depth, game, alpha, beta, isMaximisingPlayer) {
		this.positionCount++;
		if (depth === 0) {
			return -evaluateBoard(game.board());
		}

		var newGameMoves = this.uglyMoves();

		if (isMaximisingPlayer) {
			var bestMove = -9999;
			for (var i = 0; i < newGameMoves.length; i++) {
				this.uglyMove(newGameMoves[i]);
				bestMove = Math.max(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
				game.undo();
				alpha = Math.max(alpha, bestMove);
				if (beta <= alpha) {
					return bestMove;
				}
			}
			return bestMove;
		} else {
			var bestMove = 9999;
			for (var i = 0; i < newGameMoves.length; i++) {
				this.uglyMove(newGameMoves[i]);
				bestMove = Math.min(bestMove, minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
				game.undo();
				beta = Math.min(beta, bestMove);
				if (beta <= alpha) {
					return bestMove;
				}
			}
			return bestMove;
		}
	},
	evaluateBoard(board) {
		var totalEvaluation = 0;
		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
			}
		}
		return totalEvaluation;
	},
	getPieceValue(piece, x, y) {
		if (piece === null) {
			return 0;
		}
		var getAbsoluteValue = function (piece, isWhite, x ,y) {
			if (piece.type === 'p') {
				return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
			} else if (piece.type === 'r') {
				return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
			} else if (piece.type === 'n') {
				return 30 + knightEval[y][x];
			} else if (piece.type === 'b') {
				return 30 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
			} else if (piece.type === 'q') {
				return 90 + evalQueen[y][x];
			} else if (piece.type === 'k') {
				return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
			}
			throw "Unknown piece type: " + piece.type;
		};

		var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
		return piece.color === 'w' ? absoluteValue : -absoluteValue;
	},
	makeBestMove() {
		var bestMove = this.getBestMove(game);
		//this.uglyMoves(bestMove);
		//board.position(game.fen());
		//renderMoveHistory(game.history());
		// if (game.game_over()) {
		// 	alert('Game over');
		// }
	},
	getBestMove(game) {
		//if (game.game_over()) alert('Game over');

		this.positionCount = 0;
		var depth = 3;
		var d = new Date().getTime();
		var bestMove = this.minimaxRoot(depth, game, true);
		var d2 = new Date().getTime();
		var moveTime = (d2 - d);
		var positionsPerS = ( this.positionCount * 1000 / moveTime);

		//$('#position-count').text(this.positionCount);
		//$('#time').text(moveTime/1000 + 's');
		//$('#positions-per-s').text(positionsPerS);
		return bestMove;
	},
	uglyMoves() {
		return game.moves({ verbose: true });
	},
	uglyMove() {

	}
};

var pawnEvalWhite = [
		[0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
		[5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
		[1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
		[0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
		[0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
		[0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
		[0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
		[0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
	];

var pawnEvalBlack = AI.reverseArray(pawnEvalWhite);

var knightEval = [
		[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
		[-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
		[-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
		[-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
		[-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
		[-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
		[-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
		[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
	];

var bishopEvalWhite = [
		[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
		[ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
		[ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
		[ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
		[ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
		[ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
		[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
	];

var bishopEvalBlack = AI.reverseArray(bishopEvalWhite);

var rookEvalWhite = [
	[  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
	[  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
	[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
	[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
	[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
	[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
	[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
	[  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = AI.reverseArray(rookEvalWhite);

var evalQueen = [
	[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
	[ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
	[ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
	[ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
	[  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
	[ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
	[ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
	[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

	[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
	[ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
	[  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
	[  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = AI.reverseArray(kingEvalWhite);
*/
