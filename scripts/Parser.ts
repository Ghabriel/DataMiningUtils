import {Call, Callable} from "./types"
import {Interface} from "./Interface"

const id = "[A-Za-z_][A-Za-z0-9_]*";
const literal = "(?:[0-9]*\.[0-9]+|[0-9]+\.?[0-9]*|" + id + ")";
const paramList = "(?: *" + id + "(?: *, *" + id + " *)*)?";
const argList = "(?: *" + literal + "(?: *, *" + literal + " *)*)?";
const funDefSep = "(?:\\.|\\s)";
const funDef = "(" + id + ")" + funDefSep + "(" + paramList + ")" + funDefSep + "(.*)";
const funCall = "(" + id + ")(?:\\((" + argList + ")\\))?";
const regex = {
	id: new RegExp(id),
	paramList: new RegExp(paramList),
	funDef: new RegExp(funDef),
	funCall: new RegExp(funCall)
};

export class Parser {
	constructor(ui: Interface) {
		this.ui = ui;
	}

	watch(input: HTMLInputElement) {
		var self = this;
		input.addEventListener("keyup", function(e) {
			switch (e.keyCode) {
				case 13:
					if (self.parse(this.value)) {
						this.value = "";
					}
					break;
			}
		});
	}

	parse(command: string): boolean {
		var matches = command.match(regex.funDef);
		if (matches) {
			let action = new Callable();
			action.name = matches[1];
			action.params = this.split(matches[2], ",");
			action.body = matches[3];
			this.functions.push(action);
			this.ui.newFunction(action);
			this.register(action);
			return true;
		}

		matches = command.match(regex.funCall);
		if (matches) {
			let action = new Call();
			action.name = matches[1];
			action.params = this.split(matches[2], ",");
			let output = this.exec(action);
			this.ui.newCall(action, output);
			return true;
		}

		return false;
	}

	split(content: string, separator: string): string[] {
		if (content) {
			return content.split(separator);
		}
		return [];
	}

	register(fn: Callable): void {
		var content = "function(";
		content += fn.params.join(",");
		content += ") { return (" + fn.body + ");}";
		this.assign(fn.name, content);
	}

	exec(call: Call): string {
		for (let fn of this.functions) {
			if (fn.name == call.name) {
				let expectedNum = fn.params.length;
				let actualNum = call.params.length;
				if (expectedNum == actualNum) {
					for (var i = 0; i < actualNum; i++) {
						this.assign(fn.params[i], eval(call.params[i]));
					}
					var result = this.eval(fn);
					this.assign("ans", result);
					return result;
				} else {
					return "wrong number of arguments (expected "
						+ expectedNum + ", got " + actualNum + ")";
				}
			}
		}

		return "undefined function '" + call.name + "'";
	}

	assign(name: string, value: any): void {
		eval("window." + name + "=" + value);
	}

	eval(fn: Callable): string {
		return eval(fn.body);
	}

	loadNative(): void {
		this.functions = [
			{
				name: "log",
				params: ["x"],
				body: "Math.log2(x)"
			},
			{
				name: "log2",
				params: ["x"],
				body: "Math.log2(x)"
			},
			{
				name: "log10",
				params: ["x"],
				body: "Math.log10(x)"
			},
			{
				name: "ln",
				params: ["x"],
				body: "Math.log(x)"
			},
			{
				name: "sqrt",
				params: ["x"],
				body: "Math.sqrt(x)"
			},
			{
				name: "cbrt",
				params: ["x"],
				body: "Math.cbrt(x)"
			},
			{
				name: "rt",
				params: ["r","x"],
				body: "Math.pow(x, 1/r)"
			},
			{
				name: "abs",
				params: ["x"],
				body: "Math.abs(x)"
			},
			{
				name: "exp",
				params: ["x"],
				body: "Math.exp(x)"
			},
			{
				name: "floor",
				params: ["x"],
				body: "Math.floor(x)"
			},
			{
				name: "ceil",
				params: ["x"],
				body: "Math.ceil(x)"
			},
			{
				name: "rand",
				params: [],
				body: "Math.random()"
			},
			{
				name: "ans",
				params: [],
				body: "ans"
			}
		];

		for (let fn of this.functions) {
			this.register(fn);
		}
	}

	private functions: Callable[] = [];
	private ui: Interface;
}
