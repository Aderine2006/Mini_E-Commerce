const { getDb, run } = require('../src/database/db');

async function fix() {
    const db = getDb();

    // 1. Find Product by Name
    const product = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM products WHERE name = 'Energy Drink'", (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (!product) {
        console.error("Product 'Energy Drink' not found!");
        return;
    }
    console.log(`Found Product: ID ${product.id}, Name: ${product.name}`);
    const productId = product.id;

    // 2. Check Product Images
    let images = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM product_images WHERE productId = ?", [productId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    console.log("Current Images:", images);

    // 3. Insert or Update
    if (images.length === 0) {
        console.log("No images found. Inserting...");
        await run(
            "INSERT INTO product_images (productId, imagePath, sortOrder) VALUES (?, ?, ?)",
            [productId, 'uploads/prod_15.png', 0]
        );
    } else {
        console.log("Image record exists. Verifying path...");
        const img = images[0];
        if (img.imagePath !== 'uploads/prod_15.png') {
            console.log(`Updating path from '${img.imagePath}' to 'uploads/prod_15.png'`);
            await run("UPDATE product_images SET imagePath = ? WHERE id = ?", ['uploads/prod_15.png', img.id]);
        } else {
            console.log("Path is already correct.");
        }
    }

    // 4. Verify Final State
    images = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM product_images WHERE productId = ?", [productId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
    console.log("Final Images in DB:", images);
}

fix().catch(console.error);
