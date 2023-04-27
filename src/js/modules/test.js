
let Test = {
	init() {
		// setTimeout(() => chess.els.content.find(`.opt-row .icon-user`).trigger("click"), 200);
		setTimeout(() => chess.els.content.find(`.opt-row .icon-cpu`).trigger("click"), 200);
		// setTimeout(() => this.testFen(), 300);
	},
	testFen() {
		let str = `2kr2nr/pp5p/3R1p2/1p2p3/4P3/8/PPP2PPP/6K1 b - - 0 15`;
		game.fen(str);
	}
};

// DEV-ONLY-START
Test.init();
// DEV-ONLY-END
