define("Cache",["require","exports"],function(e,a){"use strict";var t=function(){function e(){}return e.setup=function(){"serviceWorker"in navigator&&navigator.serviceWorker.register("cache.js",{scope:"./"}).then(function(e){e.installing?console.log("Service worker installing"):e.waiting?console.log("Service worker installed"):e.active&&console.log("Service worker active")}).catch(function(e){console.log("Registration failed with "+e)})},e}();a.Cache=t}),define("types",["require","exports"],function(e,a){"use strict";var t=function(){function e(){}return e}();a.Callable=t;var n=function(){function e(){}return e}();a.Call=n}),define("Interface",["require","exports"],function(e,a){"use strict";var t=function(){function e(e){this.console=e,this.listeners=[]}return e.prototype.addListener=function(e){this.listeners.push(e)},e.prototype.newFunction=function(e,a){var t=document.createElement("div");t.classList.add("fn_def"),t.innerHTML+="<div class='name'>"+a.name+"</div>",t.innerHTML+="<div class='params'>"+a.params.join(",")+"</div>",t.innerHTML+="<div class='body'>"+a.body+"</div>",$(this.console).prepend(t);var n=this;t.addEventListener("click",function(){n.trigger(e)})},e.prototype.newCall=function(e,a,t){var n=document.createElement("div");n.classList.add("fn_call"),n.innerHTML+="<div class='name'>"+a.name+"</div>",n.innerHTML+="<div class='params'>"+a.params.join(",")+"</div>",n.innerHTML+="<div class='result'>"+t+"</div>",$(this.console).prepend(n);var r=this;n.addEventListener("click",function(){r.trigger(e)})},e.prototype.trigger=function(e){for(var a=0,t=this.listeners;a<t.length;a++){var n=t[a];n.setText(e)}},e}();a.Interface=t}),define("Parser",["require","exports","types"],function(require,exports,types_1){"use strict";var id="[A-Za-z_][A-Za-z0-9_]*",literal="(?:[0-9]*.[0-9]+|[0-9]+.?[0-9]*|"+id+")",paramList="(?: *"+id+"(?: *, *"+id+" *)*)?",argList="(?: *"+literal+"(?: *, *"+literal+" *)*)?",funDefSep="\\s",funDef="("+id+")"+funDefSep+"("+paramList+")"+funDefSep+"(.*)",funCall="("+id+")(?:\\(("+argList+")\\))?",evalCmd="^(eval)\\((.*)\\)$",defCmd="^(def) ("+id+") (.*)",regex={id:new RegExp(id),paramList:new RegExp(paramList),funDef:new RegExp(funDef),funCall:new RegExp(funCall),evalCmd:evalCmd,defCmd:defCmd},Parser=function(){function Parser(e){this.functions=[],e.addListener(this),this.ui=e,this.inputs=[]}return Parser.prototype.watch=function(e){var a=this;e.addEventListener("keydown",function(e){switch(e.keyCode){case 190:""==this.value&&(this.value=a.lastCommand,e.preventDefault())}}),e.addEventListener("keyup",function(e){switch(e.keyCode){case 13:a.parse(this.value)&&(this.value="")}}),this.inputs.push(e),e.focus()},Parser.prototype.parse=function(command){""==command&&(command=this.lastCommand),this.lastCommand=command;var matches=command.match(regex.defCmd);if(matches){var action=new types_1.Call;action.name=matches[1],action.params=[matches[2]];var result=void 0;try{result=eval(matches[3]),window[matches[2]]=result}catch(e){result="error"}return this.assign("ans",result),this.ui.newCall(command,action,result),!0}if(matches=command.match(regex.funDef)){var action=new types_1.Callable;return action.name=matches[1],action.params=this.split(matches[2],","),action.body=matches[3],this.functions.push(action),this.ui.newFunction(command,action),this.register(action),!0}if(matches=command.match(regex.evalCmd)){var action=new types_1.Call;action.name=matches[1],action.params=[];var result=void 0;try{result=eval(matches[2])}catch(e){result="error"}return this.assign("ans",result),this.ui.newCall(command,action,result),!0}if(matches=command.match(regex.funCall)){var action=new types_1.Call;action.name=matches[1],action.params=this.split(matches[2],",");var output=this.exec(action);return this.ui.newCall(command,action,output),!0}return!1},Parser.prototype.register=function(e){var a="function(";a+=e.params.join(","),a+=") { return ("+e.body+");}",this.assign(e.name,a)},Parser.prototype.exec=function(call){for(var name in this.builtin)if(this.builtin.hasOwnProperty(name)&&name==call.name){var str=name+"("+call.params.join(",")+")",result=eval(str);return this.assign("ans",result),result}for(var _i=0,_a=this.functions;_i<_a.length;_i++){var fn=_a[_i];if(fn.name==call.name){var expectedNum=fn.params.length,actualNum=call.params.length;if(expectedNum==actualNum){for(var i=0;i<actualNum;i++)this.assign(fn.params[i],eval(call.params[i]));var result=this.eval(fn);return this.assign("ans",result),result}return"wrong number of arguments (expected "+expectedNum+", got "+actualNum+")"}}return"undefined function '"+call.name+"'"},Parser.prototype.assign=function(name,value){"string"==typeof value&&(value="'"+value+"'"),eval("window."+name+"="+value)},Parser.prototype.eval=function(fn){return eval(fn.body)},Parser.prototype.setText=function(e){for(var a=0,t=this.inputs;a<t.length;a++){var n=t[a];n.value=e}this.inputs[0].focus()},Parser.prototype.loadNative=function(){function e(){for(var e=[],a=0;a<arguments.length;a++)e[a-0]=arguments[a];for(var t=0,n=0,r=e;n<r.length;n++){var i=r[n];t+=i}return t/e.length}function a(){for(var a=[],t=0;t<arguments.length;t++)a[t-0]=arguments[t];for(var n=e.apply(void 0,a),r=0,i=0,s=a;i<s.length;i++){var o=s[i];r+=Math.pow(o-n,2)}return r/(a.length-1)}function t(){for(var e=[],t=0;t<arguments.length;t++)e[t-0]=arguments[t];return Math.sqrt(a.apply(void 0,e))}function n(){for(var e=0,a=r.functions;e<a.length;e++){var t=a[e];console.log(t.name)}return""}this.functions=[{name:"log",params:["x"],body:"Math.log2(x)"},{name:"log2",params:["x"],body:"Math.log2(x)"},{name:"log10",params:["x"],body:"Math.log10(x)"},{name:"ln",params:["x"],body:"Math.log(x)"},{name:"pow",params:["x","y"],body:"Math.pow(x,y)"},{name:"sqrt",params:["x"],body:"Math.sqrt(x)"},{name:"cbrt",params:["x"],body:"Math.cbrt(x)"},{name:"rt",params:["r","x"],body:"Math.pow(x, 1/r)"},{name:"abs",params:["x"],body:"Math.abs(x)"},{name:"exp",params:["x"],body:"Math.exp(x)"},{name:"floor",params:["x"],body:"Math.floor(x)"},{name:"ceil",params:["x"],body:"Math.ceil(x)"},{name:"rand",params:[],body:"Math.random()"},{name:"ans",params:[],body:"ans"},{name:"dist",params:["x1","y1","x2","y2"],body:"(abs(x1-x2) + abs(y1-y2))/2"},{name:"edist",params:["x1","y1","x2","y2"],body:"Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))"},{name:"mdist",params:["x1","y1","x2","y2"],body:"abs(x1-x2) + abs(y1-y2)"},{name:"cdist",params:["x1","y1","x2","y2"],body:"max(abs(x1-x2), abs(y1-y2))"}];var r=this;this.builtin={avg:e,vari:a,sd:t,help:n};for(var i=0,s=this.functions;i<s.length;i++){var o=s[i];this.register(o)}for(var c in this.builtin)this.builtin.hasOwnProperty(c)&&(window[c]=this.builtin[c])},Parser.prototype.split=function(e,a){return e?e.split(a):[]},Parser}();exports.Parser=Parser}),define("main",["require","exports","Cache","Interface","Parser"],function(e,a,t,n,r){"use strict";$(document).ready(function(){var e=document.querySelector("#command"),a=document.querySelector("#console"),i=document.querySelector("#submit"),s=new r.Parser(new n.Interface(a));s.loadNative(),s.watch(e),i.addEventListener("click",function(){s.parse(e.value)&&(e.value="")}),t.Cache.setup()})});
