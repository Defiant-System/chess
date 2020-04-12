
ant_require("modules/chess.0.10.3.js");
ant_require("modules/chess-ai.js");

const COLORS = {
	w: "white",
	b: "black",
};

const PIECES = {
	p: "pawn",
	n: "knight",
	b: "bishop",
	r: "rook",
	q: "queen",
	k: "king",
};

const games = {};
let game;

const chess = {
	init() {
		// fast references
		this.board = window.find(".board");
		//window.tabs.add("Second Game");

		//let fen = "r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - c3 0 19";
		//let fen = "2n1r3/p1k2pp1/B1p3b1/P7/5bP1/2N1B3/1P2KP2/2R5 b - - 4 25";
		//let fen = "r2qkbnr/ppp2ppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R b KQkq - 3 7";
		//let fen = "rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3"; // checkmate
		//let fen = "4k3/4P3/4K3/8/8/8/8/8 b - - 0 78"; // draw
		//let fen = "4r3/8/2p2PPk/1p6/pP2p1R1/P1B5/2P2K2/3r4 w - - 1 45";
		//let fen = "4r3/8/2p2PPk/1p6/pP2p2R/P1B5/2P2K2/3r4 b - - 2 45";
		//let fen = "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq e3 0 1";
		let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		//let fen = "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
		this.dispatch({ type: "game-from-fen", fen });

		let move = { from: "e2", to: "e4", color: "w", piece: "p" };
		//setTimeout(() => this.dispatch({ ...move, type: "make-move" }), 500);
	},
	dispatch(event) {
		let self = chess,
			square,
			moves,
			move,
			name,
			htm,
			el;
		switch (event.type) {
			case "output-fen-string":
				console.log(game.fen());
				break;
			case "game-from-fen":
				game = new Chess(event.fen);

				htm = [];
				game.board().map((row, y) => {
					row.map((square, x) => {
						if (!square) return;
						let pos = "abcdefgh".charAt(x) + "87654321".charAt(y);
						htm.push(`<piece class="${COLORS[square.color]}-${PIECES[square.type]} pos-${pos}"></piece>`);
					});
				});
				// update DOM
				self.board.html(htm.join(""));

				// do stuff after move
				self.dispatch({ type: "after-move" });
				break;
			case "focus-piece":
				el = $(event.target);
				name = el.prop("className");
				square = name.match(/pos-(.{2})/)[1];

				if (name.startsWith("can-move pos-")) {
					el = self.board.find(".active");
					name = el.prop("className");

					move = {
						from: name.match(/pos-(.{2})/)[1],
						to: square,
						color: name.slice(0, 1),
						piece: self.getPieceKey(name.match(/-(\w+)/)[1]),
					};
					self.dispatch({ ...move, type: "make-move" });
					return;
				}

				self.board.find(".active").removeClass("active");
				el.addClass("active");
				moves = game.moves({ square, verbose: true });
				
				//moves.map(move => console.log(move));
				htm = moves.map(move => `<piece class="can-move pos-${move.to} ${move.captured ? "piece-capture" : ""}"></piece>`);
				self.board.addClass("can-move-squares").prepend(htm.join(""));
				break;
			case "make-move":
				// reset board
				self.board.find(".move-to-pos, .active").removeClass("move-to-pos active");
				self.board.find(".move-from-pos, .can-move").remove();
				// place holder
				self.board.append(`<piece class="move-from-pos pos-${event.from}"></piece>`);

				piece = self.board.find(`.${COLORS[event.color]}-${PIECES[event.piece]}.pos-${event.from}`);

				piece.cssSequence("moving to-"+ event.to, "transitionend", el => {
						el.addClass("active")
							.removeClass("moving to-"+ event.to +" pos-"+ event.from)
							.addClass("pos-"+ event.to);

						game.move({ from: event.from, to: event.to });

						self.dispatch({ type: "after-move" });
					});
				break;
			case "after-move":
				let turnColor = COLORS[game.turn()];

				// reset kings
				self.board.find(".in-check").removeClass("in-check");

				if (game.in_check()) {
					self.board.find(`.${turnColor}-king`).addClass("in-check");
				}
				if (game.in_checkmate()) {
					console.log("check mate");
				}
				if (game.in_draw()) {
					console.log("draw");
				}
				if (game.in_stalemate()) {
					console.log("stalemate");
				}

				// update window title
				window.title = `Chess (${turnColor} turn)`;

				// reset board
				self.board
					.removeClass("can-move-squares white-turn black-turn")
					.addClass(`${turnColor}-turn`);
				// remove previous possible moves
				self.board.find(".move-to-pos").removeClass("move-to-pos");

				if (turnColor === "black") {
					setTimeout(() => {
						// simple ai move
						let move = AI.makeBestMove();
						self.dispatch({ ...move, type: "make-move" });
					}, 500);
				}
				break;
		}
	},
	getPieceKey(name) {
		for (let key in PIECES) {
			if (PIECES[key] === name) return key;
		}
	}
};

window.exports = chess;
