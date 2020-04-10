
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
		games[1] = new Chess(fen);

		let rows = games[1].board(),
			turnColor = COLORS[games[1].turn()],
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
		let square,
			moves,
			name,
			el;
		switch (event.type) {
			case "focus-piece":
				el = $(event.target);
				name = el.prop("className");
				square = name.match(/pos-(.{2})/)[1];
				moves = games[1].moves({ square });

				console.log( moves );
				break;
		}
	}
};

window.exports = chess;
