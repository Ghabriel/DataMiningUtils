import {Call, Callable} from "./types"
import {Interface} from "./Interface"

const id = "[A-Za-z_][A-Za-z0-9_]*";
const literal = "(?:[0-9]*\.[0-9]+|[0-9]+\.?[0-9]*|" + id + ")";
const paramList = "(?: *" + id + "(?: *, *" + id + " *)*)?";
const argList = "(?: *" + literal + "(?: *, *" + literal + " *)*)?";
const funDefSep = "\\s";
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
		if (command == "") {
			command = this.lastCommand;
		}

		this.lastCommand = command;
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
		for (var name in this.builtin) {
			if (this.builtin.hasOwnProperty(name)) {
				if (name == call.name) {
					let str = name + "(" + call.params.join(",") + ")";
					let result = eval(str);
					this.assign("ans", result);
					return result;
				}
			}
		}

		for (let fn of this.functions) {
			if (fn.name == call.name) {
				let expectedNum = fn.params.length;
				let actualNum = call.params.length;
				if (expectedNum == actualNum) {
					for (let i = 0; i < actualNum; i++) {
						this.assign(fn.params[i], eval(call.params[i]));
					}
					let result = this.eval(fn);
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

		function avg(...values: number[]) {
			var sum = 0;
			for (let value of values) {
				sum += value;
			}
			return sum / values.length;
		};

		function vari(...values: number[]) {
			var average = avg(...values);
			var sum = 0;
			for (let value of values) {
				sum += Math.pow(value - average, 2);
			}
			return sum / (values.length - 1);
		};

		function sd(...values: number[]) {
			return Math.sqrt(vari(...values));
		}

		function dist(x1, y1, x2, y2) {
			return (Math.abs(x1 - x2) + Math.abs(y1 - y2))/2;
		}

		function eucldist(x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		}

		this.builtin = {
			avg: avg,
			vari: vari,
			sd: sd,
			dist: dist,
			eucldist: eucldist
		};

		for (let fn of this.functions) {
			this.register(fn);
		}

		for (var name in this.builtin) {
			if (this.builtin.hasOwnProperty(name)) {
				window[name] = this.builtin[name];
			}
		}
	}

	private functions: Callable[] = [];
	private builtin: any;
	private ui: Interface;
	private lastCommand: string;
}
