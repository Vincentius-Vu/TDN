const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/items_bank.json');
let data = fs.readFileSync(filePath, 'utf8');

const regex = /Trung t(?:a|â)m Luy\s*ện thi.*?Page\s*\d+/gi;
const matches = data.match(regex);
console.log('Found ' + (matches ? matches.length : 0) + ' matches.');

if (matches && matches.length > 0) {
    data = data.replace(regex, '');
    fs.writeFileSync(filePath, data, 'utf8');
    console.log('Removed all instances and saved file.');
}
