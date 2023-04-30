
class History {
	constructor() {
		this.stack = [];
		this.index = -1;
	}

	push(data) {
		this.index++;

		this.stack.splice(this.index);
		this.stack.push(data);
	}

	go(i) {
		if (i >= 0 && i <= this.stack.length - 1) {
			this.index = i;
		}
	}

	goBack() {
		if (this.index >= 0) {
			this.index--;
		}
	}

	goForward() {
		if (this.index < this.stack.length - 1) {
			this.index++;
		}
	}

	get length() {
		return this.stack.length;
	}

	get previous() {
		return this.index > 1 ? this.stack[this.index - 1] : false;
	}

	get current() {
		return this.stack[this.index];
	}

	get canGoBack() {
		return this.index > 0;
	}

	get canGoForward() {
		return this.index < this.stack.length - 1;
	}
}
