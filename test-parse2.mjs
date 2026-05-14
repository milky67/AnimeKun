import * as fs from 'fs';
const html = fs.readFileSync('gogo.html', 'utf8');
const lines = html.split('\n');
lines.forEach(l => {
    if (l.includes('<input')) {
        console.log(l);
    }
});
