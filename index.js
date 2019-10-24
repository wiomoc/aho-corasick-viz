!function(t){var e={};function i(s){if(e[s])return e[s].exports;var n=e[s]={i:s,l:!1,exports:{}};return t[s].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=e,i.d=function(t,e,s){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(s,n,function(e){return t[e]}.bind(null,n));return s},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=1)}([function(t,e,i){},function(t,e,i){"use strict";i.r(e);i(0);const s=["rgb(55, 126, 184)","rgb(102, 166, 30)","rgb(152, 78, 163)","rgb(0, 210, 213)","rgb(255, 127, 0)","rgb(175, 141, 0)","rgb(127, 128, 205)","rgb(179, 233, 0)","rgb(196, 46, 96)","rgb(166, 86, 40)"];let n=0;const o="http://www.w3.org/2000/svg";class r{constructor(t,e,i,s,n,o=null){this.x1=t,this.y1=e,this.x2=i,this.y2=s,this.style=n,this.length=Math.sqrt((this.x2-this.x1)*(this.x2-this.x1)+(this.y2-this.y1)*(this.y2-this.y1)),this.shift=o}renderTo(t){const e=(this.x1-this.x2)/this.length,i=(this.y1-this.y2)/this.length;let s=Math.acos(e);i<0&&(s=Math.PI-s);const n=Math.cos(s+Math.PI/2),r=Math.sin(s+Math.PI/2);this.shift&&(this.x1+=this.shift*n,this.y1+=this.shift*r,this.x2+=this.shift*n,this.y2+=this.shift*r);let h=this.x2+10*e,d=this.y2+10*i,l=h+5*n,a=d+5*r,c=h+-5*n,u=d+-5*r,f=document.createElementNS(o,"line");f.setAttribute("x1",this.x1),f.setAttribute("y1",this.y1),f.setAttribute("x2",this.x2),f.setAttribute("y2",this.y2),f.setAttribute("style",this.style),t.appendChild(f);let p=document.createElementNS(o,"line");p.setAttribute("x1",l),p.setAttribute("y1",a),p.setAttribute("x2",this.x2),p.setAttribute("y2",this.y2),p.setAttribute("style",this.style),t.appendChild(p);let x=document.createElementNS(o,"line");x.setAttribute("x1",c),x.setAttribute("y1",u),x.setAttribute("x2",this.x2),x.setAttribute("y2",this.y2),x.setAttribute("style",this.style),t.appendChild(x)}shorten(t){const e=this.length-t;this.y2=this.y1+(this.y2-this.y1)/this.length*e,this.x2=this.x1+(this.x2-this.x1)/this.length*e,this.length=e}}class h{constructor(t,e,i,s,n){this.text=document.createElementNS(o,"text"),this.text.setAttribute("x",t),this.text.setAttribute("y",e),this.text.setAttribute("text-anchor","middle"),this.text.setAttribute("alignment-baseline","central"),this.text.setAttribute("style",`fill: ${s}; font-family: Arial, sans-serif; font-size: ${n}px`),this.text.innerHTML=i}renderTo(t){t.appendChild(this.text)}removeFrom(t){t.removeChild(this.text)}updateFontSize(t){this.text.style.fontSize=t+"px"}updatePosition(t,e){this.text.setAttribute("x",t),this.text.setAttribute("y",e)}updateOpacity(t){this.text.style.opacity=t}updateTransform(t){this.text.setAttribute("transform",t)}}const d=25,l=80,a=100;class c{constructor(t){this.char=t,this.nextNodesByChar=new Map,this.suffixLink=null,this.endSuffixLinks=[],this.wordEndings=[]}addNextNode(t){this.nextNodesByChar.set(t.char,t)}getNextNodeByChar(t){return this.nextNodesByChar.get(t)}addEndOfWord(t){this.wordEndings.push(t)}calcLayout(){let t=0,e=0;return this.childWidths=[],this.nextNodesByChar.forEach(i=>{let s=i.calcLayout();this.childWidths.push(s.width),t+=s.width,e=Math.max(e,s.height)}),e&&(e+=l/2),this.leftOffset=(Math.max(a,t)-a)/2,{height:e+l,width:Math.max(a,t)}}calcPosition({left:t,top:e}={left:0,top:0}){this.posX=t+this.leftOffset+a/2,this.posY=e+l/2;let i=0,s=t;this.nextNodesByChar.forEach(t=>{t.calcPosition({left:s,top:this.posY+l}),s+=this.childWidths[i],i++})}renderTo(t){let e=document.createElementNS(o,"circle");e.setAttribute("cx",this.posX),e.setAttribute("cy",this.posY),e.setAttribute("r",d),e.setAttribute("style",`fill: ${0===this.wordEndings.length?"white":"lightgrey"}; stroke: blue; stroke-width: 3px;`);let i=new h(this.posX+1,this.posY+5,this.char,"red",25);if(this.nextNodesByChar.forEach(e=>{let i=new r(this.posX,this.posY,e.posX,e.posY,"stroke:rgb(0,0,0);stroke-width:2");i.shorten(d),i.renderTo(t),e.renderTo(t)}),this.suffixLink){let e=new r(this.posX,this.posY,this.suffixLink.posX,this.suffixLink.posY,"stroke:rgb(0,0,255);stroke-width:2",-5);e.shorten(d),e.renderTo(t)}this.endSuffixLinks.forEach(e=>{let i=new r(this.posX,this.posY,e.posX,e.posY,"stroke:rgb(0,255,0);stroke-width:2",-10);i.shorten(d),i.renderTo(t)}),t.appendChild(e),i.renderTo(t)}}class u{constructor(){this.root=new c(null),this.nodes=[]}addWordToNode(t,e,i=0){if(i===e.length)return void t.addEndOfWord(e);let s=e[i],n=t.getNextNodeByChar(s);n||((n=new c(s)).depth=i,this.nodes.push(n),t.addNextNode(n)),this.addWordToNode(n,e,i+1)}findSuffixLink(t,e=this.root){for(let[i,s]of e.nextNodesByChar)i===t.char&&(s===t?t.suffixLink=e:(t.nextNodesByChar.forEach(t=>{this.findSuffixLink(t,s)}),(!t.suffixLink||s.depth>t.suffixLink.depth)&&(t.suffixLink=s),s.wordEndings.length>0&&t.endSuffixLinks.push(s)));t.nextNodesByChar.forEach(t=>{this.findSuffixLink(t)})}addWord(t){this.addWordToNode(this.root,t)}finish(){this.root.nextNodesByChar.forEach(t=>{this.findSuffixLink(t)})}createSVG(){let{width:t,height:e}=this.root.calcLayout(),i=document.createElementNS(o,"svg");return i.setAttribute("height",e),i.setAttribute("width",t),this.root.calcPosition(),this.root.renderTo(i),i}matchText(t){let e=this.root,i=[];for(let s of t){let t=[];for(;;){let i=e.nextNodesByChar.get(s);if(i){let s={move:{from:e,to:i}};t.push(s),i.wordEndings.forEach(e=>{let s={node:i,ending:e};t.push(s)}),i.endSuffixLinks.forEach(e=>{e.wordEndings.forEach(i=>{let s={node:e,ending:i};t.push(s)})}),e=i;break}if(e.suffixLink){let i={move:{from:e,to:e.suffixLink}};e=e.suffixLink,t.push(i)}else{if(e===this.root){let e={drop:!0,node:this.root};t.push(e);break}{let i={move:{from:e,to:this.root}};e=this.root,t.push(i)}}}let n={char:s,subActions:t};i.push(n)}return i}}let f=[];const p=document.getElementById("words");function x(t){let e=function(){let t=s[n];return n=(n+1)%s.length,t}(),i={word:t,color:e};f.push(i);const o=document.createElement("div");o.style.backgroundColor=e;const r=document.createElement("a");r.innerText="❌",r.addEventListener("click",()=>{f=f.filter(e=>e.word!==t),p.removeChild(o),A(),w()},{once:!0});const h=document.createElement("span");h.textContent=t,h.className="word-item-text",o.appendChild(h),o.appendChild(r),p.appendChild(o)}["a","ab","bab","bc","bca","c","caa"].forEach(t=>{x(t)});const m=document.getElementById("match-result"),y=document.getElementById("text-input");let g,b;function w(){m.innerHTML="";const t=document.createElement("tr");let e=y.value;e.length>0&&(m.style.marginTop="-1.6rem");for(let i of e){const e=document.createElement("td");e.innerText=i,e.className="hidden-char",t.appendChild(e)}m.appendChild(t);let i=new Map;for(let{word:t,color:s}of f){const n=document.createElement("tr");i.set(t,{tr:n,color:s}),m.appendChild(n);for(let t of e){const t=document.createElement("td");n.appendChild(t)}}g=b.matchText(e);let s=0;for(let t of g){for(let e of t.subActions){let{ending:t}=e;if(t){let{tr:e,color:n}=i.get(t);for(let i=s-t.length+1;i<=s;i++){const t=e.childNodes[i];t.style.backgroundColor=n,t.className="found-char",i===s&&(t.className+=" found-char-last")}}}s++}}document.getElementById("play-pause-button").addEventListener("click",(async function(){v.style.display="block";let t=0;for(let e=0;e<g.length;e++){t+=m.childNodes[0].childNodes[e].clientWidth,v.style.width=t+"px";let i=g[e];for(let t=0;t<i.subActions.length;t++)await C(i.char,i.subActions[t]);await L(300)}v.style.display="none"})),document.getElementById("text-input").addEventListener("input",w);let E,k=document.getElementById("graph");function A(){b=new u;for(let{word:t}of f)b.addWord(t);b.finish(),k.innerHTML="",E=b.createSVG(),k.appendChild(E)}A(),w();const N=document.getElementById("new-word-input");document.getElementById("new-word-submit").addEventListener("click",t=>{return t.preventDefault(),x(N.value),N.value="",A(),w(),!1},!1);const v=document.getElementById("text-progress");async function C(t,e){if(e.drop){let{posX:i,posY:s}=e.node,n=new h(i,s,t,"green",25);n.renderTo(E);let o=performance.now(),r=o+500;for(;;){let t=await T();if(t>r)break;n.updateOpacity((r-t)/800),n.updateTransform(`rotate(${(t-o)/40}, 50, 50)`)}n.removeFrom(E),await L(500)}else if(e.move){const i=e.move.from,s=e.move.to,n=i.posX,o=i.posY,r=s.posX,d=s.posY;let l=new h(n,o,t,"green",25);l.renderTo(E);let a=performance.now()+1e3;for(;;){let t=await T();if(t>a)break;l.updatePosition((n-r)*(a-t)/1e3+r,(o-d)*(a-t)/1e3+d)}await L(300),l.removeFrom(E)}else e.ending&&async function(){let{posX:t,posY:i}=e.node,s=new h(t,i,e.ending,"gray",25);s.renderTo(E);let n=performance.now(),o=n+750;for(;;){let e=await T();if(e>o)break;s.updateOpacity((o-e)/100),s.updateFontSize(25+(e-n)/40),s.updatePosition(t,i-(e-n)/30)}s.removeFrom(E)}()}function L(t){return new Promise(e=>setTimeout(e,t))}function T(){return new Promise(t=>window.requestAnimationFrame(t))}}]);