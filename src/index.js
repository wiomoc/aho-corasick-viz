const SVG_NS = "http://www.w3.org/2000/svg";
const RADIUS = 25;
const HEIGHT = 80;
const WIDTH = 100;

class Node {
    constructor(char) {
        this.char = char;
        this.nextNodesByChar = new Map();
        this.suffixLink = null;
        this.suffixLinkDepth = -1;
        this.endSuffixLinks = [];
        this.wordEndings = []
    }

    addNextNode(node, isLink = false) {
        this.nextNodesByChar.set(node.char, node);
    }

    getNextNodeByChar(char) {
        return this.nextNodesByChar.get(char);
    }

    addEndOfWord(word) {
        this.wordEndings.push(word)
    }

    calcLayout() {
        let childWidth = 0;
        let childHeight = 0;
        this.childWidths = [];
        this.nextNodesByChar.forEach(next => {
            let nodeBounds = next.calcLayout();
            this.childWidths.push(nodeBounds.width);
            childWidth += nodeBounds.width;
            childHeight = Math.max(childHeight, nodeBounds.height);
        });

        if (childHeight) {
            childHeight += 80
        }

        this.leftOffset = (Math.max(WIDTH, childWidth) - WIDTH) / 2;

        return {height: childHeight + HEIGHT, width: Math.max(WIDTH, childWidth)}
    }

    calcPosition({left, top} = {left: 0, top: 0}) {
        this.posX = left + this.leftOffset + WIDTH / 2;
        this.posY = top + HEIGHT / 2;
        let i = 0;
        let childLeft = left;
        this.nextNodesByChar.forEach(next => {
            next.calcPosition({left: childLeft, top: this.posY + HEIGHT});
            childLeft += this.childWidths[i];
            i++;
        });
    }

    render(svg) {
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute('cx', this.posX);
        circle.setAttribute('cy', this.posY);
        circle.setAttribute('r', RADIUS);
        circle.setAttribute('style', 'fill: white; stroke: blue; stroke-width: 3px;');

        let text = document.createElementNS(SVG_NS, "text");
        text.setAttribute('x', this.posX + 1);
        text.setAttribute('y', this.posY + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'central');
        text.setAttribute('style', 'fill: red; font-family: Arial, sans-serif; font-size: 25px');
        text.innerHTML = this.char;


        this.nextNodesByChar.forEach(next => {
            let line = new Line(this.posX - 4, this.posY, next.posX - 4, next.posY, 'stroke:rgb(255,0,0);stroke-width:2');
            line.shorten(RADIUS);
            line.renderTo(svg);
            next.render(svg);
        });

        if (this.suffixLink) {
            let line = new Line(this.posX, this.posY, this.suffixLink.posX, this.suffixLink.posY, 'stroke:rgb(0,255,0);stroke-width:2');
            line.shorten(RADIUS);
            line.renderTo(svg)
        }

        this.endSuffixLinks.forEach(next => {
            let line = new Line(this.posX, this.posY + 4, next.posX, next.posY, 'stroke:rgb(0,0,255);stroke-width:2');
            line.shorten(RADIUS);
            line.renderTo(svg)
        });

        svg.appendChild(circle);
        svg.appendChild(text);
    }
}

class Line {
    constructor(x1, y1, x2, y2, style) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.style = style;
        this.length = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2));
    }

    renderTo(svg) {
        let line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', this.x1);
        line.setAttribute('y1', this.y1);
        line.setAttribute('x2', this.x2);
        line.setAttribute('y2', this.y2);
        line.setAttribute('style', this.style);
        svg.appendChild(line);


        const xBase = (this.x1 - this.x2) / this.length;
        const yBase = (this.y1 - this.y2) / this.length;
        let baseArrowX = this.x2 + xBase * 10;
        let baseArrowY = this.y2 + yBase * 10;
        let angleX = Math.acos(xBase);
        let angleY = Math.asin(yBase);
        let leftArrowX = baseArrowX + Math.cos(angleY + Math.PI / 2) * 5;
        let leftArrowY = baseArrowY + Math.sin(angleX + Math.PI / 2) * 5;

        let rightArrowX = baseArrowX + Math.cos(angleY + Math.PI / 2) * -5;
        let rightArrowY = baseArrowY + Math.sin(angleX + Math.PI / 2) * -5;


        let arrowLeftLine = document.createElementNS(SVG_NS, 'line');
        arrowLeftLine.setAttribute('x1', leftArrowX);
        arrowLeftLine.setAttribute('y1', leftArrowY);
        arrowLeftLine.setAttribute('x2', this.x2);
        arrowLeftLine.setAttribute('y2', this.y2);
        arrowLeftLine.setAttribute('style', this.style);

        svg.appendChild(arrowLeftLine);

        let arrowRightLine = document.createElementNS(SVG_NS, 'line');
        arrowRightLine.setAttribute('x1', rightArrowX);
        arrowRightLine.setAttribute('y1', rightArrowY);
        arrowRightLine.setAttribute('x2', this.x2);
        arrowRightLine.setAttribute('y2', this.y2);
        arrowRightLine.setAttribute('style', this.style);

        svg.appendChild(arrowRightLine);
    }

    shorten(length) {
        const newLength = this.length - length;
        this.y2 = this.y1 + ((this.y2 - this.y1) / this.length) * newLength;
        this.x2 = this.x1 + ((this.x2 - this.x1) / this.length) * newLength;

        this.length = newLength;
    }

}

class Graph {
    constructor() {
        this.root = new Node(null);
        this.nodes = [];
    }

    addWordToNode(node, word, pos = 0) {
        if (pos === word.length) {
            node.addEndOfWord(word);
            return;
        }
        let char = word[pos];
        let next = node.getNextNodeByChar(char);
        if (!next) {
            next = new Node(char);
            next.depth = pos;
            this.nodes.push(next);
            node.addNextNode(next);
        }
        this.addWordToNode(next, word, pos + 1)
    }

    findSuffixLink(node, upper = this.root) {
        for (let [nextChar, next] of upper.nextNodesByChar) {
            if (nextChar === node.char) {
                if (next === node) {
                    node.suffixLink = upper;
                } else {
                    node.nextNodesByChar.forEach((next2) => {
                        this.findSuffixLink(next2, next)
                    });
                    if (next.depth > node.suffixLinkDepth) {
                        node.suffixLink = next;
                        node.suffixLinkDepth = next.depth;
                    }

                    if (next.wordEndings.length > 0) {
                        node.endSuffixLinks.push(next);
                    }
                }
            }
        }

        node.nextNodesByChar.forEach((next) => {
            this.findSuffixLink(next)
        })
    }

    addWord(word) {
        this.addWordToNode(this.root, word);
    }

    finish() {
        this.root.nextNodesByChar.forEach((next) => {
            this.findSuffixLink(next)
        })
    }

    createSVG() {
        let {width, height} = this.root.calcLayout();

        let svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('height', height);
        svg.setAttribute('width', width);

        this.root.calcPosition();
        this.root.render(svg);
        return svg;
    }
}


const graph = new Graph();
graph.addWord("a");
graph.addWord("ab");
graph.addWord("bab");
graph.addWord("bc");
graph.addWord("bca");
graph.addWord("c");
graph.addWord("caa");
graph.addWord("dca");
graph.finish();

console.log(graph.root);
console.log(graph.root.calcLayout());

document.body.appendChild(graph.createSVG());

