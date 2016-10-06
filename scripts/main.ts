/// <reference path="jQuery.d.ts" />

import {Interface} from "./Interface"
import {Parser} from "./Parser"

$(document).ready(function() {
	var input = <HTMLInputElement>document.querySelector("#command");
	var console = <HTMLDivElement>document.querySelector("#console");
	var button = document.querySelector("#submit");
	var parser = new Parser(new Interface(console));
	button.addEventListener("click", function() {
		if (parser.parse(input.value)) {
			input.value = "";
		}
	});
	parser.loadNative();
	parser.watch(input);
});
