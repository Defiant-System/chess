
@import "classes/tabs.js";

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


const chess = {
	init() {
		
	},
	dispatch(event) {
		let Self = chess,
			name,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.init":
				Self.tabs = new Tabs(Self, window);

				// temp
				Self.tabs.add({
					name: "Spassky - Fischer",
					fen: "8/1p6/1P1K4/pk6/8/8/5B2/8 b - - 3 56",
				// 	fen: "8/3R1pk1/6pb/8/7P/5P2/1r1p1N1P/4rRK1 w - - 4 54",
				});

				// fetch PGN file
				/*
					spassky-fischer.pgn
					London Chess Classic (1).pgn
					London Chess Classic (2).pgn
					London Chess Classic (3).pgn
				*/
				name = "London Chess Classic (2)";
				fetch(`~/pgn/${name}.pgn`, { responseType: "text" })
					.then(f => f.blob())
					.then(async blob => {
						let pgn = await blob.text();
						Self.tabs.add({ name, pgn, theme: "brown" });
					});
				break;

			// tab related events
			case "tab-clicked":
				Self.tabs.focus(event.el.data("id"));
				break;
			case "tab-close":
				Self.tabs.remove(event.el.data("id"));
				break;

			// from menubar
			case "new-game":
				Self.tabs.add();
				break;
			case "reset-game":
				Self.tabs.reset();
				break;
			case "close-game":
				value = Self.tabs.length;
				if (value > 1) {
					Self.tabs._active.tabEl.find(`[sys-click]`).trigger("click");
				} else if (value === 1) {
					// system close window / spawn
					defiant.shell("win -c");
				}
				break;
			case "rotate-board":
				Self.tabs.rotateActive();
				break;
			case "set-board-theme":
				Self.tabs.setTheme(event.arg);
				break;
			case "engine-interface":
				defiant.shell("fs -u '~/help/engine-interface.md'");
				break;

			// custom events
			case "output-fen-string":
				console.log( Self.tabs._game.fen() );
				break;
			case "output-game-pgn":
				console.log( Self.tabs._game.pgn() );
				break;
			case "output-history-array":
				console.log( JSON.stringify( Self.tabs._active.history.stack ) );
				//console.log( Self.tabs._game.history({ verbose: true }) );
				break;

			case "history-go-start":
			case "history-go-prev":
			case "history-go-next":
			case "history-go-end":
				Self.tabs.historyGo(event.type.split("-")[2]);
				break;
		}
	}
};

window.exports = chess;
