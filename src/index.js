const SVG_NS = "http://www.w3.org/2000/svg";

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
        let height = 80;
        let width = 100;

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

        this.leftOffset = (Math.max(width, childWidth) - width) / 2;

        return {height: childHeight + height, width: Math.max(width, childWidth)}
    }

    calcPosition({left, top} = {left: 0, top: 0}) {
        this.posX = left + this.leftOffset + 50;
        this.posY = top + 40;
        let i = 0;
        let childLeft = left;
        this.nextNodesByChar.forEach(next => {
            next.calcPosition({left: childLeft, top: this.posY + 80});
            childLeft += this.childWidths[i];
            i++;
        });
    }

    render(svg) {
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute('cx', this.posX);
        circle.setAttribute('cy', this.posY);
        circle.setAttribute('r', 25);
        circle.setAttribute('style', 'fill: white; stroke: blue; stroke-width: 3px;');

        let text = document.createElementNS(SVG_NS, "text");
        text.setAttribute('x', this.posX + 1);
        text.setAttribute('y', this.posY + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'central');
        text.setAttribute('style', 'fill: red; font-family: Arial, sans-serif; font-size: 25px');
        text.innerHTML = this.char;


        this.nextNodesByChar.forEach(next => {
            let line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', this.posX);
            line.setAttribute('y1', this.posY - 4);
            line.setAttribute('x2', next.posX);
            line.setAttribute('y2', next.posY - 4);

            line.setAttribute('style', 'stroke:rgb(255,0,0);stroke-width:2');
            svg.appendChild(line);
            next.render(svg);
        });

        if (this.suffixLink) {
            let line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', this.posX);
            line.setAttribute('y1', this.posY);
            line.setAttribute('x2', this.suffixLink.posX);
            line.setAttribute('y2', this.suffixLink.posY);
            line.setAttribute('style', 'stroke:rgb(0,255,0);stroke-width:2');
            svg.appendChild(line);
        }

        this.endSuffixLinks.forEach(next => {
            let line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', this.posX);
            line.setAttribute('y1', this.posY + 4);
            line.setAttribute('x2', next.posX);
            line.setAttribute('y2', next.posY + 4);

            line.setAttribute('style', 'stroke:rgb(0,0,255);stroke-width:2');
            svg.appendChild(line);
        });

        svg.appendChild(circle);
        svg.appendChild(text);
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
            this.nodes.push(next);
            node.addNextNode(next);
        }
        this.addWordToNode(next, word, pos + 1)
    }

    findSuffixLink(node, depth = 0, upper = this.root) {
        for (let [nextChar, next] of upper.nextNodesByChar) {
            if (nextChar === node.char) {
                if (next === node) {
                    node.suffixLink = upper;
                } else {
                    node.nextNodesByChar.forEach((next2) => {
                        this.findSuffixLink(next2, depth + 1, next)
                    });
                    if (depth > node.suffixLinkDepth) {
                        node.suffixLinkDepth = depth;
                        node.suffixLink = next;
                    }

                    if (next.wordEndings.length > 0) {
                        node.endSuffixLinks.push(next);
                    }
                }
            }
        }

        node.nextNodesByChar.forEach((next) => {
            this.findSuffixLink(next, depth + 1)
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
graph.finish();

console.log(graph.root);
console.log(graph.root.calcLayout());

document.body.appendChild(graph.createSVG());

