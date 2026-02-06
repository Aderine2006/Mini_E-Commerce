const fs = require('fs');
const path = require('path');

// Adjust to point to E:\Node\Mini_E-Commerce\data\images
// Since this script is in server/scripts, we go up two levels to server, then up to root, then to data?
// No, the structure is E:\Node\Mini_E-Commerce\server\scripts
// So ../../data/images is E:\Node\Mini_E-Commerce\data\images
const IMAGES_DIR = path.resolve(__dirname, '../../data/images');

console.log(`Scanning directory: ${IMAGES_DIR}`);

if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images directory not found!');
    process.exit(1);
}

const files = fs.readdirSync(IMAGES_DIR);
console.log(`Found ${files.length} files.`);

let fixedCount = 0;

// We assume we need prod_01.png to prod_40.png (or however many products)
// based on the file list I saw, we have prod_01 to prod_14, then gaps.
// And we have image-10 to image-29 etc.

// Let's iterate through image-XX.png files and see if corresponding prod_XX.png exists.
for (const file of files) {
    if (file.startsWith('image-') && file.endsWith('.png')) {
        // Extract number
        const match = file.match(/image-(\d+)\.png/);
        if (match) {
            const num = parseInt(match[1], 10);
            // Construct prod_XX.png name. Pad with 0 if < 10?
            // products.json uses prod_01, prod_10. So yes, padded.
            const paddedNum = num < 10 ? `0${num}` : `${num}`;
            const targetName = `prod_${paddedNum}.png`;
            const targetPath = path.join(IMAGES_DIR, targetName);
            const sourcePath = path.join(IMAGES_DIR, file);

            if (!fs.existsSync(targetPath)) {
                console.log(`Missing ${targetName}. Copying from ${file}...`);
                fs.copyFileSync(sourcePath, targetPath);
                fixedCount++;
            } else {
                // console.log(`${targetName} already exists. Skipping.`);
            }
        }
    }
}

console.log(`Fixed ${fixedCount} missing images.`);
