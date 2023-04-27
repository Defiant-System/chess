
let Test = {
	init() {
		setTimeout(() => this.startUserGame(), 300);
		// setTimeout(() => this.testFen(), 300);
	},
	startUserGame() {
		chess.els.content.find(`.opt-row .icon-user`).trigger("click");
	},
	testFen() {
		let str = `2kr2nr/pp5p/3R1p2/1p2p3/4P3/8/PPP2PPP/6K1 b - - 0 15`;
		game.fen(str);
	}
};

// DEV-ONLY-START
Test.init();
// DEV-ONLY-END
