define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    var Callable = (function () {
        function Callable() {
        }
        return Callable;
    }());
    exports.Callable = Callable;
    var Call = (function () {
        function Call() {
        }
        return Call;
    }());
    exports.Call = Call;
});
define("Interface", ["require", "exports"], function (require, exports) {
    "use strict";
    var Interface = (function () {
        function Interface(console) {
            this.console = console;
        }
        Interface.prototype.newFunction = function (fn) {
            var wrapper = document.createElement("div");
            wrapper.classList.add("fn_def");
            wrapper.innerHTML += "<div class='name'>" + fn.name + "</div>";
            wrapper.innerHTML += "<div class='params'>" + fn.params.join(",") + "</div>";
            wrapper.innerHTML += "<div class='body'>" + fn.body + "</div>";
            this.console.appendChild(wrapper);
        };
        Interface.prototype.newCall = function (call, result) {
            var wrapper = document.createElement("div");
            wrapper.classList.add("fn_call");
            wrapper.innerHTML += "<div class='name'>" + call.name + "</div>";
            wrapper.innerHTML += "<div class='params'>" + call.params.join(",") + "</div>";
            wrapper.innerHTML += "<div class='result'>" + result + "</div>";
            this.console.appendChild(wrapper);
        };
        return Interface;
    }());
    exports.Interface = Interface;
});
define("Parser", ["require", "exports", "types"], function (require, exports, types_1) {
    "use strict";
    var id = "[A-Za-z_][A-Za-z0-9_]*";
    var literal = "(?:[0-9]*\.[0-9]+|[0-9]+\.?[0-9]*|" + id + ")";
    var paramList = "(?: *" + id + "(?: *, *" + id + " *)*)?";
    var argList = "(?: *" + literal + "(?: *, *" + literal + " *)*)?";
    var funDefSep = "\\s";
    var funDef = "(" + id + ")" + funDefSep + "(" + paramList + ")" + funDefSep + "(.*)";
    var funCall = "(" + id + ")(?:\\((" + argList + ")\\))?";
    var regex = {
        id: new RegExp(id),
        paramList: new RegExp(paramList),
        funDef: new RegExp(funDef),
        funCall: new RegExp(funCall)
    };
    var Parser = (function () {
        function Parser(ui) {
            this.functions = [];
            this.ui = ui;
        }
        Parser.prototype.watch = function (input) {
            var self = this;
            input.addEventListener("keyup", function (e) {
                switch (e.keyCode) {
                    case 13:
                        if (self.parse(this.value)) {
                            this.value = "";
                        }
                        break;
                }
            });
        };
        Parser.prototype.parse = function (command) {
            if (command == "") {
                command = this.lastCommand;
            }
            this.lastCommand = command;
            var matches = command.match(regex.funDef);
            if (matches) {
                var action = new types_1.Callable();
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
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = this.split(matches[2], ",");
                var output = this.exec(action);
                this.ui.newCall(action, output);
                return true;
            }
            return false;
        };
        Parser.prototype.split = function (content, separator) {
            if (content) {
                return content.split(separator);
            }
            return [];
        };
        Parser.prototype.register = function (fn) {
            var content = "function(";
            content += fn.params.join(",");
            content += ") { return (" + fn.body + ");}";
            this.assign(fn.name, content);
        };
        Parser.prototype.exec = function (call) {
            for (var name in this.builtin) {
                if (this.builtin.hasOwnProperty(name)) {
                    if (name == call.name) {
                        var str = name + "(" + call.params.join(",") + ")";
                        var result = eval(str);
                        this.assign("ans", result);
                        return result;
                    }
                }
            }
            for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
                var fn = _a[_i];
                if (fn.name == call.name) {
                    var expectedNum = fn.params.length;
                    var actualNum = call.params.length;
                    if (expectedNum == actualNum) {
                        for (var i = 0; i < actualNum; i++) {
                            this.assign(fn.params[i], eval(call.params[i]));
                        }
                        var result = this.eval(fn);
                        this.assign("ans", result);
                        return result;
                    }
                    else {
                        return "wrong number of arguments (expected "
                            + expectedNum + ", got " + actualNum + ")";
                    }
                }
            }
            return "undefined function '" + call.name + "'";
        };
        Parser.prototype.assign = function (name, value) {
            eval("window." + name + "=" + value);
        };
        Parser.prototype.eval = function (fn) {
            return eval(fn.body);
        };
        Parser.prototype.loadNative = function () {
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
                    params: ["r", "x"],
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
            function avg() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i - 0] = arguments[_i];
                }
                var sum = 0;
                for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
                    var value = values_1[_a];
                    sum += value;
                }
                return sum / values.length;
            }
            ;
            function vari() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i - 0] = arguments[_i];
                }
                var average = avg.apply(void 0, values);
                var sum = 0;
                for (var _a = 0, values_2 = values; _a < values_2.length; _a++) {
                    var value = values_2[_a];
                    sum += Math.pow(value - average, 2);
                }
                return sum / (values.length - 1);
            }
            ;
            function sd() {
                var values = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    values[_i - 0] = arguments[_i];
                }
                return Math.sqrt(vari.apply(void 0, values));
            }
            function dist(x1, y1, x2, y2) {
                return (Math.abs(x1 - x2) + Math.abs(y1 - y2)) / 2;
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
            for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
                var fn = _a[_i];
                this.register(fn);
            }
            for (var name in this.builtin) {
                if (this.builtin.hasOwnProperty(name)) {
                    window[name] = this.builtin[name];
                }
            }
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
/// <reference path="jQuery.d.ts" />
define("main", ["require", "exports", "Interface", "Parser"], function (require, exports, Interface_1, Parser_1) {
    "use strict";
    $(document).ready(function () {
        var input = document.querySelector("#command");
        var console = document.querySelector("#console");
        var button = document.querySelector("#submit");
        var parser = new Parser_1.Parser(new Interface_1.Interface(console));
        button.addEventListener("click", function () {
            if (parser.parse(input.value)) {
                input.value = "";
            }
        });
        parser.loadNative();
        parser.watch(input);
    });
});
