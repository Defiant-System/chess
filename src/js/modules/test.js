
let Test = {
	init() {
		// setTimeout(() => chess.els.content.find(`.opt-row .icon-user`).trigger("click"), 200);
		// setTimeout(() => chess.els.content.find(`.opt-row .icon-cpu`).trigger("click"), 200);
		// setTimeout(() => this.testFen(), 300);
	},
	testFen() {
		let arg = `N3R3/2Qp4/k7/6bp/8/8/PPP2PPP/R5K1 w - - 3 28`;
		chess.dispatch({ type: "new-game", arg });
	}
};

// DEV-ONLY-START
Test.init();
// DEV-ONLY-END
