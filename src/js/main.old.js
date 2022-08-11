
@import "modules/chess.0.10.3.js";
@import "modules/chess-ai.js";
@import "modules/pgn-parser.js";
@import "modules/chat.js";

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

/*
2n1r3/p1k2pp1/B1p3b1/P7/5bP1/2N1B3/1P2KP2/2R5 b - - 4 25
4r3/p2k1pp1/3n2b1/PN6/6P1/4P3/1P2K3/2R5 w - - 1 29
r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - c3 0 19
r2qkbnr/ppp2ppp/2n5/1B2pQ2/4P3/8/PPP2PPP/RNB1K2R b KQkq - 3 7
4r3/8/2p2PPk/1p6/pP2p1R1/P1B5/2P2K2/3r4 w - - 1 45
7k/6R1/8/1p6/pP6/P1B5/2P2K1p/8 b - - 1 48
4r3/5P2/2p5/1p5k/QP2p1R1/P1B5/2P2K1p/3r4 w - - 1 48
r3k2r/p7/3b1p2/2NP3p/2Q5/8/PPPB1PPP/R3K2R w KQk - 1 17
r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq e3 0 1
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1
N3R3/1kPp4/8/6bp/8/8/PPP2PPP/R5K1 w - - 3 26

// checkmate
rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3

// draw
4k3/4P3/4K3/8/8/8/8/8 b - - 0 78
*/


