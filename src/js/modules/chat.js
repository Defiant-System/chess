
const CHAT = {
	init() {
		// fast references
		this.transcript = window.find(".transcript");
		this.input = window.find(".chat-input > div[contenteditable]");

		// setTimeout(() => {
		// 	this.input.html("Hello world :)");
		// 	//this.input.html("hbi :heart: laura :sunglasses:");
		// 	//this.input.html("Hello :P :* :) :D ;) :( :heart_eyes:");
		// 	this.dispatch({ type: "window.keystroke", keyCode: 13 });
		// }, 1000);
	},
	dispatch(event) {
		let Self = CHAT,
			name,
			to,
			msg,
			el;
		//console.log(event);
		switch (event.type) {
			case "window.keystroke":
				if (event.keyCode === 13) {
					to = "hbi99";
					msg = $.emoticons(Self.input.text());
					// test to see ui for received messages
					name = event.shiftKey ? "received" : "sent";
					Self.transcript.append(`<div class="${name}">${msg}</div>`);

					// clear input
					requestAnimationFrame(() => Self.input.html(""));
				}
				break;
		}
	}
};
