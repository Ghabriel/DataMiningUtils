import {Call, Callable} from "./types"

export class Interface {
	constructor(console: HTMLDivElement) {
		this.console = console;
	}

	newFunction(fn: Callable) {
		var wrapper = document.createElement("div");
		wrapper.classList.add("fn_def");
		wrapper.innerHTML += "<div class='name'>" + fn.name + "</div>";
		wrapper.innerHTML += "<div class='params'>" + fn.params.join(",") + "</div>";
		wrapper.innerHTML += "<div class='body'>" + fn.body + "</div>";
		this.console.appendChild(wrapper);
	}

	newCall(call: Call, result: string) {
		var wrapper = document.createElement("div");
		wrapper.classList.add("fn_call");
		wrapper.innerHTML += "<div class='name'>" + call.name + "</div>";
		wrapper.innerHTML += "<div class='params'>" + call.params.join(",") + "</div>";
		wrapper.innerHTML += "<div class='result'>" + result + "</div>";
		this.console.appendChild(wrapper);
	}

	private console: HTMLDivElement;
}
