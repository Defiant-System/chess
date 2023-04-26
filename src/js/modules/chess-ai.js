
const AI = {
	async init() {
		this.stack = [];
		this.thinking = false;
		this.engine = new Worker("~/js/stockfish.js");

		this.engine.onmessage = this.dispatch;
		this.engine.postMessage("uci");
	},
	makeBestMove(game) {
		this.stack.push(game);
		if (!this.thinking) {
			// handle next game in stack
			this.ponder();
		}
	},
	ponder() {
		let game = this.stack.shift(),
			depth = "";

		// Change thinking depth allowance.
		switch (true) {
			case (game.skill < 5): depth = 1; break;
			case (game.skill < 10): depth = 2; break;
			case (game.skill < 15): depth = 3; break;
		}

		this.thinking = game;
		this.engine.postMessage(`position fen ${game.fen}`);
		this.engine.postMessage(`setoption name Skill Level value ${game.skill}`);
		this.engine.postMessage(`go depth ${depth}`);
	},
	dispatch(event) {
		let Self = AI,
			data = event.data;

		//console.log(data);
		if (data.includes("bestmove")) {
			// send best move to callback
			let move = data.match(/bestmove (\w+)/)[1];
			Self.thinking.callback(move);
			// remove old game
			Self.thinking = false;

			if (Self.stack.length) {
				// handle next game in stack
				Self.ponder();
			}
		}
	}
};

// auto init AI object
AI.init();
