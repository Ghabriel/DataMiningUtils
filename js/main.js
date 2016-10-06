define("types",["require","exports"],function(e,a){"use strict";var n=function(){function e(){}return e}();a.Callable=n;var r=function(){function e(){}return e}();a.Call=r}),define("Interface",["require","exports"],function(e,a){"use strict";var n=function(){function e(e){this.console=e}return e.prototype.newFunction=function(e){var a=document.createElement("div");a.classList.add("fn_def"),a.innerHTML+="<div class='name'>"+e.name+"</div>",a.innerHTML+="<div class='params'>"+e.params.join(",")+"</div>",a.innerHTML+="<div class='body'>"+e.body+"</div>",this.console.appendChild(a)},e.prototype.newCall=function(e,a){var n=document.createElement("div");n.classList.add("fn_call"),n.innerHTML+="<div class='name'>"+e.name+"</div>",n.innerHTML+="<div class='params'>"+e.params.join(",")+"</div>",n.innerHTML+="<div class='result'>"+a+"</div>",this.console.appendChild(n)},e}();a.Interface=n}),define("Parser",["require","exports","types"],function(require,exports,types_1){"use strict";var id="[A-Za-z_][A-Za-z0-9_]*",literal="[0-9]*.[0-9]+|[0-9]+.?[0-9]*",paramList="(?: *"+id+"(?: *, *"+id+" *)*)?",argList="(?: *"+literal+"(?: *, *"+literal+" *)*)?",funDefSep="(?:\\.|\\s)",funDef="("+id+")"+funDefSep+"("+paramList+")"+funDefSep+"(.*)",funCall="("+id+")(?:\\(("+argList+")\\))?",regex={id:new RegExp(id),paramList:new RegExp(paramList),funDef:new RegExp(funDef),funCall:new RegExp(funCall)},Parser=function(){function Parser(e){this.functions=[],this.ui=e}return Parser.prototype.watch=function(e){var a=this;e.addEventListener("keyup",function(e){switch(e.keyCode){case 13:a.parse(this.value)&&(this.value="")}})},Parser.prototype.parse=function(e){var a=e.match(regex.funDef);if(a){var n=new types_1.Callable;return n.name=a[1],n.params=this.split(a[2],","),n.body=a[3],this.functions.push(n),this.ui.newFunction(n),this.register(n),!0}if(a=e.match(regex.funCall)){var n=new types_1.Call;n.name=a[1],n.params=this.split(a[2],",");var r=this.exec(n);return this.ui.newCall(n,r),!0}return!1},Parser.prototype.split=function(e,a){return e?e.split(a):[]},Parser.prototype.register=function(e){var a="function(";a+=e.params.join(","),a+=") { return ("+e.body+");}",this.assign(e.name,a)},Parser.prototype.exec=function(e){for(var a=0,n=this.functions;a<n.length;a++){var r=n[a];if(r.name==e.name){var t=r.params.length,s=e.params.length;if(t==s){for(var i=0;i<s;i++)this.assign(r.params[i],e.params[i]);return this.eval(r)}return"wrong number of arguments (expected "+t+", got "+s+")"}}return"undefined function '"+e.name+"'"},Parser.prototype.assign=function(name,value){eval("window."+name+"="+value)},Parser.prototype.eval=function(fn){return eval(fn.body)},Parser.prototype.loadNative=function(){this.functions=[{name:"log",params:["x"],body:"Math.log2(x)"},{name:"log2",params:["x"],body:"Math.log2(x)"},{name:"log10",params:["x"],body:"Math.log10(x)"},{name:"ln",params:["x"],body:"Math.log(x)"},{name:"sqrt",params:["x"],body:"Math.sqrt(x)"},{name:"cbrt",params:["x"],body:"Math.cbrt(x)"},{name:"rt",params:["r","x"],body:"Math.pow(x, 1/r)"},{name:"abs",params:["x"],body:"Math.abs(x)"},{name:"exp",params:["x"],body:"Math.exp(x)"},{name:"floor",params:["x"],body:"Math.floor(x)"},{name:"ceil",params:["x"],body:"Math.ceil(x)"},{name:"rand",params:[],body:"Math.random()"}];for(var e=0,a=this.functions;e<a.length;e++){var n=a[e];this.register(n)}},Parser}();exports.Parser=Parser}),define("main",["require","exports","Interface","Parser"],function(e,a,n,r){"use strict";$(document).ready(function(){var e=document.querySelector("#command"),a=document.querySelector("#console"),t=document.querySelector("#submit"),s=new r.Parser(new n.Interface(a));t.addEventListener("click",function(){s.parse(e.value)&&(e.value="")}),s.loadNative(),s.watch(e)})});