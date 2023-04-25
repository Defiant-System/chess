
const AI = {
	async init() {
		this.engine = new Worker("~/js/stockfish.js");
		this.thinking = false;
		this.time = {
				wtime: 300000,
				btime: 300000,
				winc: 2000,
				binc: 2000,
			};

		this.engine.onmessage = event => this.dispatch({ type: "get-message", data: event.data });
		this.dispatch({ type: "post-message", cmd: "uci" });
	},
	makeBestMove(game) {

	},
	ponder() {

	},
	dispatch(event) {
		let Self = AI,
			name,
			value;
		// console.log( event );
		switch (event.type) {
			case "get-message":
				value = event.data.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
				if (value) {
					console.log({ from: match[1], to: match[2], promotion: match[3] });
				} else {
					console.log("INFO: ", event.data);
				}
				break;
			case "post-message":
				Self.engine.postMessage(event.cmd);
				break;
		}
	}
	// reset() {

	// },
	// setSkillLevel(skill) {
	// 	skill = Math.min(Math.max(skill, 0), 20);
	// 	this.time.level = skill;
		
	// 	// Change thinking depth allowance.
	// 	switch (true) {
	// 		case (skill < 5): this.time.depth = "1"; break;
	// 		case (skill < 10): this.time.depth = "2"; break;
	// 		case (skill < 15): this.time.depth = "3"; break;
	// 		default: this.time.depth = "";
	// 	}
	// 	this.dispatch({
	// 		type: "post-message",
	// 		cmd: `setoption name Skill Level value ${skill}`,
	// 	});
	// 	// Level 0 starts at 10
	// 	let max_err = Math.round((skill * -0.5) + 10);
	// 	this.dispatch({
	// 		type: "post-message",
	// 		cmd: `setoption name Skill Level Maximum Error value ${max_err}`,
	// 	});
	// 	// NOTE: Stockfish level 20 does not make errors (intentially), so these numbers have no effect on level 20.
	// 	// Level 0 starts at 1
	// 	let err_prob = Math.round((skill * 6.35) + 1);
	// 	this.dispatch({
	// 		type: "post-message",
	// 		cmd: `setoption name Skill Level Probability value ${err_prob}`,
	// 	});
	// },
	// setPlayerColor() {

	// },
	// start() {

	// }
};
