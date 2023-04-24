
@import "modules/chess.0.10.3.js";
@import "modules/pgn-parser.js";


const FILES = "abcdefgh";
const RANKS = "87654321";
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

let game;
let pgn = ``;



const chess = {
	init() {
		// fast references
		this.els = {
			board: window.find(".board"),
			ghost: window.find(".ghost-pieces"),
			history: window.find(".move-history"),
			hBtnStart: window.find("[data-click='history-go-start']"),
			hBtnPrev: window.find("[data-click='history-go-prev']"),
			hBtnNext: window.find("[data-click='history-go-next']"),
			hBtnEnd: window.find("[data-click='history-go-end']"),
		};

		// temp
		this.dispatch({ type: "new-game" });
	},
	dispatch(event) {
		let Self = chess,
			orientation,
			files = FILES,
			ranks = RANKS,
			board,
			name,
			value,
			htm,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "new-game":
				Self.dispatch({
					type: "game-from-fen",
					fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
				});
				break;
			case "game-from-fen":
				el = Self.els.board.parent();
				game = new Chess(event.fen);
				orientation = Self.els.board.parent().data("orientation");

				if (orientation === "black") {
					files = files.split("").reverse().join("");
					ranks = ranks.split("").reverse().join("");
				}

				htm = [];
				game.board().map((row, y) => {
					row.map((square, x) => {
						if (!square) return;
						let pos = files.charAt(x) + ranks.charAt(y);
						htm.push(`<piece class="${COLORS[square.color]}-${PIECES[square.type]} pos-${pos}"></piece>`);
					});
				});
				// update DOM
				Self.els.board.html(htm.join(""));
				break;
		}
	}
};

window.exports = chess;
