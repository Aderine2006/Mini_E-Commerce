const fs = require('fs');
const path = require('path');
const { initDb } = require('../database/init');
const { run, get } = require('../database/db');
const { createProduct } = require('../services/productService');

async function seed() {
    try {
        console.log('Initializing database...');
        // Ensure DB is initialized
        await initDb();

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Get a user ID to attribute products to (create one if needed)
        let adminUser = await get("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        if (!adminUser) {
            console.log('No admin user found. Creating system_seeder admin...');
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('system_password', 10);
            await run("INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)",
                ['system_seeder@example.com', hash, 'admin']);
            adminUser = await get("SELECT id FROM users WHERE email = 'system_seeder@example.com'");
        }
        const userId = adminUser.id;
        console.log(`Using user ID ${userId} for product creation.`);

        // Read products.json
        const productsPath = path.resolve(__dirname, '../../../data/products.json');
        if (!fs.existsSync(productsPath)) {
            console.error(`Products file not found at ${productsPath}`);
            process.exit(1);
        }

        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        console.log(`Found ${productsData.length} products to populate.`);

        const imagesSourceDir = path.resolve(__dirname, '../../../data/images');

        let successCount = 0;
        let failCount = 0;

        for (const item of productsData) {
            try {
                // Check if product with this specific name already exists to avoid duplicates if run multiple times
                // Note: Ideally we'd check by a unique ID from the JSON if the schema supported it, 
                // but the schema uses auto-increment ID. We'll check by exact name match for safety.
                const existing = await get("SELECT id FROM products WHERE name = ?", [item.name]);
                if (existing) {
                    console.log(`Skipping existing product: ${item.name}`);
                    continue;
                }

                // Handle image
                // item.image example: "Mini_E-Commerce\\data\\images\\prod_01.png"
                // We need to extract "prod_01.png"
                const imageFilename = path.basename(item.image.replace(/\\/g, '/'));
                const sourceImagePath = path.join(imagesSourceDir, imageFilename);
                const targetImagePath = path.join(uploadsDir, imageFilename);

                let uploadedPath = '';

                if (fs.existsSync(sourceImagePath)) {
                    fs.copyFileSync(sourceImagePath, targetImagePath);
                    // The app serves files from /uploads, so we store the relative path or full URL depending on app logic.
                    // ProductService typically just stores the string passed to it.
                    // Based on app.js: app.use("/uploads", ...) 
                    // Any path stored should probably be usable by the frontend.
                    // Let's store just the filename for now, or "uploads/filename".
                    // Looking at `server/src/services/productService.js`:
                    // createProduct calls `replaceProductImages`.
                    // It inserts whatever string we pass.
                    // If the frontend expects a full URL, it might construct it.
                    // If it expects a relative path, "uploads/prod_01.png" might be safer.
                    // Let's assume standard practice of relative path from domain root or just filename if the frontend knows the base.
                    // Let's try "uploads/" + filename to be safe, as that maps directly to the static middleware.

                    // Wait, one detail: The `replaceProductImages` function handles the array of images. 
                    // And `createProduct` accepts `imagePaths` (array).
                    // But the `products.json` has a single `image` field strings.

                    uploadedPath = `uploads/${imageFilename}`;

                } else {
                    console.warn(`Warning: Image not found for ${item.name} at ${sourceImagePath}`);
                }

                await createProduct({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    keywords: item.keywords, // Service normalizes this
                    createdBy: userId,
                    imagePaths: uploadedPath ? [uploadedPath] : []
                });

                process.stdout.write('.');
                successCount++;
            } catch (err) {
                console.error(`\nFailed to add ${item.name}:`, err.message);
                failCount++;
            }
        }

        console.log(`\n\nDone! Successfully added: ${successCount}, Failed: ${failCount}`);

    } catch (error) {
        console.error('Fatal error in seed script:', error);
        process.exit(1);
    }
}

seed();
