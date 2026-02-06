const bcrypt = require('bcryptjs');
const { run } = require('../src/database/db');

const ADMIN_EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'admin123';

async function resetPassword() {
    console.log(`Resetting password for ${ADMIN_EMAIL}...`);

    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(NEW_PASSWORD, salt);

    try {
        await run("UPDATE users SET passwordHash = ? WHERE email = ?", [hash, ADMIN_EMAIL]);
        console.log('Password updated successfully.');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${NEW_PASSWORD}`);
    } catch (err) {
        console.error('Failed to update password:', err);
        process.exit(1);
    }
}

resetPassword();
