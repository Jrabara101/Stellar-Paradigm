// Quick QA for wordbank.js: counts, self-leaks, short defs, cross-category dup rate.
globalThis.window = {};
await import('../wordbank.js');
const b = window.WORD_BANK;

let total = 0, leaks = 0, shortDefs = 0;
const leakEx = [];
const wordCats = new Map();

for (const cat in b) {
    for (const lvl in b[cat]) {
        for (const { w, d } of b[cat][lvl]) {
            total++;
            const re = new RegExp('\\b' + w.toLowerCase() + '\\b');
            if (re.test(d.toLowerCase())) {
                leaks++;
                if (leakEx.length < 12) leakEx.push(`${w} => ${d}`);
            }
            if (d.replace(/^\[[a-z]+\]\s*/, '').length < 15) shortDefs++;
            wordCats.set(w, (wordCats.get(w) || new Set()).add(cat));
        }
    }
}

const multiCat = [...wordCats.entries()].filter(([, s]) => s.size > 1);
console.log('total words     :', total);
console.log('self-leaks      :', leaks);
console.log('very short defs :', shortDefs);
console.log('words in >1 cat :', multiCat.length);
if (leakEx.length) {
    console.log('\nleak examples:');
    leakEx.forEach((e) => console.log('  ' + e));
}
