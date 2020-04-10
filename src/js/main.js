
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
		//let fen = "rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3";
		//let fen = "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq e3 0 1";
		//let fen = "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq e3 0 1";
		let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
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
	},
	dispatch(event) {
		let self = chess,
			square,
			moves,
			name,
			htm,
			el;
		switch (event.type) {
			case "focus-piece":
				el = $(event.target);
				name = el.prop("className");
				square = name.match(/pos-(.{2})/)[1];

				// remove previous possible moves
				self.board.find(".can-move").remove();

				if (name.startsWith("can-move pos-")) {
					let piece = self.board.find(".active"),
						from = piece.prop("className").match(/pos-(.{2})/)[1],
						to = square,
						valid = game.move({ from, to });
					
					// throw error if invalid move
					if (!valid) throw "invalid move";

					piece.removeClass("active")
						.cssSequence("to-"+ to, "transitionend", el => {
							el.removeClass("to-"+ to +" pos-"+ from)
								.addClass("pos-"+ to);
						});

					let turnColor = COLORS[game.turn()];
					self.board
						.removeClass("white-turn black-turn")
						.addClass(`${turnColor}-turn`);
					return;
				}

				self.board.find(".active").removeClass("active");
				el.addClass("active");
				moves = game.moves({ square });

				htm = moves.map(move => `<piece class="can-move pos-${move.slice(-2)}"></piece>`);
				self.board.append(htm.join(""));
				break;
		}
	}
};

window.exports = chess;
