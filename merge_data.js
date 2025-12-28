const fs = require('fs');
const path = require('path');

const batchFiles = ['scraped_batch_1.json', 'scraped_batch_2.json', 'scraped_batch_3.json', 'scraped_batch_4.json'];
let allData = [];

batchFiles.forEach(file => {
    try {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const entries = Object.entries(data).map(([url, content]) => ({ url, content }));
            allData = [...allData, ...entries];
        }
    } catch (e) {
        console.log(`Skipping ${file}: ${e.message}`);
    }
});

const dataDir = path.join(__dirname, 'src/data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'knowledge.json'), JSON.stringify(allData, null, 2));
console.log(`Merged ${allData.length} entries into src/data/knowledge.json`);
