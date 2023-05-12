
@import "./classes/history.js";

@import "./modules/chess.0.10.3.js";
@import "./modules/chess-ai.js";
@import "./modules/pgn-parser.js";
@import "./modules/test.js";


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

// r4b1r/p1qk2pp/1pp1p3/P2p4/1PPP1n2/3n1b2/3K3p/5B2 b - - 2 30

let SAVED = window.settings.getItem("pgn");
let Game;


const chess = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			chess: window.find("content > .chess"),
			board: window.find(".board"),
			ghost: window.find(".ghost-pieces"),
			movement: window.find(".movement-indicator"),
		};

		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		if (SAVED) {
			// restore game from save
			this.dispatch({ type: "game-from-pgn", pgn: SAVED });
		}
	},
	dispatch(event) {
		let Self = chess,
			files = FILES,
			ranks = RANKS,
			orientation,
			theme,
			board,
			square,
			piece,
			moves,
			move,
			name,
			item,
			htm,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.close":
				if (Game) {
					if (Self.els.chess.hasClass("show-game-over")) {
						// if "game over", auto-clear saved PGN
						return window.settings.removeItem("pgn");
					}
					let state = `[White "User"]\n[Black "${Self.opponent}:${Self.skill}"]\n\n${Game.pgn()}`;
					window.settings.setItem("pgn", state);
				}
				break;
			// custom events
			case "load-fen-game":
				// reset board
				Self.els.chess.removeClass("show-game-over show-new-game");
				// start new game
				Self.dispatch({
					type: "game-from-fen",
					fen: event.arg || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
					opponent: event.opponent || "AI",
				});
				// make sure "window title" is updated
				Self.dispatch({ type: "after-move" });
				break;
			case "new-game":
				// reset board
				Self.els.chess
					.removeClass("show-game-over show-pawn-promotion")
					.addClass("show-new-game");
				// reset game object
				Game.reset();
				break;
			case "reset-board":
				Self.els.board.find(".active, .castling-rook").removeClass("active castling-rook");
				Self.els.board.find(".can-move").remove();
				Self.els.board.removeClass("can-move-squares");
				break;
			case "undo-move":
				Self.history.dispatch({ type: "history-go-prev" });
				break;
			case "redo-move":
				Self.history.dispatch({ type: "history-go-next" });
				break;
			case "rotate-board":
				orientation = Self.els.chess.data("orientation") === "white" ? "black" : "white";
				Self.els.chess.data({ orientation });
				break;
			case "set-board-theme":
				theme = event.arg || "blue";
				Self.els.chess.data({ theme });
				break;
			case "game-from-fen":
				Game = new Chess(event.fen);
				orientation = Self.els.chess.data("orientation");
				// set opponent
				Self.opponent = event.opponent;
				// reset history list
				Self.history.dispatch({ type: "reset-history-list" });
				// hide movement line
				Self.els.movement.removeClass("show");

				if (orientation === "black") {
					files = files.split("").reverse().join("");
					ranks = ranks.split("").reverse().join("");
				}

				htm = [];
				Game.board().map((row, y) => {
					row.map((square, x) => {
						if (!square) return;
						let pos = files.charAt(x) + ranks.charAt(y);
						htm.push(`<piece class="${COLORS[square.color]}-${PIECES[square.type]} pos-${pos}"></piece>`);
					});
				});
				// update DOM
				Self.els.board.html(htm.join(""));
				break;
			case "game-from-pgn":
				// populate history
				let parsed = PGN.parse(event.pgn),
					[opponent, skill] = parsed.header.Black.split(":");
				// set AI skill level
				Self.skill = skill ? +skill : 1;
				// get fen value from PGN game
				Game = new Chess();
				Game.load_pgn(event.pgn);

				Self.dispatch({ type: "load-fen-game", opponent, fen: Game.fen() });
				// populate history
				parsed.moves.map(move => Self.history.addEntry(move));
				// auto click on last entry
				Self.history.els.history.find(".move:last").trigger("click");
				break;
			case "show-new-game-view":
				Self.els.chess.removeClass("show-game-over").addClass("show-new-game");
				break;
			case "new-vs-cpu":
				Self.els.content.find(`.dialog.new-game`).data({ show: "cpu-menu" });
				break;
			case "set-cpu-skill":
				// set AI skill
				Self.skill = +$(event.target).html();
				// start new game against cpu
				Self.dispatch({ type: "load-fen-game", opponent: "AI" });
				// reset menu
				Self.els.content.find(`.dialog.new-game`).data({ show: "main-menu" });
				break;
			case "new-vs-human":
				Self.dispatch({ type: "load-fen-game", opponent: "User" });
				break;
			case "new-vs-friend":
				Self.dispatch({ type: "load-fen-game", opponent: "Friend" });
				break;
			case "menu-go-back":
				Self.els.content.find(`.dialog.new-game`).data({ show: "main-menu" });
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
					el = Self.els.board.find(".active");
					name = el.prop("className");

					move = {
						from: name.match(/pos-(.{2})/)[1],
						to: square,
						color: name.slice(0, 1),
						piece: Self.getPieceKey(name.match(/-(\w+)/)[1]),
					};
					return Self.dispatch({ ...move, type: "make-move" });
				}

				Self.els.board.find(".active").removeClass("active");
				el.addClass("active");

				moves = Game.moves({ square, verbose: true });
				htm = moves.map(move => `<piece class="can-move pos-${move.to} ${move.captured ? "piece-capture" : ""}"></piece>`);
				
				// check if moves enables castling
				moves.map(move => {
					let castle = Self.isCastling(move);
					if (!castle) return;
					htm.push(`<piece class="can-move pos-${castle.from} castling-rook" data-from="${move.from}" data-to="${move.to}" data-color="${move.color}"></piece>`);
				});

				Self.els.board.addClass("can-move-squares").prepend(htm.join(""));
				break;
			case "make-move":
				if (!event.from || !event.to) {
					Self.dispatch({ type: "after-move" });
				}
				// reset board
				Self.els.board.find(".move-to-pos, .in-check, .active").removeClass("move-to-pos in-check active");
				Self.els.board.find(".move-from-pos, .can-move").remove();
				// place holder
				Self.els.board.append(`<piece class="move-from-pos pos-${event.from}"></piece>`);
				// play sound
			 	window.audio.play("move");

				let castle = Self.isCastling(event);
				if (castle) {
					Self.els.board
						.find(`.${COLORS[castle.color]}-${PIECES[castle.piece]}.pos-${castle.from}`)
						.cssSequence("moving to-"+ castle.to, "transitionend", el => {
								el.removeClass("moving to-"+ castle.to +" pos-"+ castle.from)
									.addClass("pos-"+ castle.to);
							});
				}

				piece = Self.els.board.find(`.${COLORS[event.color]}-${PIECES[event.piece]}.pos-${event.from}`);

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
							Self.els.board.find(`piece.pos-${move.to}:not(.${COLORS[move.color]}-${PIECES[move.piece]})`).addClass("hidden");

							// if move made by AI
							if (move.color === "b") {
								move.name = "queen";
								return Self.dispatch({ ...move, type: "promote-pawn" });
							}
							
							// show lightbox
							return Self.els.chess.addClass("show-pawn-promotion");
						}

						let res = Game.move(move);
						if (res && res.captured) {
							let cc = res.color === "w" ? "b" : "w";
							// remove captured piece
							Self.els.board.find(`piece.pos-${res.to}.${COLORS[cc]}-${PIECES[res.captured]}`).remove();
						}

						Self.dispatch({ ...move, type: "after-move" });
					});
				break;
			case "after-move":
				let turnColor = COLORS[Game.turn()];

				if (event.from || event.to) {
					move = event;
					move.fen = Game.fen();
					delete move.type;
					
					// push move to history
					Self.history.addEntry(move);

					// show movement line
					Self.dispatch({ ...move, type: "show-movement-indicator" });
				}

				// reset kings
				Self.els.board.find(".in-check").removeClass("in-check");

				if (Game.in_check()) {
					Self.els.board.find(`.${turnColor}-king`).addClass("in-check");
				}
				if (Game.in_checkmate()) {
					Self.els.chess.addClass("show-game-over");

					let winner = Game.turn() === "b" ? "White" : "Black";
					return Self.els.content.find(`.dialog.game-over h4`).html(`${winner} wins!`);
				}
				if (Game.in_draw()) {
					Self.els.chess.addClass("show-game-over");
					return Self.els.content.find(`.dialog.game-over h4`).html("Game draw");
				}
				if (Game.in_stalemate()) {
					Self.els.chess.addClass("show-game-over");
					return Self.els.content.find(`.dialog.game-over h4`).html("Game drawn by stalemate");
				}

				// update window title
				window.title = `Chess (${turnColor} turn)`;

				// reset board
				Self.els.board
					.removeClass("can-move-squares white-turn black-turn")
					.addClass(`${turnColor}-turn`);
				// remove previous possible moves
				Self.els.board.find(".move-to-pos, .castling-rook").removeClass("move-to-pos castling-rook");

				// process opponent turn / movement
				Self.opponentTurn(turnColor);
				break;
			case "promote-pawn":
				name = event.name || event.target.className.split("-")[0];
				move = Self.moveAfterPromotion;
				move.promotion = Self.getPieceKey(name);
				// clean up
				delete Self.moveAfterPromotion;
				// hide lightbox
				Self.els.chess.removeClass("show-pawn-promotion");

				let res = Game.move(move);
				if (res && res.captured) {
					let cc = res.color === "w" ? "b" : "w";
					// remove captured piece
					Self.els.board.find(`piece.pos-${res.to}.${COLORS[cc]}-${PIECES[res.captured]}`).remove();
				}
				// update pawn piece
				piece = Self.els.board.find(`.${COLORS[move.color]}-${PIECES[move.piece]}.pos-${move.to}`);
				piece.prop("className", `${COLORS[move.color]}-${name} pos-${move.to}`);
				piece.addClass("active");

				Self.dispatch({ ...move, type: "after-move" });
				break;
			case "show-movement-indicator":
				// show movement line
				Self.els.movement.addClass("show");

				let boxSize = parseInt(Self.els.content.cssProp("--box-size"), 10),
					halfBs = boxSize >> 1,
					[fF, fR] = event.from.split(""),
					[tF, tR] = event.to.split(""),
					fX = files.indexOf(fF) + 1,
					tX = files.indexOf(tF) + 1,
					fY = 8 - (+fR - 1),
					tY = 8 - (+tR - 1),
					data = {
						x1: (fX * boxSize) - halfBs,
						y1: (fY * boxSize) - halfBs,
						x2: (tX * boxSize) - halfBs,
						y2: (tY * boxSize) - halfBs,
					},
					x = data.x1 - data.x2,
					y = data.y1 - data.y2,
					len = Math.sqrt(x * x + y * y) - halfBs,
					rad = Math.atan2(x, y);
				// make arrow shorter
				data.y2 = data.y1 - (len * Math.cos(rad));
				data.x2 = data.x1 - (len * Math.sin(rad));
				// update SVG element
				Self.els.movement.find("line").attr(data);
				// clean up board UI
				Self.els.content.find(`.board .active`).removeClass("active");
				Self.els.content.find(`.move-from-pos`).remove();
				break;
			case "output-fen-string":
				console.log(Game.fen());
				break;
			case "output-history-array":
				console.log(JSON.stringify(Self.history.stack));
				//console.log( Game.history({ verbose: true }) );
				break;
			case "output-game-pgn":
				console.log( Game.pgn() );
				break;
			case "engine-interface":
				karaqu.shell("fs -u '~/help/engine-interface.md'");
				break;
			default:
				if (event.el) {
					// proxy event
					name = event.el.parents(`[data-section]`).data("section");
					if (Self[name]) Self[name].dispatch(event);
				}
		}
	},
	opponentTurn(turnColor) {
		switch (this.opponent) {
			case "AI":
				if (turnColor === "black") {
					let skill = this.skill || 1,
						fen = Game.fen();
					// simple ai move
					AI.makeBestMove({ fen, skill, callback: bestMove => {
						let from = bestMove.slice(0, 2),
							to = bestMove.slice(2),
							el = this.els.board.find(".pos-"+ from),
							name = el.prop("classList")[0].split("-"),
							color = this.getColorKey(name[0]),
							piece = this.getPieceKey(name[1]),
							move = { from, to, color, piece };
						this.dispatch({ type: "make-move", ...move });
					}});
				}
				break;
			case "User":
				break;
			case "Friend":
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
		if (Game.turn() === "w" && move.color === "w") {
			if (move.from === "e1" && move.to === "g1") {
				return { piece: "r", color: "w", from: "h1", to: "f1" };
			}
			if (move.from === "e1" && move.to === "c1") {
				return { piece: "r", color: "w", from: "a1", to: "d1" };
			}
		}
		if (Game.turn() === "b" && move.color === "b") {
			if (move.from === "e8" && move.to === "g8") {
				return { piece: "r", color: "b", from: "h8", to: "f8" };
			}
			if (move.from === "e8" && move.to === "c8") {
				return { piece: "r", color: "b", from: "a8", to: "d8" };
			}
		}
	},
	isPromotion(move) {
		if (move.piece !== "p") return;
		let bPromo = Game.turn() === "b"
					&& move.color === "b"
					&& move.from.charAt(1) === "2"
					&& move.to.charAt(1) === "1";
		let wPromo = Game.turn() === "w"
					&& move.color === "w"
					&& move.from.charAt(1) === "7"
					&& move.to.charAt(1) === "8";
		return bPromo || wPromo;
	},
	history: @import "./modules/history.js",
};

window.exports = chess;
