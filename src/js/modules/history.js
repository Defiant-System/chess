
// chess.history

{
	init() {
		// fast references
		this.els = {
			board: window.find(".board"),
			ghost: window.find(".ghost-pieces"),
			history: window.find(".move-history"),
			toolUndo: window.find("[data-click='undo-move']"),
			toolRedo: window.find("[data-click='redo-move']"),
			toolRotate: window.find("[data-click='rotate-board']"),
			hBtnStart: window.find("[data-click='history-go-start']"),
			hBtnPrev: window.find("[data-click='history-go-prev']"),
			hBtnNext: window.find("[data-click='history-go-next']"),
			hBtnEnd: window.find("[data-click='history-go-end']"),
		};
	},
	dispatch(event) {
		let APP = chess,
			Self = APP.history,
			files = FILES,
			ranks = RANKS,
			board,
			htm,
			el;
		// console.log(event);
		switch (event.type) {
			case "reset-history-list":
				// clear HTML
				Self.els.history.html("");
				// create history stack
				Self.history = new History;
				// add reseted board as first entry
				Self.addEntry({ type: "start", fen: game.fen() });
				// reset toolbar
				Self.dispatch({ type: "reset-toolbar" });
				break;
			case "render-history-list":
				htm = Self.history.stack.map(entry => {
					let piece = entry.piece;
					return `<span class="move"><piece class="${COLORS[entry.color]}-${PIECES[piece]}"></piece>${entry.to}</span>`;
				});
				Self.els.history.html(htm.join());
				// scroll list to end
				Self.els.history.find(".move:last").scrollIntoView();
				break;
			case "update-history-list":
				Self.els.history.find(".active").removeClass("active");
				Self.els.history.find(".move").get(Self.history.index).addClass("active");

				Self.els.hBtnStart.toggleClass("disabled_", Self.history.canGoBack);
				Self.els.hBtnPrev.toggleClass("disabled_", Self.history.canGoBack);
				Self.els.hBtnNext.toggleClass("disabled_", Self.history.canGoForward);
				Self.els.hBtnEnd.toggleClass("disabled_", Self.history.canGoForward);
				// update toolbar
				Self.dispatch({ type: "update-toolbar" });
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

				// switch (Self.opponent) {
				// 	case "AI": break;
				// 	case "Friend": break;
				// 	case "User": break;
				// }

				Self.history.go(Self.history.index - 1);
				Self.dispatch({ type: "history-entry-render" });
				break;
			case "history-go-next":

				// switch (Self.opponent) {
				// 	case "AI": break;
				// 	case "Friend": break;
				// 	case "User": break;
				// }

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
					historyEl = Self.els.history.find(".move").get(Self.history.index);
				//console.log(historyItem);
				game.load(historyItem.fen);
				board = game.board();

				// history list UI
				Self.els.history.find(".active").removeClass("active");
				historyEl.addClass("active");

				// make sure item is in view
				if (!historyEl.inView(Self.els.history)) {
					historyEl.scrollIntoView();
				}

				// reset board
				Self.els.board.find(".move-to-pos, .in-check, .active").removeClass("move-to-pos in-check active");
				Self.els.board.find(".move-from-pos, .can-move").remove();
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
				Self.els.ghost.html(htm.join(""));

				// add missing pieces
				let ghostPieces = Self.els.ghost.find("piece"),
					boardPieces = Self.els.board.find("piece");
				if (ghostPieces.length > boardPieces.length) {
					ghostPieces.map(el => {
							let name = el.className.split(" "),
								piece = Self.els.board.find(`.${name[0]}.${name[1]}`),
								gEls = Self.els.ghost.find(`.${name[0]}`),
								bEls = Self.els.board.find(`.${name[0]}`);
							if (!piece.length && gEls.length != bEls.length) {
								Self.els.board[0].appendChild(el.cloneNode());
							}
						});
				}

				let ghosts = Self.els.ghost.find("piece").map(el => {
						let rect = el.getBoundingClientRect();
						return { el, rect };
					});

				let matrix = Self.els.board.find("piece").map(el => {
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
				Self.els.ghost.html("");
				// dispatch event post-move
				APP.dispatch({ type: "after-move" });

				if (historyItem.type === "start") {
					// hide movement line
					APP.els.movement.removeClass("show");
				} else {
					// show movement line
					APP.dispatch({ ...historyItem, type: "show-movement-indicator" });
				}
				break;
			case "reset-toolbar":
				// update toolbar buttons
				Self.els.toolUndo.addClass("tool-disabled_");
				Self.els.toolRotate.addClass("tool-disabled_");
				break;
			case "update-toolbar":
				// update toolbar buttons
				Self.els.toolUndo.toggleClass("tool-disabled_", Self.history.index > -1);
				Self.els.toolRedo.toggleClass("tool-disabled_", Self.history.index < Self.history.stack.length-1);
				Self.els.toolRotate.toggleClass("tool-disabled_", Self.history.index > -1);
				break;
		}
	},
	addEntry(move) {
		if (move.type === "start") {
			// push move to history
			this.history.push(move);
			// update move history list
			this.els.history
				.append(`<span class="move start"></span>`);
		}

		if (move.from && move.to) {
			// push move to history
			this.history.push(move);

			// delete discarded elements
			let len = this.history.length-1;
			this.els.history.find(".move").map((e, i) => {
				if (i >= len) e.parentNode.removeChild(e);
			});

			// update move history list
			this.els.history
				.append(`<span class="move"><piece class="${COLORS[move.color]}-${PIECES[move.piece]}"></piece>${move.to}</span>`);
			// scroll list to end
			this.els.history.find(".move:last").scrollIntoView();

			this.dispatch({ type: "update-history-list" });
		}
	}
}
