import {SVG_NS} from "./svg";

export default class Line {
    constructor(x1, y1, x2, y2, style, shift = null) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.style = style;
        this.length = Math.sqrt((this.x2 - this.x1) * (this.x2 - this.x1) + (this.y2 - this.y1) * (this.y2 - this.y1));
        this.shift = shift;
    }

    renderTo(svg) {
        const xBase = (this.x1 - this.x2) / this.length;
        const yBase = (this.y1 - this.y2) / this.length;

        let angle = Math.acos(xBase);
        if (yBase < 0) {
            angle = Math.PI - angle
        }

        const normalX = Math.cos(angle + Math.PI / 2);
        const normalY = Math.sin(angle + Math.PI / 2);

        if (this.shift) {
            this.x1 += this.shift * normalX;
            this.y1 += this.shift * normalY;
            this.x2 += this.shift * normalX;
            this.y2 += this.shift * normalY;
        }

        let baseArrowX = this.x2 + xBase * 10;
        let baseArrowY = this.y2 + yBase * 10;

        let leftArrowX = baseArrowX + normalX * 5;
        let leftArrowY = baseArrowY + normalY * 5;

        let rightArrowX = baseArrowX + normalX * -5;
        let rightArrowY = baseArrowY + normalY * -5;

        let line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', this.x1);
        line.setAttribute('y1', this.y1);
        line.setAttribute('x2', this.x2);
        line.setAttribute('y2', this.y2);
        line.setAttribute('style', this.style);
        svg.appendChild(line);

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
