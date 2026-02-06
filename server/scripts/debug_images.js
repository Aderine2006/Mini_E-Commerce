const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "../data/app.sqlite");
const db = new sqlite3.Database(dbPath);

db.all("SELECT productId, imagePath FROM product_images", [], (err, rows) => {
    if (err) console.error(err);
    else {
        console.log("--- START DATA ---");
        rows.forEach(r => console.log(`PID:${r.productId} PATH:${r.imagePath}`));
        console.log("--- END DATA ---");

        if (rows.length === 0) console.log("NO IMAGES FOUND");
    }
});
