const fs = require('fs');
const path = require('path');

function mergeCollection(collectionName) {
    const dataDir = path.join(__dirname, `content/${collectionName}`);
    const outputDir = path.join(__dirname, 'data');
    const outputFile = path.join(outputDir, `all-${collectionName}.json`);

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const mergedData = collectionName === 'gallery'
        ? ['vertical', 'horizontal'].flatMap(orientation => {
            const file = path.join(__dirname, 'content', `gallery-${orientation}.json`);
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (!Array.isArray(data.items)) throw new Error(`${file}: items 배열이 필요합니다.`);
            return data.items.map(item => ({ ...item, orientation }));
        })
        : fs.readdirSync(dataDir).filter(file => file.endsWith('.json'))
            .map(file => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')));

    fs.writeFileSync(outputFile, JSON.stringify(mergedData));
    console.log(`${collectionName} 병합 완료`);
}

// 이미지와 동영상 각각 실행
mergeCollection('gallery');
mergeCollection('videos');
