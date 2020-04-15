
ant_require("modules/chess.0.10.3.js");
ant_require("modules/chess-ai.js");

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
		//let fen = "7k/6R1/8/1p6/pP6/P1B5/2P2K1p/8 b - - 1 48";
		//let fen = "4r3/5P2/2p5/1p5k/QP2p1R1/P1B5/2P2K1p/3r4 w - - 1 48";
		//let fen = "r3k2r/p7/3b1p2/2NP3p/2Q5/8/PPPB1PPP/R3K2R w KQk - 1 17";
		//let fen = "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq e3 0 1";
		//let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		//let fen = "rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
		let fen = "N3R3/1kPp4/8/6bp/8/8/PPP2PPP/R5K1 w - - 3 26";
		this.dispatch({ type: "game-from-fen", fen });

		//let move = { from: "e2", to: "e4", color: "w", piece: "p" };
		// let move = { from: "h6", to: "g6", color: "b", piece: "k" };
		// setTimeout(() => this.dispatch({ ...move, type: "make-move" }), 500);
		
		// let move = { from: "h7", to: "h8", color: "w", piece: "p" };
		// console.log( this.isPromotion(move) );
		
		// let move = { from: "e1", to: "g1", color: "w", piece: "k" };
		// console.log( this.isCastling(move) );
	},
	dispatch(event) {
		let self = chess,
			orientation,
			files = FILES,
			ranks = RANKS,
			square,
			moves,
			move,
			name,
			htm,
			el;
		//console.log(event);
		switch (event.type) {
			case "output-fen-string":
				console.log(game.fen());
				break;
			case "do-option-button":
				console.log(event);
				break;
			case "game-from-fen":
				el = self.board.parent();
				game = new Chess(event.fen);
				orientation = self.board.parent().data("orientation");

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
				self.board.html(htm.join(""));

				// do stuff after move
				self.dispatch({ type: "after-move" });
				break;
			case "rotate-board":
				el = self.board.parent();
				orientation = el.data("orientation");
				el.data("orientation", orientation === "white" ? "black" : "white");
				break;
			case "reset-board":
				self.board.find(".active, .castling-rook").removeClass("active castling-rook");
				self.board.find(".can-move").remove();
				self.board.removeClass("can-move-squares");
				break;
			case "focus-piece":
				el = $(event.target);
				name = el.prop("className");
				square = name.match(/pos-(.{2})/)[1];

				if (~name.indexOf("castling-rook")) {
					move = {
						from: el.data("from"),
						to: el.data("to"),
						color: el.data("color"),
						piece: "k",
					};
					return self.dispatch({ ...move, type: "make-move" });
				}
				
				if (name.startsWith("can-move pos-")) {
					el = self.board.find(".active");
					name = el.prop("className");

					move = {
						from: name.match(/pos-(.{2})/)[1],
						to: square,
						color: name.slice(0, 1),
						piece: self.getPieceKey(name.match(/-(\w+)/)[1]),
					};
					return self.dispatch({ ...move, type: "make-move" });
				}

				self.board.find(".active").removeClass("active");
				el.addClass("active");
				moves = game.moves({ square, verbose: true });

				htm = moves.map(move => `<piece class="can-move pos-${move.to} ${move.captured ? "piece-capture" : ""}"></piece>`);

				// check if moves enables castling
				moves.map(move => {
					let castle = self.isCastling(move);
					if (!castle) return;
					htm.push(`<piece class="can-move pos-${castle.from} castling-rook" data-from="${move.from}" data-to="${move.to}" data-color="${move.color}"></piece>`);
				});

				self.board.addClass("can-move-squares").prepend(htm.join(""));
				break;
			case "make-move":
				if (!event.from || !event.to) {
					self.dispatch({ type: "after-move" });
				}
				// reset board
				self.board.find(".move-to-pos, .active").removeClass("move-to-pos active");
				self.board.find(".move-from-pos, .can-move").remove();
				// place holder
				self.board.append(`<piece class="move-from-pos pos-${event.from}"></piece>`);

				let castle = self.isCastling(event);
				if (castle) {
					self.board
						.find(`.${COLORS[castle.color]}-${PIECES[castle.piece]}.pos-${castle.from}`)
						.cssSequence("moving to-"+ castle.to, "transitionend", el => {
								el.removeClass("moving to-"+ castle.to +" pos-"+ castle.from)
									.addClass("pos-"+ castle.to);
							});
				}

				piece = self.board.find(`.${COLORS[event.color]}-${PIECES[event.piece]}.pos-${event.from}`);

				piece.cssSequence("moving to-"+ event.to, "transitionend", el => {
						el.addClass("active")
							.removeClass("moving to-"+ event.to +" pos-"+ event.from)
							.addClass("pos-"+ event.to);

						let move = { ...event },
							isPromotion = event.piece === "p" && self.isPromotion(move);

						if (isPromotion) {
							// save move
							self.moveAfterPromotion = move;
							// clean up move object
							delete move.type;
							// hide possible captured piece
							self.board.find(`piece.pos-${move.to}:not(.${COLORS[move.color]}-${PIECES[move.piece]})`).addClass("hidden");

							// if move made by AI
							if (move.color === "b") {
								move.name = "queen";
								return self.dispatch({ ...move, type: "promote-pawn" });
							}
							
							// show lightbox
							return self.board.parent().addClass("show-pawn-promotion");
						}

						let res = game.move(move);
						if (res && res.captured) {
							let cc = res.color === "w" ? "b" : "w";
							// remove captured piece
							self.board.find(`piece.pos-${res.to}.${COLORS[cc]}-${PIECES[res.captured]}`).remove();
						}

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
					return console.log("check mate");
				}
				if (game.in_draw()) {
					return console.log("draw");
				}
				if (game.in_stalemate()) {
					return console.log("stalemate");
				}

				// update window title
				window.title = `Chess (${turnColor} turn)`;

				// reset board
				self.board
					.removeClass("can-move-squares white-turn black-turn")
					.addClass(`${turnColor}-turn`);
				// remove previous possible moves
				self.board.find(".move-to-pos, .castling-rook").removeClass("move-to-pos castling-rook");

				if (turnColor === "black") {
					setTimeout(() => {
						// simple ai move
						let move = AI.makeBestMove();
						self.dispatch({ ...move, type: "make-move" });
					}, 500);
				}
				break;
			case "promote-pawn":
				name = event.name || event.target.className.split("-")[0];
				move = self.moveAfterPromotion;
				move.promotion = self.getPieceKey(name);
				// clean up
				delete self.moveAfterPromotion;
				// hide lightbox
				self.board.parent().removeClass("show-pawn-promotion");

				let res = game.move(move);
				if (res && res.captured) {
					let cc = res.color === "w" ? "b" : "w";
					// remove captured piece
					self.board.find(`piece.pos-${res.to}.${COLORS[cc]}-${PIECES[res.captured]}`).remove();
				}
				// update pawn piece
				piece = self.board.find(`.${COLORS[move.color]}-${PIECES[move.piece]}.pos-${move.to}`);
				piece.prop("className", `${COLORS[move.color]}-${name} pos-${move.to}`);
				piece.addClass("active");

				self.dispatch({ type: "after-move" });
				break;
		}
	},
	getPieceKey(name) {
		for (let key in PIECES) {
			if (PIECES[key] === name) return key;
		}
	},
	isCastling(move) {
		if (move.piece !== "k") return;
		if (game.turn() === "w" && move.color === "w") {
			if (move.from === "e1" && move.to === "g1") {
				return { piece: "r", color: "w", from: "h1", to: "f1" };
			}
			if (move.from === "e1" && move.to === "c1") {
				return { piece: "r", color: "w", from: "a1", to: "d1" };
			}
		}
		if (game.turn() === "b" && move.color === "b") {
			if (move.from === "e8" && move.to === "g8") {
				return { piece: "r", color: "b", from: "h8", to: "f8" };
			}
			if (move.from === "e1" && move.to === "c1") {
				return { piece: "r", color: "b", from: "a8", to: "d8" };
			}
		}
	},
	isPromotion(move) {
		if (move.piece !== "p") return;
		let bPromo = game.turn() === "b"
					&& move.color === "b"
					&& move.from.charAt(1) === "2"
					&& move.to.charAt(1) === "1";
		let wPromo = game.turn() === "w"
					&& move.color === "w"
					&& move.from.charAt(1) === "7"
					&& move.to.charAt(1) === "8";
		return bPromo || wPromo;
	}
};

window.exports = chess;
