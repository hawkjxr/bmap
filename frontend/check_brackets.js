const fs = require('fs');
const content = fs.readFileSync(process.argv[2], 'utf8');
const lines = content.split('\n');
let inStr = false, inML = false, depth = 0, parenDepth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let stripped = '';
    for (let j = 0; j < line.length; j++) {
        const c = line[j];
        if (c === '"' && (j === 0 || line[j-1] !== '\\')) inStr = !inStr;
        else if (c === "'" && (j === 0 || line[j-1] !== '\\')) inML = !inML;
        else if (!inStr && !inML) stripped += c;
    }
    for (const c of stripped) {
        if (c === '{') depth++;
        else if (c === '}') depth--;
        else if (c === '(') parenDepth++;
        else if (c === ')') parenDepth--;
    }
    if (depth < 0) { console.log('Line ' + (i+1) + ' { underflow: ' + line.substring(0,100)); depth = 0; }
    if (parenDepth < 0) { console.log('Line ' + (i+1) + ' ( underflow: ' + line.substring(0,100)); parenDepth = 0; }
}
console.log('End: {=' + depth + ' } (=' + parenDepth);
