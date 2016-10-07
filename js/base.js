define("Cache", ["require", "exports"], function (require, exports) {
    "use strict";
    var Cache = (function () {
        function Cache() {
        }
        Cache.setup = function () {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('cache.js', { scope: '../' }).then(function (reg) {
                    if (reg.installing) {
                        console.log('Service worker installing');
                    }
                    else if (reg.waiting) {
                        console.log('Service worker installed');
                    }
                    else if (reg.active) {
                        console.log('Service worker active');
                    }
                }).catch(function (error) {
                    console.log('Registration failed with ' + error);
                });
            }
        };
        return Cache;
    }());
    exports.Cache = Cache;
});
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
/// <reference path="jQuery.d.ts" />
define("Interface", ["require", "exports"], function (require, exports) {
    "use strict";
    var Interface = (function () {
        function Interface(console) {
            this.console = console;
            this.listeners = [];
        }
        Interface.prototype.addListener = function (listener) {
            this.listeners.push(listener);
        };
        Interface.prototype.newFunction = function (command, fn) {
            var wrapper = document.createElement("div");
            wrapper.classList.add("fn_def");
            wrapper.innerHTML += "<div class='name'>" + fn.name + "</div>";
            wrapper.innerHTML += "<div class='params'>" + fn.params.join(",") + "</div>";
            wrapper.innerHTML += "<div class='body'>" + fn.body + "</div>";
            $(this.console).prepend(wrapper);
            var self = this;
            wrapper.addEventListener("click", function () {
                self.trigger(command);
            });
        };
        Interface.prototype.newCall = function (command, call, result) {
            var wrapper = document.createElement("div");
            wrapper.classList.add("fn_call");
            wrapper.innerHTML += "<div class='name'>" + call.name + "</div>";
            wrapper.innerHTML += "<div class='params'>" + call.params.join(",") + "</div>";
            wrapper.innerHTML += "<div class='result'>" + result + "</div>";
            $(this.console).prepend(wrapper);
            var self = this;
            wrapper.addEventListener("click", function () {
                self.trigger(command);
            });
        };
        Interface.prototype.trigger = function (command) {
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener.setText(command);
            }
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
    var evalCmd = "^(eval)\\((.*)\\)$";
    var defCmd = "^(def) (" + id + ") (.*)";
    var regex = {
        id: new RegExp(id),
        paramList: new RegExp(paramList),
        funDef: new RegExp(funDef),
        funCall: new RegExp(funCall),
        evalCmd: evalCmd,
        defCmd: defCmd
    };
    var Parser = (function () {
        function Parser(ui) {
            this.functions = [];
            ui.addListener(this);
            this.ui = ui;
            this.inputs = [];
        }
        Parser.prototype.watch = function (input) {
            var self = this;
            input.addEventListener("keydown", function (e) {
                switch (e.keyCode) {
                    case 190:
                        if (this.value == "") {
                            this.value = self.lastCommand;
                            e.preventDefault();
                        }
                        break;
                }
            });
            input.addEventListener("keyup", function (e) {
                switch (e.keyCode) {
                    case 13:
                        if (self.parse(this.value)) {
                            this.value = "";
                        }
                        break;
                }
            });
            this.inputs.push(input);
            input.focus();
        };
        Parser.prototype.parse = function (command) {
            if (command == "") {
                command = this.lastCommand;
            }
            this.lastCommand = command;
            var matches = command.match(regex.defCmd);
            if (matches) {
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = [matches[2]];
                var result = void 0;
                try {
                    result = eval(matches[3]);
                    window[matches[2]] = result;
                }
                catch (e) {
                    result = "error";
                }
                this.assign("ans", result);
                this.ui.newCall(command, action, result);
                return true;
            }
            matches = command.match(regex.funDef);
            if (matches) {
                var action = new types_1.Callable();
                action.name = matches[1];
                action.params = this.split(matches[2], ",");
                action.body = matches[3];
                this.functions.push(action);
                this.ui.newFunction(command, action);
                this.register(action);
                return true;
            }
            matches = command.match(regex.evalCmd);
            if (matches) {
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = [];
                var result = void 0;
                try {
                    result = eval(matches[2]);
                }
                catch (e) {
                    result = "error";
                }
                this.assign("ans", result);
                this.ui.newCall(command, action, result);
                return true;
            }
            matches = command.match(regex.funCall);
            if (matches) {
                var action = new types_1.Call();
                action.name = matches[1];
                action.params = this.split(matches[2], ",");
                var output = this.exec(action);
                this.ui.newCall(command, action, output);
                return true;
            }
            return false;
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
            if (typeof value == "string") {
                value = "'" + value + "'";
            }
            eval("window." + name + "=" + value);
        };
        Parser.prototype.eval = function (fn) {
            return eval(fn.body);
        };
        Parser.prototype.setText = function (command) {
            for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                input.value = command;
            }
            this.inputs[0].focus();
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
                    name: "pow",
                    params: ["x", "y"],
                    body: "Math.pow(x,y)"
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
                },
                {
                    name: "dist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "(abs(x1-x2) + abs(y1-y2))/2"
                },
                {
                    name: "edist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))"
                },
                {
                    name: "mdist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "abs(x1-x2) + abs(y1-y2)"
                },
                {
                    name: "cdist",
                    params: ["x1", "y1", "x2", "y2"],
                    body: "max(abs(x1-x2), abs(y1-y2))"
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
            var self = this;
            function help() {
                for (var _i = 0, _a = self.functions; _i < _a.length; _i++) {
                    var fn = _a[_i];
                    console.log(fn.name);
                }
                return "";
            }
            this.builtin = {
                avg: avg,
                vari: vari,
                sd: sd,
                help: help
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
        Parser.prototype.split = function (content, separator) {
            if (content) {
                return content.split(separator);
            }
            return [];
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
/// <reference path="jQuery.d.ts" />
define("main", ["require", "exports", "Cache", "Interface", "Parser"], function (require, exports, Cache_1, Interface_1, Parser_1) {
    "use strict";
    $(document).ready(function () {
        var input = document.querySelector("#command");
        var console = document.querySelector("#console");
        var submit = document.querySelector("#submit");
        var parser = new Parser_1.Parser(new Interface_1.Interface(console));
        parser.loadNative();
        parser.watch(input);
        submit.addEventListener("click", function () {
            if (parser.parse(input.value)) {
                input.value = "";
            }
        });
        Cache_1.Cache.setup();
    });
});
