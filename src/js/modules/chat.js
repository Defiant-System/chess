
const CHAT = {
	init() {
		// fast references
		this.transcript = window.find(".transcript");
		this.input = window.find(".chat-input > div");

		setTimeout(() => {
			this.input.html("hbi :heart: laura :sunglasses:");
			//this.input.html("Hello :P :* :) :D ;) :( :heart_eyes:");
			this.dispatch({ type: "window.keystroke", keyCode: 13 });
		}, 1000);
	},
	dispatch(event) {
		let self = CHAT,
			name,
			to,
			msg,
			el;
		switch (event.type) {
			case "window.keystroke":
				if (event.keyCode === 13) {
					to = "hbi";
					msg = $.emoticons(self.input.text());
					console.log(msg);

					name = event.shiftKey ? "received" : "sent";
					self.transcript.append(`<div class="${name}">${msg}</div>`);

					//defiant.netSend({ to, msg });

					// clear input
					self.input.html("");
				}
				break;
		}
	}
};