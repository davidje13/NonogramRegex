!function(){"use strict";const t=(t,e)=>e.replace(t,(t=>`\\u${t.charCodeAt(0).toString(16).padStart(4,"0")}`)),e=t.bind(null,/[^-a-zA-Z0-9 ,:;'"!@%&_=<>`~]/g),r=t.bind(null,/[^a-zA-Z0-9 ,:;'"!@%&_=<>`~(){}.?+*$]/g),n=t=>{let e=0,n=-2;const s=[];for(let i=0;i<=t.length;++i){const h=i===t.length?-2:t[i].charCodeAt(0);if(h!==n+1){const n=i-e;e=i,n>1&&(3===n?s.push(r(t[i-2])):n>3&&s.push("-"),s.push(r(t[i-1]))),i<t.length&&s.push(r(t[i]))}n=h}return s.join("")};class s{constructor(t,e=!1){this.chars=t,this.inverted=e}includes(t){return-1!==this.chars.indexOf(t)!==this.inverted}isEmpty(){return!this.chars.length&&!this.inverted}isSingular(){return 1===this.chars.length&&!this.inverted}singularChar(){if(!this.isSingular())throw new Error("Not singular");return this.chars[0]}intersects(t){return!(!this.inverted||!t.inverted)||(this.inverted?!this.chars.length||t.chars.some((t=>this.includes(t))):t.chars.length?this.chars.some((e=>t.includes(e))):t.inverted)}intersect(t){if(!this.inverted)return t.chars.length?new s(this.chars.filter((e=>t.includes(e))),!1):t.inverted?this:t;if(!t.inverted)return this.chars.length?new s(t.chars.filter((t=>this.includes(t))),!1):this.inverted?t:this;if(!this.chars.length||!t.chars.length)return this.chars.length?this:t;const e=new Set(this.chars);for(const r of t.chars)e.add(r);return new s([...e],!0)}union(t){if(this.inverted)return t.chars.length?new s(this.chars.filter((e=>!t.includes(e))),!0):t.inverted?t:this;if(t.inverted)return this.chars.length?new s(t.chars.filter((t=>!this.includes(t))),!0):this.inverted?this:t;if(!this.chars.length||!t.chars.length)return this.chars.length?this:t;const e=new Set(this.chars);for(const r of t.chars)e.add(r);return new s([...e],!1)}rangeTo(t){if(!this.isSingular()||!t.isSingular())throw new Error("Cannot create range using existing ranges");return s.range(this.singularChar(),t.singularChar())}inverse(){return new s(this.chars,!this.inverted)}toGraph(t){return[{chars:this,advance:1,nexts:t}]}toString(){return this.chars.length?(this.chars.sort(),this.inverted?`[^${n(this.chars)}]`:1===this.chars.length?e(this.chars[0]):`[${n(this.chars)}]`):this.inverted?".":"\\u0000"}}function i(){return this.map((t=>t.toString())).join("")}s.ANY=new s([],!0),s.NONE=new s([],!1),s.of=t=>new s([...t]),s.ofCode=t=>new s([String.fromCharCode(t)]),s.range=(t,e)=>{const r=t.charCodeAt(0),n=e.charCodeAt(0),i=[];for(let t=Math.min(r,n);t<=Math.max(r,n);++t)i.push(String.fromCharCode(t));return new s(i)},s.union=(...t)=>t.reduce(((t,e)=>t.union(e)),s.NONE),s.NUMERIC=s.range("0","9"),s.ALPHA_NUMERIC=s.union(s.range("a","z"),s.range("A","Z"),s.NUMERIC,s.of("_")),s.SPACE=s.of([" ","\f","\n","\r","\t","\v","\xa0","\u1680","\u2028","\u2029","\u202f","\u205f","\u3000","\ufeff"]).union(s.range("\u2000","\u200a"));var h=(t,e=null)=>{let r=[...t];return r.length>0&&!(r[0]instanceof s)&&(r=r.map((t=>t===e?s.ANY:new s([t])))),Object.defineProperty(r,"toString",{value:i}),r};const o="0".charCodeAt(0);class a{constructor(t){this.data=t,this.pos=0,this.length=t.length}get(t=1){if(this.pos+t>this.length)throw new Error(`Incomplete token at ${this.pos} '${this.data}'`);return this.pos+=t,this.data.substr(this.pos-t,t)}check(t){const e=t.length;return!(this.pos+e>this.length)&&(this.data.substr(this.pos,e)===t&&(this.pos+=e,!0))}readUntil(t,e=!1){const r=this.pos,n=t.length;for(;this.pos+n<=this.length&&this.data.substr(this.pos,n)!==t;++this.pos);if(e&&!this.check(t))throw new Error(`Expected '${t}' after ${r} '${this.data}'`);return this.data.substring(r,this.pos)}readInt(){let t=null;for(;this.pos<this.length;++this.pos){const e=this.data.charCodeAt(this.pos)-o;if(e<0||e>9)break;t=10*(t??0)+e}return t}end(){return this.pos>=this.length}}class c{constructor(t,e,r=null){this.mode=t,this.inverted=e,this.condition=r}toGraph(){throw new Error("Assertions are not currently supported")}}class l{constructor(t,e){this.chars=t,this.invChars=t.inverse(),this.inverted=e}toGraph(t){const e=[{advance:-1,nexts:t}];return this.inverted?[{advance:-1,nexts:[...this.chars.toGraph(this.chars.toGraph(e)),...this.invChars.toGraph(this.invChars.toGraph(e))]}]:[{advance:-1,nexts:[...this.chars.toGraph(this.invChars.toGraph(e)),...this.invChars.toGraph(this.chars.toGraph(e))]}]}}class u{constructor(t){this.pos=t}toGraph(t){return[{pos:this.pos,nexts:t}]}}class p{constructor(t){this.ref=t}toGraph(){throw new Error("Backreferences are not currently supported")}}class g{constructor(t,e,r,n=null){if(this.min=t,this.max=e,this.mode=r,this.target=n,null!==this.max&&this.max<this.min)throw new Error(`Invalid quantifier range: ${t} - ${e}`)}withTarget(t){return new g(this.min,this.max,this.mode,t)}toGraph(t){const e="lazy"===this.mode?e=>[...t,...e]:e=>[...e,...t];let r;if(null===this.max){const t={nexts:[]};t.nexts=this.target.toGraph(e([t])),r=[t];for(let t=this.min-1;t>0;--t)r=this.target.toGraph(r)}else{r=[];for(let t=this.max;t>0;--t)r=this.target.toGraph(t>=this.min?e(r):r)}return 0===this.min?e(r):r}}class d{constructor(t){this.elements=t}toGraph(t){let e=t;for(let t=this.elements.length;t-- >0;)e=this.elements[t].toGraph(e);return e}}class f{constructor(t){this.options=t}toGraph(t){const e=[];for(const r of this.options)e.push(...r.toGraph(t));return e}}class v{constructor(t,e){this.name=t,this.target=e}toGraph(t){return this.target.toGraph(t)}}const w=Symbol(),m="A".charCodeAt(0),C=/^[0-9a-fA-F]+$/,E=t=>{if(!C.test(t))throw new Error(`Invalid hex value '${t}'`);return Number.parseInt(t,16)},x=new Map([["d",s.NUMERIC],["D",s.NUMERIC.inverse()],["w",s.ALPHA_NUMERIC],["W",s.ALPHA_NUMERIC.inverse()],["s",s.SPACE],["S",s.SPACE.inverse()],["t",s.of("\t")],["r",s.of("\r")],["n",s.of("\n")],["v",s.of("\v")],["f",s.of("\f")],["b",new l(s.ALPHA_NUMERIC,!1)],["B",new l(s.ALPHA_NUMERIC,!0)],["0",s.of("\0")],["c",t=>s.ofCode(1+t.get(1).charCodeAt(0)-m)],["x",t=>s.ofCode(E(t.get(2)))],["u",t=>{const e=t.check("{")?t.readUntil("}",!0):t.get(4);return s.ofCode(E(e))}],["\\",s.of("\\")],["k",t=>{if(!t.check("<"))throw new Error("Incomplete named backreference");return new p(t.readUntil(">",!0))}]]),A=new Map(x);A.set("b",s.of("\b")),A.delete("B"),A.delete("k");for(let t=1;t<10;++t)x.set(String(t),new p(t));function N(t,e,r){const n=t.get(r)??s.of(r);return"function"==typeof n?n(e):n}const k=t=>t.check("?")?"lazy":"greedy";function S(t){if(1===t.length)return t[0];const e=[];for(const r of t)r instanceof d?e.push(...r.elements):e.push(r);return new d(e)}function y(t){const e=[];let r=[];for(const n of t)if(n===w)e.push(S(r)),r=[];else if(n instanceof g){const t=r.pop();if(!t||t instanceof g)throw new Error("Invalid quantifier target");r.push(n.withTarget(t))}else r.push(n);return e.length?(e.push(S(r)),new f(e)):S(r)}const G=new Map([["\\",t=>N(x,t,t.get())],["^",new u(0)],["$",new u(-1)],["|",w],[".",s.ANY],["?",t=>new g(0,1,k(t))],["+",t=>new g(1,null,k(t))],["*",t=>new g(0,null,k(t))],["(",t=>{const e=(t=>{if(!t.check("?"))return{type:"capturing",name:null};if(t.check(":"))return{type:"inline"};if(t.check("="))return{type:"lookahead",inverted:!1};if(t.check("!"))return{type:"lookahead",inverted:!0};if(t.check("<="))return{type:"lookbehind",inverted:!1};if(t.check("<!"))return{type:"lookbehind",inverted:!0};if(t.check("<"))return{type:"capturing",name:t.readUntil(">",!0)};throw new Error(`Invalid group flags at ${t.pos}`)})(t),r=[];for(let e;")"!==(e=t.get());)r.push(N(G,t,e));const n=y(r);switch(e.type){case"capturing":return new v(e.name,n);case"inline":return n;default:return new c(e.type,e.inverted,n)}}],["{",t=>{const e=t.readInt();if(null===e)throw new Error(`Invalid character in quantifier at ${t.pos}`);const r=t.check(",")?t.readInt():e;if(!t.check("}"))throw new Error(`Invalid character in quantifier at ${t.pos}`);return new g(e,r,k(t))}],["[",t=>{const e=t.check("^"),r=[];let n,i=!1;for(;"]"!==(n=t.get());)if("-"===n&&r.length>0)i=!0;else{let e="\\"===n?N(A,t,t.get()):s.of(n);i&&(i=!1,e=r.pop().rangeTo(e)),r.push(e)}if(i)throw new Error(`Incomplete character range at ${t.pos}`);const h=s.union(...r);return e?h.inverse():h}]]);function I(t,e,r){return(void 0===r.pos||e===(n=r.pos,s=t.length,(n%s+s)%s))&&!(r.chars&&!t[e].inputChars.intersects(r.chars));var n,s}class b{constructor(t,e=null){t instanceof RegExp||t instanceof b?(this.source=t.source,this.flags=e??t.flags):(this.source=String(t),this.flags=e??""),this.dotAll=this.flags.includes("s"),this.global=this.flags.includes("g"),this.hasIndices=this.flags.includes("d"),this.ignoreCase=this.flags.includes("i"),this.sticky=this.flags.includes("y"),this.unicode=this.flags.includes("u");const r=function(t){const e=[];for(const r=new a(t);!r.end();)e.push(N(G,r,r.get()));return y(e)}(this.source);this.endNode={nexts:[]},this.beginNodes=r.toGraph([this.endNode])}reverse(t,e=null){const r=h(t,e),n=r.length;r.push(s.NONE);const i=r.map((t=>({inputChars:t,states:new Map,resolved:s.NONE})));let o=[{pos:-1,prevs:[],nexts:this.beginNodes,nextPos:0,node:null}];for(;o.length;){const t=[];for(const e of o){const r=e.nextPos;if(r<0||r>n)continue;const{states:s}=i[r];for(const n of e.nexts){const h=s.get(n);if(h)h.prevs.push(e);else if(I(i,r,n)){const i={pos:r,prevs:[e],nexts:n.nexts,nextPos:r+(n.advance??0),node:n};s.set(n,i),t.push(i)}}}o=t}const a=i[n].states.get(this.endNode);if(!a)return null;for(o=[a];o.length;){const t=[];for(const e of o){if(!e.node)continue;const r=i[e.pos];e.node.chars&&(r.resolved=r.resolved.union(e.node.chars)),t.push(...e.prevs),e.node=null}o=t}return i.pop(),h(i.map((t=>t.inputChars.intersect(t.resolved))))}test(t,e=null){return null!==this.reverse(t,e)}toString(){return this.pattern}}b.compile=t=>new b(t),b.CharacterClass=s,b.string=h;function $(t){return document.getElementById(t)}function M(t,e){t.addEventListener("submit",(t=>t.preventDefault()));for(const r of t.getElementsByTagName("input"))r.addEventListener("input",e);e()}const U=new class{constructor(t,e){this.generator=t,this.maxSize=e,this.cache=new Map}get(t){if(this.maxSize<=0)return this.generator(t);const e=this.cache.get(t);if(e)return this.cache.delete(t),this.cache.set(t,e),e;const r=this.generator(t);return this.cache.set(t,r),this.cache.size>this.maxSize&&this.cache.delete(this.cache.keys().next().value),r}}(b.compile,100),P=$("form-single"),L=$("single-pattern"),R=$("single-input"),z=$("single-output"),T=$("single-error");M(P,(function(){try{const t=U.get(L.value).reverse(R.value,"?");null===t?(z.value=" ",P.classList.add("fail"),T.innerText="No match"):(z.value=String(t).replace(/\u0000/g,"\u2400").replace(/\u0001/g,"\u2401").replace(/\u0002/g,"\u2402").replace(/\u0003/g,"\u2403").replace(/\u0004/g,"\u2404").replace(/\u0005/g,"\u2405").replace(/\u0006/g,"\u2406").replace(/\u0007/g,"\u2407").replace(/\u0008/g,"\u2408").replace(/\u0009/g,"\u2409").replace(/\u000A/g,"\u240a").replace(/\u000B/g,"\u240b").replace(/\u000C/g,"\u240c").replace(/\u000D/g,"\u240d").replace(/\u000E/g,"\u240e").replace(/\u000F/g,"\u240f").replace(/\u0010/g,"\u2410").replace(/\u0011/g,"\u2411").replace(/\u0012/g,"\u2412").replace(/\u0013/g,"\u2413").replace(/\u0014/g,"\u2414").replace(/\u0015/g,"\u2415").replace(/\u0016/g,"\u2416").replace(/\u0017/g,"\u2417").replace(/\u0018/g,"\u2418").replace(/\u0019/g,"\u2419").replace(/\u001A/g,"\u241a").replace(/\u001B/g,"\u241b").replace(/\u001C/g,"\u241c").replace(/\u001D/g,"\u241d").replace(/\u001E/g,"\u241e").replace(/\u001F/g,"\u241f").replace(/\s/g,"\u2420")||" ",P.classList.remove("fail"),T.innerText=" ")}catch(t){z.value=" ",P.classList.add("fail"),T.innerText=String(t)}})),M($("form-rect"),(function(){})),M($("form-hex"),(function(){})),document.body.removeChild($("loading"))}();
