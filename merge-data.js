const fs = require('fs');
const path = require('path');

function mergeCollection(collectionName) {
    const dataDir = path.join(__dirname, `content/${collectionName}`);
    const outputDir = path.join(__dirname, 'data');
    const outputFile = path.join(outputDir, `all-${collectionName}.json`);

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    const mergedData = files.map(file => JSON.parse(fs.readFileSync(path.join(dataDir, file))));

    fs.writeFileSync(outputFile, JSON.stringify(mergedData));
    console.log(`${collectionName} 병합 완료`);
}

// 이미지와 동영상 각각 실행
mergeCollection('gallery');
mergeCollection('videos');