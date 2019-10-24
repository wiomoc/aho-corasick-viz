import {SVG_NS} from "./svg";

export default class Text {
    constructor(x, y, char, color, size) {
        this.text = document.createElementNS(SVG_NS, 'text');
        this.text.setAttribute('x', x);
        this.text.setAttribute('y', y);
        this.text.setAttribute('text-anchor', 'middle');
        this.text.setAttribute('alignment-baseline', 'central');
        this.text.setAttribute('style', `fill: ${color}; font-family: Arial, sans-serif; font-size: ${size}px`);
        this.text.innerHTML = char;
    }

    renderTo(svg) {
        svg.appendChild(this.text)
    }

    removeFrom(svg) {
        svg.removeChild(this.text)
    }

    updateFontSize(fontSize) {
        this.text.style.fontSize = fontSize + 'px';
    }

    updatePosition(x, y) {
        this.text.setAttribute('x', x);
        this.text.setAttribute('y', y);
    }

    updateOpacity(opacity) {
        this.text.style.opacity = opacity;
    }

    updateTransform(transform) {
        this.text.setAttribute('transform', transform);
    }
}
