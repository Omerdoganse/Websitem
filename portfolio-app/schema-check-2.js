const pool = require('./db');

async function checkSchema2() {
    try {
        const [projelerCols] = await pool.query('SHOW COLUMNS FROM projeler');
        console.log('Projeler:', projelerCols.map(c => c.Field));

        const [kullanicilarCols] = await pool.query('SHOW COLUMNS FROM kullanicilar');
        console.log('Kullanicilar:', kullanicilarCols.map(c => c.Field));

        const [hakkimdaCols] = await pool.query('SHOW COLUMNS FROM hakkimda');
        console.log('Hakkimda:', hakkimdaCols.map(c => c.Field));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema2();
