const fs = require('fs');

// Generate random colors one time
const generateColors = (count) => {
  const colors = [];
  const letters = '0123456789ABCDEF';
  
  for (let i = 0; i < count; i++) {
    let color = '#';
    for (let j = 0; j < 6; j++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    colors.push(color);
  }
  return colors;
};

const count = 10000;
const colors = generateColors(count); // Generate all colors upfront

const nodes = [];
const links = [];

for (let i = 0; i < count; i++) {
  nodes.push({ key: i, text: `Node ${i}`, color: colors[i], loc: `${i * 100} ${i * 100}`, font: '400 10px Roboto, sans-serif' });
}

for (let i = 0; i < count - 1; i += 2) {
  links.push({ key: i, from: i, to: i + 1 , text: `${i}`, font: '400 30px Roboto, sans-serif' });
}

fs.writeFileSync('./src/data.json', JSON.stringify({ nodes, links }, null, 2));
