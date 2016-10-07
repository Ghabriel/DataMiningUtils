/// <reference path="jQuery.d.ts" />

import {Cache} from "./Cache"
import {Interface} from "./Interface"
import {Parser} from "./Parser"

$(document).ready(function() {
	var input = <HTMLInputElement>document.querySelector("#command");
	var console = <HTMLDivElement>document.querySelector("#console");
	var submit = document.querySelector("#submit");
	var parser = new Parser(new Interface(console));
	parser.loadNative();
	parser.watch(input);

	submit.addEventListener("click", function() {
		if (parser.parse(input.value)) {
			input.value = "";
		}
	});

	Cache.setup();
});
