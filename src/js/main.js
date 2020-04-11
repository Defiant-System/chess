
ant_require("chess.js");

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
		let fen = "4r3/8/2p2PPk/1p6/pP2p2R/P1B5/2P2K2/3r4 b - - 2 45";
		//let fen = "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq e3 0 1";
		//let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		game = new Chess(fen);

		let rows = game.board(),
			turnColor = COLORS[game.turn()],
			htm = [];
		rows.map((row, y) => {
			row.map((square, x) => {
				if (!square) return;
				let pos = "abcdefgh".charAt(x) + "87654321".charAt(y);
				htm.push(`<piece class="${COLORS[square.color]}-${PIECES[square.type]} pos-${pos}"></piece>`);
			});
		});

		this.board
			.addClass(`${turnColor}-turn`)
			.html(htm.join(""));

		// do stuff after move
		this.dispatch({ type: "after-move" });
	},
	dispatch(event) {
		let self = chess,
			turnColor,
			square,
			moves,
			name,
			htm,
			el;
		switch (event.type) {
			case "output-fen-string":
				console.log(game.fen());
				break;
			case "focus-piece":
				el = $(event.target);
				name = el.prop("className");
				square = name.match(/pos-(.{2})/)[1];

				// no operations allowed on opposing pieces
				//if (game.turn() !== name.slice(0, 1)) return;

				// do stuff before move
				self.dispatch({ type: "before-move" });

				if (name.startsWith("can-move pos-")) {
					let captured = el.hasClass("piece-capture") ? self.board.find(`piece.pos-${square}`) : false,
						piece = self.board.find(".active"),
						from = piece.prop("className").match(/pos-(.{2})/)[1],
						to = square,
						valid = game.move({ from, to });
					
					// throw error if invalid move
					if (!valid) throw "invalid move";

					self.board.append(`<piece class="from-pos pos-${from}"></piece>`);

					piece.removeClass("active")
						.cssSequence("to-"+ to, "transitionend", el => {
							if (captured.length) {
								captured.remove();
							}
							el.addClass("to-pos")
								.removeClass("to-"+ to +" pos-"+ from)
								.addClass("pos-"+ to);
						});

					// do stuff after move
					self.dispatch({ type: "after-move" });
					return;
				}

				self.board.find(".active").removeClass("active");
				el.addClass("active");
				moves = game.moves({ square, verbose: true });

				//moves.map(move => console.log(move));
				htm = moves.map(move => `<piece class="can-move pos-${move.to} ${move.captured ? "piece-capture" : ""}"></piece>`);
				self.board.append(htm.join(""));
				break;
			case "reset-move":
				self.board.find(".active").removeClass("active");
				self.board.find(".can-move").remove();
				break;
			case "before-move":
				// remove previous possible moves
				self.board.find(".to-pos").removeClass("to-pos");
				self.board.find(".from-pos").remove();
				self.board.find(".can-move").remove();
				break;
			case "after-move":
				turnColor = COLORS[game.turn()];

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
					.removeClass("white-turn black-turn")
					.addClass(`${turnColor}-turn`);
				break;
		}
	}
};

window.exports = chess;
