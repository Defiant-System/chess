
const CHAT = {
	init() {
		// fast references
		this.transcript = window.find(".transcript");
		this.input = window.find(".chat-input > div");

		// setTimeout(() => {
		// 	this.input.html("banan");
		// 	this.dispatch({ type: "window.keystroke", keyCode: 13 });
		// }, 1000);
	},
	dispatch(event) {
		let self = CHAT,
			name,
			str,
			el;
		switch (event.type) {
			case "window.keystroke":
				if (event.keyCode === 13) {
					str = self.input.text();

					name = event.shiftKey ? "received" : "sent";
					self.transcript.append(`<div class="${name}">${str}</div>`);

					defiant.netSend({
						"to":"hbi",
						"msg":str
					});

					// clear input
					self.input.html("");
				}
				break;
		}
	}
};
