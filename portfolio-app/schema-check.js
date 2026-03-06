const pool = require('./db');

async function checkSchema() {
    try {
        const [yeteneklerCols] = await pool.query('SHOW COLUMNS FROM yetenekler');
        console.log('Yetenekler Columns:', yeteneklerCols);

        const [mesajlarCols] = await pool.query('SHOW COLUMNS FROM mesajlar');
        console.log('Mesajlar Columns:', mesajlarCols);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
