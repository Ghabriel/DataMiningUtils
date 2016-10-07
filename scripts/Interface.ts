/// <reference path="jQuery.d.ts" />

import {Call, Callable} from "./types"

export class Interface {
	constructor(console: HTMLDivElement) {
		this.console = console;
		this.listeners = [];
	}

	addListener(listener: any): void {
		this.listeners.push(listener);
	}

	newFunction(command: string, fn: Callable) {
		var wrapper = document.createElement("div");
		wrapper.classList.add("fn_def");
		wrapper.innerHTML += "<div class='name'>" + fn.name + "</div>";
		wrapper.innerHTML += "<div class='params'>" + fn.params.join(",") + "</div>";
		wrapper.innerHTML += "<div class='body'>" + fn.body + "</div>";
		$(this.console).prepend(wrapper);

		var self = this;
		wrapper.addEventListener("click", function() {
			self.trigger(command);
		});
	}

	newCall(command: string, call: Call, result: string) {
		var wrapper = document.createElement("div");
		wrapper.classList.add("fn_call");
		wrapper.innerHTML += "<div class='name'>" + call.name + "</div>";
		wrapper.innerHTML += "<div class='params'>" + call.params.join(",") + "</div>";
		wrapper.innerHTML += "<div class='result'>" + result + "</div>";
		$(this.console).prepend(wrapper);

		var self = this;
		wrapper.addEventListener("click", function() {
			self.trigger(command);
		});
	}

	private trigger(command: string): void {
		for (let listener of this.listeners) {
			listener.setText(command);
		}
	}

	private console: HTMLDivElement;
	private listeners: any[];
}
