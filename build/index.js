!function(){"use strict";const t=(t,e)=>e.replace(t,(t=>`\\u${t.charCodeAt(0).toString(16).padStart(4,"0")}`)),e=t.bind(null,/[^-a-zA-Z0-9 ,:;'"!@%&_=<>`~]/g),s=t.bind(null,/[^a-zA-Z0-9 ,:;'"!@%&_=<>`~(){}.?+*$]/g),r=t=>{let e=0,r=-2;const n=[];for(let i=0;i<=t.length;++i){const h=i===t.length?-2:t[i].charCodeAt(0);if(h!==r+1){const r=i-e;e=i,r>1&&(3===r?n.push(s(t[i-2])):r>3&&n.push("-"),n.push(s(t[i-1]))),i<t.length&&n.push(s(t[i]))}r=h}return n.join("")};class n{constructor(t,e=!1){this.chars=t,this.inverted=e}includes(t){return-1!==this.chars.indexOf(t)!==this.inverted}isEmpty(){return!this.chars.length&&!this.inverted}isSingular(){return 1===this.chars.length&&!this.inverted}singularChar(){if(!this.isSingular())throw new Error("Not singular");return this.chars[0]}equals(t){if(this===t)return!0;if(this.inverted!==t.inverted||this.chars.length!==t.chars.length)return!1;this.chars.sort(),t.chars.sort();for(let e=0;e<this.chars.length;++e)if(this.chars[e]!==t.chars[e])return!1;return!0}intersects(t){return!(!this.inverted||!t.inverted)||(this.inverted?this.chars.length?t.chars.some((t=>this.includes(t))):t.chars.length>0:t.chars.length?this.chars.some((e=>t.includes(e))):this.chars.length>0&&t.inverted)}intersect(t){if(!this.inverted)return t.chars.length?new n(this.chars.filter((e=>t.includes(e))),!1):t.inverted?this:t;if(!t.inverted)return this.chars.length?new n(t.chars.filter((t=>this.includes(t))),!1):this.inverted?t:this;if(!this.chars.length||!t.chars.length)return this.chars.length?this:t;const e=new Set(this.chars);for(const s of t.chars)e.add(s);return new n([...e],!0)}union(t){if(this.inverted)return t.chars.length?new n(this.chars.filter((e=>!t.includes(e))),!0):t.inverted?t:this;if(t.inverted)return this.chars.length?new n(t.chars.filter((t=>!this.includes(t))),!0):this.inverted?this:t;if(!this.chars.length||!t.chars.length)return this.chars.length?this:t;const e=new Set(this.chars);for(const s of t.chars)e.add(s);return new n([...e],!1)}rangeTo(t){if(!this.isSingular()||!t.isSingular())throw new Error("Cannot create range using existing ranges");return n.range(this.singularChar(),t.singularChar())}inverse(){return new n(this.chars,!this.inverted)}toGraph(t){return[{chars:this,advance:1,nexts:t}]}toString(){return this.chars.length?(this.chars.sort(),this.inverted?`[^${r(this.chars)}]`:1===this.chars.length?e(this.chars[0]):`[${r(this.chars)}]`):this.inverted?".":"[]"}}function i(){return this.map((t=>t.toString())).join("")}n.ANY=new n([],!0),n.NONE=new n([],!1),n.of=t=>new n([...t]),n.ofCode=t=>new n([String.fromCharCode(t)]),n.range=(t,e)=>{const s=t.charCodeAt(0),r=e.charCodeAt(0),i=[];for(let t=Math.min(s,r);t<=Math.max(s,r);++t)i.push(String.fromCharCode(t));return new n(i)},n.union=(...t)=>t.reduce(((t,e)=>t.union(e)),n.NONE),n.NUMERIC=n.range("0","9"),n.ALPHA_NUMERIC=n.union(n.range("a","z"),n.range("A","Z"),n.NUMERIC,n.of("_")),n.SPACE=n.of([" ","\f","\n","\r","\t","\v","\xa0","\u1680","\u2028","\u2029","\u202f","\u205f","\u3000","\ufeff"]).union(n.range("\u2000","\u200a"));var h=(t,e=null)=>{let s=[...t];return s.length>0&&!(s[0]instanceof n)&&(s=s.map((t=>t===e?n.ANY:new n([t])))),Object.defineProperty(s,"toString",{value:i}),s};const a="0".charCodeAt(0);class o{constructor(t){this.data=t,this.pos=0,this.length=t.length}get(t=1){if(this.pos+t>this.length)throw new Error(`Incomplete token at ${this.pos} '${this.data}'`);return this.pos+=t,this.data.substr(this.pos-t,t)}check(t){const e=t.length;return!(this.pos+e>this.length)&&(this.data.substr(this.pos,e)===t&&(this.pos+=e,!0))}readUntil(t,e=!1){const s=this.pos,r=t.length;for(;this.pos+r<=this.length&&this.data.substr(this.pos,r)!==t;++this.pos);if(e&&!this.check(t))throw new Error(`Expected '${t}' after ${s} '${this.data}'`);return this.data.substring(s,this.pos)}readInt(){let t=null;for(;this.pos<this.length;++this.pos){const e=this.data.charCodeAt(this.pos)-a;if(e<0||e>9)break;t=10*(t??0)+e}return t}end(){return this.pos>=this.length}}class l{constructor(t,e,s=null){this.mode=t,this.inverted=e,this.condition=s}toGraph(){throw new Error("Assertions are not currently supported")}}class c{constructor(t,e){this.chars=t,this.invChars=t.inverse(),this.inverted=e}toGraph(t){const e=[{advance:-1,nexts:t}];return this.inverted?[{advance:-1,nexts:[...this.chars.toGraph(this.chars.toGraph(e)),...this.invChars.toGraph(this.invChars.toGraph(e))]}]:[{advance:-1,nexts:[...this.chars.toGraph(this.invChars.toGraph(e)),...this.invChars.toGraph(this.chars.toGraph(e))]}]}}class u{constructor(t){this.pos=t}toGraph(t){return[{pos:this.pos,nexts:t}]}}class d{constructor(t){this.ref=t}toGraph(){throw new Error("Backreferences are not currently supported")}}class p{constructor(t,e,s,r=null){if(this.min=t,this.max=e,this.mode=s,this.target=r,null!==this.max&&this.max<this.min)throw new Error(`Invalid quantifier range: ${t} - ${e}`)}withTarget(t){return new p(this.min,this.max,this.mode,t)}toGraph(t){const e="lazy"===this.mode?e=>[...t,...e]:e=>[...e,...t];let s;if(null===this.max){const t={nexts:[]};t.nexts=this.target.toGraph(e([t])),s=[t];for(let t=this.min-1;t>0;--t)s=this.target.toGraph(s)}else{s=[];for(let t=this.max;t>0;--t)s=this.target.toGraph(t>=this.min?e(s):s)}return 0===this.min?e(s):s}}class f{constructor(t){this.elements=t}toGraph(t){let e=t;for(let t=this.elements.length;t-- >0;)e=this.elements[t].toGraph(e);return e}}class g{constructor(t){this.options=t}toGraph(t){const e=[];for(const s of this.options)e.push(...s.toGraph(t));return e}}class m{constructor(t,e){this.name=t,this.target=e}toGraph(t){return this.target.toGraph(t)}}const v=Symbol(),w="A".charCodeAt(0),C=/^[0-9a-fA-F]+$/,E=t=>{if(!C.test(t))throw new Error(`Invalid hex value '${t}'`);return Number.parseInt(t,16)},D=new Map([["d",n.NUMERIC],["D",n.NUMERIC.inverse()],["w",n.ALPHA_NUMERIC],["W",n.ALPHA_NUMERIC.inverse()],["s",n.SPACE],["S",n.SPACE.inverse()],["t",n.of("\t")],["r",n.of("\r")],["n",n.of("\n")],["v",n.of("\v")],["f",n.of("\f")],["b",new c(n.ALPHA_NUMERIC,!1)],["B",new c(n.ALPHA_NUMERIC,!0)],["0",n.of("\0")],["c",t=>n.ofCode(1+t.get(1).charCodeAt(0)-w)],["x",t=>n.ofCode(E(t.get(2)))],["u",t=>{const e=t.check("{")?t.readUntil("}",!0):t.get(4);return n.ofCode(E(e))}],["\\",n.of("\\")],["k",t=>{if(!t.check("<"))throw new Error("Incomplete named backreference");return new d(t.readUntil(">",!0))}]]),M=new Map(D);M.set("b",n.of("\b")),M.delete("B"),M.delete("k");for(let t=1;t<10;++t)D.set(String(t),new d(t));function y(t,e,s){const r=t.get(s)??n.of(s);return"function"==typeof r?r(e):r}const x=t=>t.check("?")?"lazy":"greedy";function A(t){if(1===t.length)return t[0];const e=[];for(const s of t)s instanceof f?e.push(...s.elements):e.push(s);return new f(e)}function b(t){const e=[];let s=[];for(const r of t)if(r===v)e.push(A(s)),s=[];else if(r instanceof p){const t=s.pop();if(!t||t instanceof p)throw new Error("Invalid quantifier target");s.push(r.withTarget(t))}else s.push(r);return e.length?(e.push(A(s)),new g(e)):A(s)}const $=new Map([["\\",t=>y(D,t,t.get())],["^",new u(0)],["$",new u(-1)],["|",v],[".",n.ANY],["?",t=>new p(0,1,x(t))],["+",t=>new p(1,null,x(t))],["*",t=>new p(0,null,x(t))],["(",t=>{const e=(t=>{if(!t.check("?"))return{type:"capturing",name:null};if(t.check(":"))return{type:"inline"};if(t.check("="))return{type:"lookahead",inverted:!1};if(t.check("!"))return{type:"lookahead",inverted:!0};if(t.check("<="))return{type:"lookbehind",inverted:!1};if(t.check("<!"))return{type:"lookbehind",inverted:!0};if(t.check("<"))return{type:"capturing",name:t.readUntil(">",!0)};throw new Error(`Invalid group flags at ${t.pos}`)})(t),s=[];for(let e;")"!==(e=t.get());)s.push(y($,t,e));const r=b(s);switch(e.type){case"capturing":return new m(e.name,r);case"inline":return r;default:return new l(e.type,e.inverted,r)}}],["{",t=>{const e=t.readInt();if(null===e)throw new Error(`Invalid character in quantifier at ${t.pos}`);const s=t.check(",")?t.readInt():e;if(!t.check("}"))throw new Error(`Invalid character in quantifier at ${t.pos}`);return new p(e,s,x(t))}],["[",t=>{const e=t.check("^"),s=[];let r,i=!1;for(;"]"!==(r=t.get());)if("-"===r&&s.length>0)i=!0;else{let e="\\"===r?y(M,t,t.get()):n.of(r);i&&(i=!1,e=s.pop().rangeTo(e)),s.push(e)}if(i)throw new Error(`Incomplete character range at ${t.pos}`);const h=n.union(...s);return e?h.inverse():h}]]);function S(t,e,s){return(void 0===s.pos||e===(r=s.pos,n=t.length,(r%n+n)%n))&&!(s.chars&&!t[e].inputChars.intersects(s.chars));var r,n}class P{constructor(t,e=null){t instanceof RegExp||t instanceof P?(this.source=t.source,this.flags=e??t.flags):(this.source=String(t),this.flags=e??""),this.dotAll=this.flags.includes("s"),this.global=this.flags.includes("g"),this.hasIndices=this.flags.includes("d"),this.ignoreCase=this.flags.includes("i"),this.sticky=this.flags.includes("y"),this.unicode=this.flags.includes("u");const s=function(t){const e=[];for(const s=new o(t);!s.end();)e.push(y($,s,s.get()));return b(e)}(this.source);this.endNode={nexts:[]},this.beginNodes=s.toGraph([this.endNode])}reverse(t,e=null){const s=h(t,e),r=s.length;s.push(n.NONE);const i=s.map((t=>({inputChars:t,states:new Map,resolved:n.NONE})));let a=[{pos:-1,prevs:[],nexts:this.beginNodes,nextPos:0,node:null}];for(;a.length;){const t=[];for(const e of a){const s=e.nextPos;if(s<0||s>r)continue;const{states:n}=i[s];for(const r of e.nexts){const h=n.get(r);if(h)h.prevs.push(e);else if(S(i,s,r)){const i={pos:s,prevs:[e],nexts:r.nexts,nextPos:s+(r.advance??0),node:r};n.set(r,i),t.push(i)}}}a=t}const o=i[r].states.get(this.endNode);if(!o)return null;for(a=[o];a.length;){const t=[];for(const e of a){if(!e.node)continue;const s=i[e.pos];e.node.chars&&(s.resolved=s.resolved.union(e.node.chars)),t.push(...e.prevs),e.node=null}a=t}return i.pop(),h(i.map((t=>t.inputChars.intersect(t.resolved))))}test(t,e=null){return null!==this.reverse(t,e)}toString(){return this.pattern}}P.compile=t=>new P(t),P.CharacterClass=n,P.string=h;function N(t){return document.getElementById(t)}function k(t,e){return t.querySelector(`[name="${e}"]`)}function R(t){return t.replace(/\u0000/g,"\u2400").replace(/\u0001/g,"\u2401").replace(/\u0002/g,"\u2402").replace(/\u0003/g,"\u2403").replace(/\u0004/g,"\u2404").replace(/\u0005/g,"\u2405").replace(/\u0006/g,"\u2406").replace(/\u0007/g,"\u2407").replace(/\u0008/g,"\u2408").replace(/\u0009/g,"\u2409").replace(/\u000A/g,"\u240a").replace(/\u000B/g,"\u240b").replace(/\u000C/g,"\u240c").replace(/\u000D/g,"\u240d").replace(/\u000E/g,"\u240e").replace(/\u000F/g,"\u240f").replace(/\u0010/g,"\u2410").replace(/\u0011/g,"\u2411").replace(/\u0012/g,"\u2412").replace(/\u0013/g,"\u2413").replace(/\u0014/g,"\u2414").replace(/\u0015/g,"\u2415").replace(/\u0016/g,"\u2416").replace(/\u0017/g,"\u2417").replace(/\u0018/g,"\u2418").replace(/\u0019/g,"\u2419").replace(/\u001A/g,"\u241a").replace(/\u001B/g,"\u241b").replace(/\u001C/g,"\u241c").replace(/\u001D/g,"\u241d").replace(/\u001E/g,"\u241e").replace(/\u001F/g,"\u241f").replace(/\s/g,"\u2420")}function I(t){t.preventDefault()}class G{constructor(t,e){this.form=t,this.patternCache=e,this.debounce=-1,this.refresh=this.refresh.bind(this),this.debouncedRefresh=this.debouncedRefresh.bind(this)}init(){this.form.addEventListener("submit",I),this.form.addEventListener("input",this.debouncedRefresh),this.refresh()}debouncedRefresh(){window.clearTimeout(this.debounce),this.debounce=window.setTimeout(this.refresh,0)}}function L(t){return t.every((t=>t.isSingular()))}function O(t,e){if(t.length!==e.length)return!1;for(let s=0;s<t.length;++s)if(!t[s].equals(e[s]))return!1;return!0}class U extends G{constructor(t,e,s,r){super(t,e),this.dimensions=s,this.grid=r,this.eError=this.form.querySelector(".error"),this.eDims=s.map((t=>k(this.form,`${t}s`)))}init(){super.init(),this.dimensions.forEach(((t,e)=>{k(this.form,`add-${t}`).addEventListener("click",this.addDim.bind(this,e)),k(this.form,`remove-${t}`).addEventListener("click",this.removeDim.bind(this,e))}))}refresh(){this.grid.resize(this.dimensions.map(((t,e)=>this.getDim(e))));const t=this.grid.getBlankData(),e=this.grid.getClues();try{const s=function(t,e){let s=t;for(;;){const t=[...s];for(const{name:s,pattern:r,indices:n}of e){const e=r.reverse(n.map((e=>t[e])));if(!e)throw new Error(`Failed to match ${s}`);n.forEach(((s,r)=>{t[s]=e[r]}))}if(L(t)||O(s,t))return t;s=t}}(t,e.map((({name:t,pattern:e,indices:s})=>{try{return{name:t,pattern:this.patternCache.get(e),indices:s}}catch(e){throw new Error(`${e} in ${t}`)}})));this.grid.setData(s),this.error=null}catch(t){this.grid.clearData(),this.error=String(t)}}addDim(t){this.setDim(t,this.getDim(t)+1),this.refresh()}removeDim(t){const e=this.getDim(t);e>1&&(this.setDim(t,e-1),this.refresh())}getDim(t){return Number.parseInt(this.eDims[t].value,10)}setDim(t,e){this.eDims[t].value=String(e)}set error(t){null!==t?this.form.classList.add("fail"):this.form.classList.remove("fail"),this.eError.innerText=null!=t?t:""}}class z{constructor(t){this.container=t,this.patternRows=[],this.patternCols=[],this.patternAltRows=[],this.patternAltCols=[],this.cells=[],this.isDouble=!1}getBlankData(){const t=[];return this.cells.forEach((e=>e.forEach((()=>t.push(P.CharacterClass.ANY))))),t}clearData(){this.cells.forEach((t=>t.forEach((t=>{t.eCell.classList.remove("solved"),t.value=""}))))}setData(t){const e=this.patternCols.length;this.cells.forEach(((s,r)=>s.forEach(((s,n)=>{const i=t[r*e+n];i.isSingular()?(s.eCell.classList.add("solved"),s.value=R(i.singularChar())):(s.eCell.classList.remove("solved"),s.value=String(i))}))))}getClues(){const t=this.patternRows.length,e=this.patternCols.length,s=[];for(let r=0;r<t;++r){const t=[];for(let s=0;s<e;++s)t.push(r*e+s);s.push({name:`row ${r+1}`,pattern:this.patternRows[r].pattern,indices:t}),this.isDouble&&s.push({name:`alt row ${r+1}`,pattern:this.patternAltRows[r].pattern,indices:t})}for(let r=0;r<e;++r){const n=[];for(let s=0;s<t;++s)n.push(s*e+r);s.push({name:`column ${r+1}`,pattern:this.patternCols[r].pattern,indices:n}),this.isDouble&&s.push({name:`alt column ${r+1}`,pattern:this.patternAltCols[r].pattern,indices:n})}return s}updateDouble(t){t!==this.isDouble&&(this.removeDOM(),this.isDouble=t,this.addDOM())}resize([t,e]){const s=this.patternRows.length,r=this.patternCols.length;if(t!==s||e!==r){this.removeDOM();for(let e=s;e<t;++e)this.cells.push([]),this.patternRows.push(new _("row",e)),this.patternAltRows.push(new _("altrow",e));for(let t=r;t<e;++t)this.patternCols.push(new _("col",t)),this.patternAltCols.push(new _("altcol",t));for(let s=0;s<t;++s){const t=this.cells[s];for(let r=t.length;r<e;++r)t.push(new q(s,r));t.length=e}this.patternRows.length=t,this.patternCols.length=e,this.patternAltRows.length=t,this.patternAltCols.length=e,this.cells.length=t,this.addDOM()}}removeDOM(){[...this.patternRows,...this.patternCols].forEach((t=>this.container.removeChild(t.ePattern))),this.isDouble&&[...this.patternAltRows,...this.patternAltCols].forEach((t=>this.container.removeChild(t.ePattern))),this.cells.forEach((t=>t.forEach((t=>this.container.removeChild(t.eCell)))))}addDOM(){const t=this.patternRows.length,e=this.patternCols.length;this.patternCols.forEach((t=>this.container.appendChild(t.ePattern)));for(let e=0;e<t;++e)this.container.appendChild(this.patternRows[e].ePattern),this.cells[e].forEach((t=>this.container.appendChild(t.eCell))),this.isDouble&&this.container.appendChild(this.patternAltRows[e].ePattern);this.isDouble&&this.patternAltCols.forEach((t=>this.container.appendChild(t.ePattern))),this.container.style.width=`calc(var(--w) * ${e})`,this.container.style.height=`calc(var(--h) * ${t})`}}class _{constructor(t,e){this.ePattern=document.createElement("input"),this.ePattern.setAttribute("type","text"),this.ePattern.setAttribute("name",`pattern_${t}_${e}`),"col"===t||"altcol"===t?this.ePattern.style.left=`calc(var(--w) * ${e})`:this.ePattern.style.top=`calc(var(--h) * ${e})`,this.ePattern.className=`pattern ${t}`,this.ePattern.value=".*"}get pattern(){return this.ePattern.value}}class q{constructor(t,e){this.eCell=document.createElement("output"),this.eCell.setAttribute("name",`out_${t}_${e}`),this.eCell.className="cell",this.eCell.style.top=`calc(var(--h) * ${t})`,this.eCell.style.left=`calc(var(--w) * ${e})`}set value(t){this.eCell.value=t||" "}}function B(t,e){t.style.top=e.top,t.style.left=e.left}class T{constructor(t){this.container=t,this.d1=-1,this.d2=-1,this.d3=-1,this.patterns1=[],this.patterns2=[],this.patterns3=[],this.cells=[],this.corners=[]}corner(t){return this.corners[t-1]}getBlankData(){return this.cells.map((()=>P.CharacterClass.ANY))}clearData(){this.cells.forEach((t=>{t.eCell.classList.remove("solved"),t.value=""}))}setData(t){this.cells.forEach(((e,s)=>{const r=t[s];r.isSingular()?(e.eCell.classList.add("solved"),e.value=R(r.singularChar())):(e.eCell.classList.remove("solved"),e.value=String(r))}))}getClues(){const{d1:t,d2:e,d3:s}=this,r=this.patterns1.map(((t,e)=>({name:`\u2199 ${e+1}`,pattern:t.pattern,indices:[]}))),n=this.patterns2.map(((t,e)=>({name:`\u2192 ${e+1}`,pattern:t.pattern,indices:[]}))),i=this.patterns3.map(((t,e)=>({name:`\u2196 ${e+1}`,pattern:t.pattern,indices:[]})));let h=0;for(let a=0;a<t+s-1;++a){const o=Math.max(0,a-(t-1)),l=Math.min(a+e,e+s-1);for(let e=o;e<l;++e){const s=a,o=e-a+(t-1);r[this.patterns1.length-e-1].indices.push(h),n[s].indices.push(h),i[o].indices.unshift(h),++h}}return[...r,...n,...i]}resize([t,e,s]){if(t===this.d1&&e===this.d2&&s===this.d3)return;this.removeDOM(),this.patterns1.length=0,this.patterns2.length=0,this.patterns3.length=0,this.cells.length=0;const{D1:r,D2:n,D3:i}=T,h=new H(0,t-1),a=h.addMult(r,t-1),o=a.addMult(n,e-1),l=o.addMult(i,s-1),c=l.addMult(r,-(t-1)),u=c.addMult(n,-(e-1));this.corners=[h,a,o,l,c,u];for(let e=0;e<t;++e)this.patterns2.push(new Y("d2",a.addMult(r,-e).addMult(n,-1)));for(let t=1;t<s;++t)this.patterns2.push(new Y("d2",h.addMult(i,t).addMult(n,-1)));for(let t=0;t<e;++t)this.patterns3.push(new Y("d3",u.addMult(n,t).addMult(i,1)));for(let e=1;e<t;++e)this.patterns3.push(new Y("d3",c.addMult(r,e).addMult(i,1)));for(let t=0;t<s;++t)this.patterns1.push(new Y("d1",l.addMult(i,-t).addMult(r,1)));for(let t=1;t<e;++t)this.patterns1.push(new Y("d1",o.addMult(n,-t).addMult(r,1)));for(let i=0;i<t+s-1;++i){const h=a.addMult(r,-i),o=Math.max(0,i-(t-1)),l=Math.min(i+e,e+s-1);for(let t=o;t<l;++t)this.cells.push(new F(h.addMult(n,t)))}this.d1=t,this.d2=e,this.d3=s,this.addDOM()}removeDOM(){[...this.patterns2,...this.patterns3,...this.patterns1].forEach((t=>this.container.removeChild(t.ePattern))),this.cells.forEach((t=>this.container.removeChild(t.eCell)))}addDOM(){[...this.patterns2,...this.patterns3,...this.patterns1].forEach((t=>this.container.appendChild(t.ePattern))),this.cells.forEach((t=>this.container.appendChild(t.eCell))),this.container.style.width=`calc(var(--sx) * ${.5*this.d1+this.d2+.5*this.d3-2})`,this.container.style.height=`calc(var(--sy) * ${this.d1+this.d3-2})`}}T.D1={x:.5,y:-1},T.D2={x:1,y:0},T.D3={x:.5,y:1};class H{constructor(t,e){this.x=t,this.y=e}addMult(t,e){return new H(this.x+t.x*e,this.y+t.y*e)}get left(){return`calc(var(--sx) * ${this.x})`}get top(){return`calc(var(--sy) * ${this.y})`}}class Y{constructor(t,e){this.ePattern=document.createElement("input"),this.ePattern.setAttribute("type","text"),B(this.ePattern,e),this.ePattern.className=`pattern ${t}`,this.ePattern.value=".*"}get pattern(){return this.ePattern.value}}class F{constructor(t){this.eCell=document.createElement("output"),this.eCell.className="cell",B(this.eCell,t)}set value(t){this.eCell.value=t||" "}}const j=new class{constructor(t,e){this.generator=t,this.maxSize=e,this.cache=new Map}get(t){if(this.maxSize<=0)return this.generator(t);const e=this.cache.get(t);if(e)return this.cache.delete(t),this.cache.set(t,e),e;const s=this.generator(t);return this.cache.set(t,s),this.cache.size>this.maxSize&&this.cache.delete(this.cache.keys().next().value),s}}(P.compile,100);new class extends G{constructor(){super(...arguments),this.ePattern=k(this.form,"pattern"),this.eInput=k(this.form,"input"),this.eOutput=k(this.form,"output"),this.eError=this.form.querySelector(".error")}refresh(){try{const t=this.patternCache.get(this.pattern).reverse(this.input,"?");null===t?(this.output="",this.error="No match"):(this.output=R(String(t)),this.error=null)}catch(t){this.output="",this.error=String(t)}}get pattern(){return this.ePattern.value}get input(){return this.eInput.value}set output(t){this.eOutput.value=t||" "}set error(t){null!==t?this.form.classList.add("fail"):this.form.classList.remove("fail"),this.eError.innerText=null!=t?t:""}}(N("form-single"),j).init(),new class extends U{constructor(t,e){super(t,e,["row","col"],new z(t.querySelector(".grid"))),this.eDouble=k(this.form,"double")}refresh(){this.grid.updateDouble(this.eDouble.checked),super.refresh()}}(N("form-rect"),j).init(),new class extends U{constructor(t,e){super(t,e,["d1","d2","d3"],new T(t.querySelector(".grid")))}refresh(){super.refresh(),B(k(this.form,"add-d1"),this.grid.corner(6).addMult(T.D1,-1.7)),B(k(this.form,"remove-d1"),this.grid.corner(6).addMult(T.D1,-1)),B(k(this.form,"add-d2"),this.grid.corner(4).addMult(T.D2,1.7)),B(k(this.form,"remove-d2"),this.grid.corner(4).addMult(T.D2,1)),B(k(this.form,"add-d3"),this.grid.corner(2).addMult(T.D3,-1.7)),B(k(this.form,"remove-d3"),this.grid.corner(2).addMult(T.D3,-1))}}(N("form-hex"),j).init(),document.body.removeChild(N("loading"))}();
