const colors = [
  //  'rgb(255, 0, 41)',
    'rgb(55, 126, 184)',
    'rgb(102, 166, 30)',
    'rgb(152, 78, 163)',
    'rgb(0, 210, 213)',
    'rgb(255, 127, 0)',
    'rgb(175, 141, 0)',
    'rgb(127, 128, 205)',
    'rgb(179, 233, 0)',
    'rgb(196, 46, 96)',
    'rgb(166, 86, 40)'
];

let lastColorIndex = 0;

export default function getNewColor() {
    let color = colors[lastColorIndex];
    lastColorIndex = (lastColorIndex + 1) % colors.length;
    return color;
}