const chess = {
	init() {
		// fast references
		this.el = {
			board: window.find(".board"),
			ghost: window.find(".ghost-pieces"),
			history: window.find(".move-history"),
			hBtnStart: window.find("[data-click='history-go-start']"),
			hBtnPrev: window.find("[data-click='history-go-prev']"),
			hBtnNext: window.find("[data-click='history-go-next']"),
			hBtnEnd: window.find("[data-click='history-go-end']"),
		};
		// create history stack
		this.history = new window.History;
		
		// init objects
		AI.init();
		CHAT.init();

		//window.tabs.add("Second Game");
		
		this.dispatch({ type: "new-game" });
		//this.dispatch({ type: "game-from-fen", fen });
		//this.dispatch({ type: "game-from-pgn", pgn });
	},
	dispatch(event) {
		let Self = chess,
			orientation,
			files = FILES,
			ranks = RANKS,
			board,
			fen,
			square,
			piece,
			moves,
			move,
			name,
			item,
			htm,
			el;
		//console.log(event);
		switch (event.type) {
			// system events
			case "window.keystroke":
				return CHAT.dispatch(event);
			// custom events
			case "new-game":
				fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
				Self.dispatch({ type: "game-from-fen", fen });
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			case "engine-interface":
				defiant.shell("fs -u '~/help/engine-interface.md'");
				break;
			case "output-fen-string":
				console.log(game.fen());
				break;
			case "output-history-array":
				console.log(JSON.stringify(Self.history.stack));
				//console.log( game.history({ verbose: true }) );
				break;
			case "output-game-pgn":
				console.log( game.pgn() );
				break;
			case "game-from-pgn":
				// populate history
				PGN.parse(pgn).map(move => Self.history.push(move));
				Self.dispatch({ type: "render-history-list" });

				game = new Chess();
				game.load_pgn(event.pgn);
				Self.dispatch({ type: "game-from-fen", fen: game.fen() });

				if (Self.history.current) {
					item = Self.history.current;
					Self.el.board.append(`<piece class="move-from-pos pos-${item.from}"></piece>`);
					Self.el.board.find(`.pos-${item.to}`).addClass("active");
					Self.el.history.find(".move:last").addClass("active");
				}
				break;
			case "game-from-fen":
				el = Self.el.board.parent();
				game = new Chess(event.fen);
				orientation = Self.el.board.parent().data("orientation");

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
				Self.el.board.html(htm.join(""));

				// do stuff after move
				Self.dispatch({ type: "after-move" });
				break;
			case "rotate-board":
				el = Self.el.board.parent();
				orientation = el.data("orientation");
				el.data("orientation", orientation === "white" ? "black" : "white");
				break;
			case "reset-board":
				Self.el.board.find(".active, .castling-rook").removeClass("active castling-rook");
				Self.el.board.find(".can-move").remove();
				Self.el.board.removeClass("can-move-squares");
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
					return Self.dispatch({ ...move, type: "make-move" });
				}
				
				if (name.startsWith("can-move pos-")) {
					el = Self.el.board.find(".active");
					name = el.prop("className");

					move = {
						from: name.match(/pos-(.{2})/)[1],
						to: square,
						color: name.slice(0, 1),
						piece: Self.getPieceKey(name.match(/-(\w+)/)[1]),
					};
					return Self.dispatch({ ...move, type: "make-move" });
				}

				Self.el.board.find(".active").removeClass("active");
				el.addClass("active");
				moves = game.moves({ square, verbose: true });

				htm = moves.map(move => `<piece class="can-move pos-${move.to} ${move.captured ? "piece-capture" : ""}"></piece>`);

				// check if moves enables castling
				moves.map(move => {
					let castle = Self.isCastling(move);
					if (!castle) return;
					htm.push(`<piece class="can-move pos-${castle.from} castling-rook" data-from="${move.from}" data-to="${move.to}" data-color="${move.color}"></piece>`);
				});

				Self.el.board.addClass("can-move-squares").prepend(htm.join(""));
				break;
			case "make-move":
				if (!event.from || !event.to) {
					Self.dispatch({ type: "after-move" });
				}
				// reset board
				Self.el.board.find(".move-to-pos, .in-check, .active").removeClass("move-to-pos in-check active");
				Self.el.board.find(".move-from-pos, .can-move").remove();
				// place holder
				Self.el.board.append(`<piece class="move-from-pos pos-${event.from}"></piece>`);

				let castle = Self.isCastling(event);
				if (castle) {
					Self.el.board
						.find(`.${COLORS[castle.color]}-${PIECES[castle.piece]}.pos-${castle.from}`)
						.cssSequence("moving to-"+ castle.to, "transitionend", el => {
								el.removeClass("moving to-"+ castle.to +" pos-"+ castle.from)
									.addClass("pos-"+ castle.to);
							});
				}

				piece = Self.el.board.find(`.${COLORS[event.color]}-${PIECES[event.piece]}.pos-${event.from}`);

				piece.cssSequence("moving to-"+ event.to, "transitionend", el => {
						el.addClass("active")
							.removeClass("moving to-"+ event.to +" pos-"+ event.from)
							.addClass("pos-"+ event.to);

						let move = { ...event },
							isPromotion = event.piece === "p" && Self.isPromotion(move);

						if (isPromotion) {
							// save move
							Self.moveAfterPromotion = move;
							// clean up move object
							delete move.type;
							// hide possible captured piece
							Self.el.board.find(`piece.pos-${move.to}:not(.${COLORS[move.color]}-${PIECES[move.piece]})`).addClass("hidden");

							// if move made by AI
							if (move.color === "b") {
								move.name = "queen";
								return Self.dispatch({ ...move, type: "promote-pawn" });
							}
							
							// show lightbox
							return Self.el.board.parent().addClass("show-pawn-promotion");
						}

						let res = game.move(move);
						if (res && res.captured) {
							let cc = res.color === "w" ? "b" : "w";
							// remove captured piece
							Self.el.board.find(`piece.pos-${res.to}.${COLORS[cc]}-${PIECES[res.captured]}`).remove();
						}

						Self.dispatch({ ...move, type: "after-move" });
					});
				break;
			case "after-move":
				let turnColor = COLORS[game.turn()];

				if (event.from || event.to) {
					move = event;
					move.fen = game.fen();
					delete move.type;
					
					// push move to history
					Self.history.push(move);

					// update move history list
					Self.el.history
						.append(`<span class="move"><piece class="${COLORS[event.color]}-${PIECES[event.piece]}"></piece>${event.to}</span>`)
						.scrollTop(1e5);
					
					Self.dispatch({ type: "update-history-list" });
				}

				// reset kings
				Self.el.board.find(".in-check").removeClass("in-check");

				if (game.in_check()) {
					Self.el.board.find(`.${turnColor}-king`).addClass("in-check");
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
				Self.el.board
					.removeClass("can-move-squares white-turn black-turn")
					.addClass(`${turnColor}-turn`);
				// remove previous possible moves
				Self.el.board.find(".move-to-pos, .castling-rook").removeClass("move-to-pos castling-rook");

				if (turnColor === "black") {
					// simple ai move
					AI.makeBestMove({ level: 1, fen: game.fen(), callback: bestMove => {
						let from = bestMove.slice(0, 2),
							to = bestMove.slice(2),
							el = Self.el.board.find(".pos-"+ from),
							name = el.prop("classList")[0].split("-"),
							color = Self.getColorKey(name[0]),
							piece = Self.getPieceKey(name[1]),
							move = { from, to, color, piece };
						Self.dispatch({ type: "make-move", ...move });
					}});
				}
				break;
			case "render-history-list":
				htm = Self.history.stack.map(entry => {
					let piece = entry.piece;
					return `<span class="move"><piece class="${COLORS[entry.color]}-${PIECES[piece]}"></piece>${entry.to}</span>`;
				});
				Self.el.history
					.html(htm.join())
					.scrollTop(1e5);
				break;
			case "update-history-list":
				Self.el.history.find(".active").removeClass("active");
				Self.el.history.find(".move").get(Self.history.index).addClass("active");

				Self.el.hBtnStart.toggleClass("disabled", Self.history.canGoBack);
				Self.el.hBtnPrev.toggleClass("disabled", Self.history.canGoBack);
				Self.el.hBtnNext.toggleClass("disabled", Self.history.canGoForward);
				Self.el.hBtnEnd.toggleClass("disabled", Self.history.canGoForward);
				break;
			case "history-entry-go":
				el = $(event.target);
				if (!el.hasClass("move")) return;
				Self.history.go(el.index());
				Self.dispatch({ type: "history-entry-render" });
				break;
			case "history-go-start":
				Self.history.go(0);
				Self.dispatch({ type: "history-entry-render" });
				break;
			case "history-go-prev":
				Self.history.go(Self.history.index - 1);
				Self.dispatch({ type: "history-entry-render" });
				break;
			case "history-go-next":
				Self.history.go(Self.history.index + 1);
				Self.dispatch({ type: "history-entry-render" });
				break;
			case "history-go-end":
				Self.history.go(Self.history.stack.length - 1);
				Self.dispatch({ type: "history-entry-render" });
				break;
			case "history-entry-render":
				let locked = [],
					historyItem = Self.history.current,
					historyEl = Self.el.history.find(".move").get(Self.history.index);
				//console.log(historyItem);
				game.load(historyItem.fen);
				board = game.board();

				// history list UI
				Self.el.history.find(".active").removeClass("active");
				historyEl.addClass("active");

				if (!historyEl.inView(Self.el.history)) {
					Self.el.history.scrollTop(historyEl.offset().top);
				}

				// reset board
				Self.el.board.find(".move-to-pos, .in-check, .active").removeClass("move-to-pos in-check active");
				Self.el.board.find(".move-from-pos, .can-move").remove();
				Self.dispatch({ type: "update-history-list" });

				// populate ghost board
				htm = [];
				board.map((row, y) => {
					row.map((square, x) => {
						if (!square) return;
						let pos = files.charAt(x) + ranks.charAt(y);
						htm.push(`<piece class="${COLORS[square.color]}-${PIECES[square.type]} pos-${pos}"></piece>`);
					});
				});
				// update DOM
				Self.el.ghost.html(htm.join(""));

				// add missing pieces
				let ghostPieces = Self.el.ghost.find("piece"),
					boardPieces = Self.el.board.find("piece");
				if (ghostPieces.length > boardPieces.length) {
					ghostPieces.map(el => {
							let name = el.className.split(" "),
								piece = Self.el.board.find(`.${name[0]}.${name[1]}`),
								gEls = Self.el.ghost.find(`.${name[0]}`),
								bEls = Self.el.board.find(`.${name[0]}`);
							if (!piece.length && gEls.length != bEls.length) {
								Self.el.board[0].appendChild(el.cloneNode());
							}
						});
				}

				let ghosts = Self.el.ghost.find("piece").map(el => {
						let rect = el.getBoundingClientRect();
						return { el, rect };
					});

				let matrix = Self.el.board.find("piece").map(el => {
					let rect = el.getBoundingClientRect(),
						distances = ghosts // measure distances
							.filter(ghost => ghost.el.className.split(" ")[0] === el.className.split(" ")[0])
							.map(ghost => {
								let distance = Math.hypot(ghost.rect.left - rect.left, ghost.rect.top - rect.top);
								return { ...ghost, distance };
							})
							.sort((a, b) => a.distance - b.distance);
					return { el, distances };
				});

				// sort matrix
				matrix = matrix.sort((a, b) =>
					a.distances.length && b.distances.length && 
					a.distances[0].distance - b.distances[0].distance);

				// iterate distance matrix
				matrix.map((item, i) => {
						let selected = item.distances.find(ghost => !~locked.indexOf(ghost.el));

						// remove captured pieces
						if (!selected) {
							return item.el.parentNode.removeChild(item.el);
						}
						
						let oldPos = item.el.className.match(/pos-(\w\d)/)[1],
							newPos = selected.el.className.match(/pos-(\w\d)/)[1];
						
						locked.push(selected.el);
						if (selected.distance === 0) return;

						$(item.el).cssSequence("moving to-"+ newPos, "transitionend", el => {
							el.removeClass(`moving to-${newPos} pos-${oldPos}`).addClass("pos-"+ newPos);

							// check if this is last
							if (i >= ghosts.length - 1 && historyItem.from && historyItem.to) {
								Self.dispatch({ ...historyItem, type: "show-from-to" });
							}
						});
					});

				// clear ghost board
				Self.el.ghost.html("");

				Self.dispatch({ type: "after-move" });
				break;
			case "show-from-to":
				Self.el.board.append(`<piece class="move-from-pos pos-${event.from}"></piece>`);
				Self.el.board.find(`.pos-${event.to}`).addClass("active");
				break;
			case "promote-pawn":
				name = event.name || event.target.className.split("-")[0];
				move = Self.moveAfterPromotion;
				move.promotion = Self.getPieceKey(name);
				// clean up
				delete Self.moveAfterPromotion;
				// hide lightbox
				Self.el.board.parent().removeClass("show-pawn-promotion");

				let res = game.move(move);
				if (res && res.captured) {
					let cc = res.color === "w" ? "b" : "w";
					// remove captured piece
					Self.el.board.find(`piece.pos-${res.to}.${COLORS[cc]}-${PIECES[res.captured]}`).remove();
				}
				// update pawn piece
				piece = Self.el.board.find(`.${COLORS[move.color]}-${PIECES[move.piece]}.pos-${move.to}`);
				piece.prop("className", `${COLORS[move.color]}-${name} pos-${move.to}`);
				piece.addClass("active");

				Self.dispatch({ ...move, type: "after-move" });
				break;
		}
	},
	getPieceKey(name) {
		for (let key in PIECES) {
			if (PIECES[key] === name) return key;
		}
	},
	getColorKey(name) {
		for (let key in COLORS) {
			if (COLORS[key] === name) return key;
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
		return bPromo || wPromo;
	}
};

window.exports = chess;
