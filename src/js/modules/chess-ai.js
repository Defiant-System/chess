
const Levels = [
	{ level: 1,  depth: 3,  threads: 4,  hash: 128 },
	{ level: 3,  depth: 5,  threads: 4,  hash: 128 },
	{ level: 6,  depth: 7,  threads: 4,  hash: 256 },
	{ level: 9,  depth: 10, threads: 4,  hash: 256 },
	{ level: 12, depth: 15, threads: 8,  hash: 512 },
	{ level: 15, depth: 20, threads: 8,  hash: 512 },
	{ level: 18, depth: 30, threads: 16, hash: 1024 },
	{ level: 20, depth: 40, threads: 16, hash: 1024 },
];

const AI = {
	async init() {
		let Stockfish = await window.fetch("~/wasm/stockfish.js");
		// console.log(Stockfish);

		this.thinking = false;
		this.stack = [];
		
		Stockfish().then(sf => {
			let depth = 5;

			AI.sf = sf;
			sf.addMessageListener(AI.dispatch);
			sf.postMessage("uci");
		});
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
			level = Levels[game.level];
		this.thinking = game;

		this.sf.postMessage(`setoption name Threads value ${level.threads}`);
		this.sf.postMessage(`setoption name Hash value ${level.hash}`);
		this.sf.postMessage(`setoption name Skill Level value ${level.level}`);
		this.sf.postMessage(`position fen ${game.fen}`);
		this.sf.postMessage(`go depth ${level.depth}`);
	},
	dispatch(line) {
		let Self = AI;

		//console.log(line);
		if (line.includes("bestmove")) {
			// send best move to callback
			let move = line.match(/bestmove (\w+)/)[1];
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


