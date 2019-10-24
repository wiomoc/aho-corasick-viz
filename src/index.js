import './index.scss'
import './colors'
import getNewColor from "./colors";
import Line from "./graphic/Line";
import Text from "./graphic/Text";
import {SVG_NS} from "./graphic/svg";

const RADIUS = 25;
const HEIGHT = 80;
const WIDTH = 100;

class Node {
    constructor(char) {
        this.char = char;
        this.nextNodesByChar = new Map();
        this.suffixLink = null;
        this.endSuffixLinks = [];
        this.wordEndings = []
    }

    addNextNode(node) {
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
            childHeight += HEIGHT / 2
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

    renderTo(svg) {
        let circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', this.posX);
        circle.setAttribute('cy', this.posY);
        circle.setAttribute('r', RADIUS);
        circle.setAttribute('style', `fill: ${this.wordEndings.length === 0 ? 'white' : 'lightgrey'}; stroke: blue; stroke-width: 3px;`);

        let text = new Text(this.posX + 1, this.posY + 5, this.char, 'red', 25);


        this.nextNodesByChar.forEach(next => {
            let line = new Line(this.posX, this.posY, next.posX, next.posY, 'stroke:rgb(0,0,0);stroke-width:2');
            line.shorten(RADIUS);
            line.renderTo(svg);
            next.renderTo(svg);
        });

        if (this.suffixLink) {
            let line = new Line(this.posX, this.posY, this.suffixLink.posX, this.suffixLink.posY, 'stroke:rgb(0,0,255);stroke-width:2', -5);
            line.shorten(RADIUS);
            line.renderTo(svg)
        }

        this.endSuffixLinks.forEach(next => {
            let line = new Line(this.posX, this.posY, next.posX, next.posY, 'stroke:rgb(0,255,0);stroke-width:2', -10);
            line.shorten(RADIUS);
            line.renderTo(svg)
        });

        svg.appendChild(circle);
        text.renderTo(svg);
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
                    if (!node.suffixLink || next.depth > node.suffixLink.depth) {
                        node.suffixLink = next;
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
        this.root.renderTo(svg);
        return svg;
    }

    matchText(text) {
        let currentNode = this.root;
        let actions = [];

        for (let char of text) {
            let subActions = [];

            while (true) {
                let next = currentNode.nextNodesByChar.get(char);
                if (next) {
                    let subMoveAction = {
                        move: {
                            from: currentNode,
                            to: next
                        }
                    };
                    subActions.push(subMoveAction);

                    next.wordEndings.forEach(wordEnding => {
                        let subEndingAction = {
                            node: next,

                            ending: wordEnding
                        };
                        subActions.push(subEndingAction)
                    });
                    next.endSuffixLinks.forEach(next => {
                        next.wordEndings.forEach(wordEnding => {

                            let subEndingAction = {
                                node: next,
                                ending: wordEnding
                            };
                            subActions.push(subEndingAction)
                        });
                    });

                    currentNode = next;

                    break
                } else if (currentNode.suffixLink) {
                    let subMoveAction = {
                        move: {
                            from: currentNode,
                            to: currentNode.suffixLink
                        }
                    };

                    currentNode = currentNode.suffixLink;

                    subActions.push(subMoveAction);
                } else if (currentNode === this.root) {
                    let subDropAction = {
                        drop: true,
                        node: this.root,
                    };
                    subActions.push(subDropAction);
                    break;
                } else {
                    let subMoveAction = {
                        move: {
                            from: currentNode,
                            to: this.root
                        }
                    };

                    currentNode = this.root;
                    subActions.push(subMoveAction);
                }
            }

            let action = {
                char,
                subActions
            };
            actions.push(action)
        }

        return actions;
    }
}


let words = [];

const wordsElement = document.getElementById('words');

function addAndRenderWordListItem(wordText) {
    let color = getNewColor();
    let word = {word: wordText, color};
    words.push(word);
    const wordElement = document.createElement('div');
    wordElement.style.backgroundColor = color;
    const wordDeleteElement = document.createElement('a');
    wordDeleteElement.innerText = '❌';
    wordDeleteElement.addEventListener('click', () => {
        words = words.filter(value => value.word !== wordText);
        wordsElement.removeChild(wordElement);
        renderGraph();
        matchText();
    }, {once: true});
    const wordInputElement = document.createElement('span');
    wordInputElement.textContent = wordText;
    wordInputElement.className = "word-item-text";
    wordElement.appendChild(wordInputElement);
    wordElement.appendChild(wordDeleteElement);
    wordsElement.appendChild(wordElement);
}

function renderInitialWordList() {
    ['a', 'ab', 'bab', 'bc', 'bca', 'c', 'caa']
        .forEach(word => {
            addAndRenderWordListItem(word)
        });
}

renderInitialWordList();

const matchResultElement = document.getElementById('match-result');
const textInputElement = document.getElementById('text-input');
document.getElementById('play-pause-button').addEventListener('click', animate);
document.getElementById('text-input').addEventListener('input', matchText);

let actions;

function matchText() {
    matchResultElement.innerHTML = '';

    const tr = document.createElement("tr");

    let textInput = textInputElement.value;
    if (textInput.length > 0) {
        matchResultElement.style.marginTop = '-1.6rem';
    }
    for (let char of textInput) {
        const td = document.createElement("td");
        td.innerText = char;
        td.className = 'hidden-char';
        tr.appendChild(td)
    }
    matchResultElement.appendChild(tr);

    let trAndColorByWord = new Map();

    for (let {word, color} of words) {
        const tr = document.createElement("tr");
        trAndColorByWord.set(word, {tr, color});
        matchResultElement.appendChild(tr);
        for (let char of textInput) {
            const td = document.createElement("td");
            tr.appendChild(td)
        }
    }

    actions = graph.matchText(textInput);
    let i = 0;
    for (let action of actions) {
        for (let subAction of action.subActions) {
            let {ending} = subAction;
            if (ending) {
                let {tr, color} = trAndColorByWord.get(ending);
                for (let b = i - ending.length + 1; b <= i; b++) {
                    const td = tr.childNodes[b];
                    td.style.backgroundColor = color;
                    td.className = 'found-char';

                    if (b === i) {
                        td.className += ' found-char-last'
                    }
                }
            }
        }
        i++;
    }
}

let graph;
let graphElement = document.getElementById('graph');
let svg;

function renderGraph() {
    graph = new Graph();

    for (let {word} of words) {
        graph.addWord(word);
    }
    graph.finish();

    graphElement.innerHTML = '';
    svg = graph.createSVG();
    graphElement.appendChild(svg);
}

renderGraph();
matchText();

const newWordInputElement = document.getElementById('new-word-input');
document.getElementById('new-word-submit').addEventListener('click', (e) => {
    e.preventDefault();
    let newWord = newWordInputElement.value;
    addAndRenderWordListItem(newWord);
    newWordInputElement.value = '';
    renderGraph();
    matchText();
    return false;
}, false);


const textProgressElement = document.getElementById('text-progress');

async function animate() {
    let actionIndex = 0;
    let subActionIndex = 0;
    textProgressElement.style.display = 'block';
    let progressOffset = 0;

    for (let actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        progressOffset +=  matchResultElement.childNodes[0].childNodes[actionIndex].clientWidth;
        textProgressElement.style.width = progressOffset + "px";
        let currentAction = actions[actionIndex];
        for (let subActionIndex = 0; subActionIndex < currentAction.subActions.length; subActionIndex++) {
            await animateSubAction(currentAction.char, currentAction.subActions[subActionIndex]);
        }
        await sleep(300);
    }
    textProgressElement.style.display = 'none';
}

async function animateSubAction(char, action) {
    if (action.drop) {
        let {posX, posY} = action.node;
        let text = new Text(posX, posY, char, 'green', 25);
        text.renderTo(svg);
        let begin = performance.now();
        let end = begin + 500;
        while (true) {
            let now = await requestAnimationFrame();
            if (now > end) break;
            text.updateOpacity((end - now) / 800.0);
            text.updateTransform(`rotate(${(now - begin) / 40.0}, 50, 50)`);
        }
        text.removeFrom(svg);
        await sleep(500);
    } else if (action.move) {
        const from = action.move.from;
        const to = action.move.to;

        const fromX = from.posX;
        const fromY = from.posY;
        const toX = to.posX;
        const toY = to.posY;

        let text = new Text(fromX, fromY, char, 'green', 25);
        text.renderTo(svg);
        let begin = performance.now();
        let end = begin + 1000;
        while (true) {
            let now = await requestAnimationFrame();
            if (now > end) break;
            text.updatePosition((fromX - toX) * (end - now) / 1000.0 + toX, (fromY - toY) * (end - now) / 1000.0 + toY);
        }
        await sleep(300);
        text.removeFrom(svg);
    } else if (action.ending) {
        (async function () {
            let {posX, posY} = action.node;
            let text = new Text(posX, posY, action.ending, 'gray', 25);
            text.renderTo(svg);
            let begin = performance.now();
            let end = begin + 750;
            while (true) {
                let now = await requestAnimationFrame();
                if (now > end) break;
                text.updateOpacity((end - now) / 100.0);
                text.updateFontSize(25 + (now - begin) / 40.0);
                text.updatePosition(posX, posY - (now - begin) / 30.0);

            }
            text.removeFrom(svg);
        })()
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function requestAnimationFrame() {
    return new Promise(resolve => window.requestAnimationFrame(resolve))
}
