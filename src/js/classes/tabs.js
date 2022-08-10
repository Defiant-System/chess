
class Tabs {
	constructor(parent, window) {
		this._parent = parent;
		this._window = window;
		this._stack = {};
		this._active = null;

		// fast references
		this._els = {
			board: window.find(".board"),
			history: window.find(".move-history"),
			hBtnStart: window.find("[data-click='history-go-start']"),
			hBtnPrev: window.find("[data-click='history-go-prev']"),
			hBtnNext: window.find("[data-click='history-go-next']"),
			hBtnEnd: window.find("[data-click='history-go-end']"),
		};

		this._tabNew = "New Game";
		this._fenNew = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		this._game = new Chess();
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	add(opt={}) {
		let tId = "f"+ Date.now(),
			tName = opt.name || this._tabNew,
			tabEl = this._window.tabs.add(tName, tId),
			history = new window.History,
			fen = opt.fen || this._fenNew,
			orientation = "white";

		if (opt.pgn) {
			// parse PGN
			let parsed = PGN.parse(opt.pgn);
			// populate history
			parsed.moves.map(move => history.push(move));
			// get FEN value
			let game = new Chess();
			game.load_pgn(opt.pgn);
			fen = game.fen();
		}

		// save reference to tab
		this._stack[tId] = { tId, tabEl, orientation, history, fen };
		// focus on file
		this.focus(tId);
	}

	remove(tId) {
		this._stack[tId] = false;
		delete this._stack[tId];
	}

	reset() {
		let active = this._active;
		// update fen
		active.fen = this._fenNew;
		// reset tab name
		active.tabEl.find("span").html(this._tabNew);
		// reset pieces + board
		this.els.board.find(".active, .castling-rook").removeClass("active castling-rook");
		this.els.board.find(".can-move").remove();
		this.els.board.removeClass("can-move-squares");
		// update
		this.update();
	}

	historyGo(val) {
		let active = this._active;
		switch (val) {
			case "start": active.history.go(0); break;
			case "prev": active.history.go(active.history.index - 1); break;
			case "next": active.history.go(active.history.index + 1); break;
			case "end": active.history.go(active.history.stack.length - 1); break;
		}
		// re-render board
		
		// Self.history.go(Self.history.stack.length - 1);
		// Self.dispatch({ type: "history-entry-render" });
	}

	rotateActive(val) {
		// reference to active tab
		let active = this._active,
			el = this._els.board.parent(),
			value = val || (el.data("orientation") === "white" ? "black" : "white");
		// update active state / UI
		el.data({ orientation: value });
		active.orientation = value;
	}

	focus(tId) {
		// reference to active tab
		this._active = this._stack[tId];
		// UI update
		this.update();
	}

	update() {
		let active = this._active,
			htm = [];
		// board orientation
		this._els.board.parent().data({ orientation: active.orientation });
		// switch fen
		this._game.load(active.fen);
		// update b oard
		this._game.board().map((row, y) => {
			row.map((s, x) => {
				if (!s) return;
				let pos = FILES.charAt(x) + RANKS.charAt(y);
				htm.push(`<piece class="${COLORS[s.color]}-${PIECES[s.type]} pos-${pos}"></piece>`);
			});
		});
		// update DOM
		this._els.board.html(htm.join(""));
		// window title
		window.title = active.tabEl.find("span").html();

		// render game history
		htm = active.history.stack.map(e =>
				`<span class="move"><piece class="${COLORS[e.color]}-${PIECES[e.piece]}"></piece>${e.to}</span>`);
		this._els.history
			.html(htm.join(""))
			.scrollTop(1e5);
	}
}
