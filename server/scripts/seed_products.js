const fs = require('fs');
const path = require('path');
const { getDb, run } = require('../src/database/db');

const DATA_DIR = path.resolve(__dirname, '../../data');
const IMAGES_DIR = path.resolve(DATA_DIR, 'images');
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
const PRODUCTS_FILE = path.resolve(DATA_DIR, 'products.json');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function seed() {
    console.log('Reading products from:', PRODUCTS_FILE);
    const productsRaw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const products = JSON.parse(productsRaw);

    console.log(`Found ${products.length} products. Starting seed...`);

    const db = getDb();

    // Clear existing data (optional, but good for clean slate)
    await run("DELETE FROM product_images");
    await run("DELETE FROM products");
    await run("DELETE FROM sqlite_sequence WHERE name='products' OR name='product_images'");

    // 0. Ensure Admin User Exists
    const adminEmail = 'admin@example.com';
    let adminUser = await new Promise((resolve, reject) => {
        db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!adminUser) {
        console.log('Creating default admin user...');
        const dummyHash = '$2a$10$abcdefghijklmnopqrstuv';
        await run("INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)", [adminEmail, dummyHash, 'admin']);
        adminUser = await new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
    const userId = adminUser.id;

    for (const p of products) {
        // 1. Insert Product
        // Note: products.json has 'id' as "prod_01", but DB uses integer IDs. 
        // We will let SQLite generate IDs, or we can parse the number. 
        // Let's parse the number from "prod_01" -> 1 to keep relations simple if possible, 
        // OR just insert and let autoincrement work, but we need to map the ID for image insertion.
        // Since the user provided IDs like "prod_01", let's try to extract the number.

        let numericId = parseInt(p.id.replace('prod_', ''), 10);
        if (isNaN(numericId)) {
            // Fallback if ID format changes
            const res = await run(
                "INSERT INTO products (name, price, category, keywords, createdBy) VALUES (?, ?, ?, ?, ?)",
                [p.name, p.price, p.category, p.keywords.join(','), userId]
            );
            numericId = res.lastID;
        } else {
            await run(
                "INSERT INTO products (id, name, price, category, keywords, createdBy) VALUES (?, ?, ?, ?, ?, ?)",
                [numericId, p.name, p.price, p.category, p.keywords.join(','), userId]
            );
        }

        // 2. Handle Image
        // source path in JSON is like "Mini_E-Commerce\\data\\images\\prod_01.png"
        // We need the filename.
        const imageFilename = path.basename(p.image);
        const sourcePath = path.resolve(IMAGES_DIR, imageFilename); // Use known images dir
        const destPath = path.resolve(UPLOADS_DIR, imageFilename);

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            const dbImagePath = `uploads/${imageFilename}`;

            await run(
                "INSERT INTO product_images (productId, imagePath, sortOrder) VALUES (?, ?, ?)",
                [numericId, dbImagePath, 0]
            );
            console.log(`Seeded: ${p.id} -> ID ${numericId} (Image: ${imageFilename})`);
        } else {
            console.warn(`Image missing for ${p.id}: ${sourcePath}`);
        }
    }

    console.log('Seeding complete.');
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
