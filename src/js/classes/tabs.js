
class Tabs {
	constructor(parent, window) {
		this._parent = parent;
		this._window = window;
		this._stack = {};
		this._active = null;

		// fast references
		this._els = {
			board: window.find(".board"),
		};

		this._game = new Chess();
	}

	get length() {
		return Object.keys(this._stack).length;
	}

	add(opt={}) {
		let tId = "f"+ Date.now(),
			tName = opt.name || "New Game",
			tabEl = this._window.tabs.add(tName, tId),
			history = new window.History,
			fen = opt.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			orientation = "white";
		// save reference to tab
		this._stack[tId] = { tId, tabEl, orientation, history, fen };
		// focus on file
		this.focus(tId);
	}

	remove(tId) {
		this._stack[tId] = false;
		delete this._stack[tId];
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
			row.map((square, x) => {
				if (!square) return;
				let pos = FILES.charAt(x) + RANKS.charAt(y);
				htm.push(`<piece class="${COLORS[square.color]}-${PIECES[square.type]} pos-${pos}"></piece>`);
			});
		});
		// update DOM
		this._els.board.html(htm.join(""));
	}
}
