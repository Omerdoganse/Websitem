const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Veritabanı havuzu (pool) oluşturuyoruz.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

// Veritabanı tablolarını oluşturma ve varsayılan yönetici ekleme işlevi
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log("TiDB Cloud veritabanına başarıyla bağlanıldı! 🚀");

        // 1. Kullanıcılar (Admin) tablosu
        await connection.query(`
            CREATE TABLE IF NOT EXISTS kullanicilar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL
            )
        `);

        // 2. Hakkımda tablosu
        await connection.query(`
            CREATE TABLE IF NOT EXISTS hakkimda (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content TEXT
            )
        `);

        // 3. Yetenekler tablosu
        await connection.query(`
            CREATE TABLE IF NOT EXISTS yetenekler (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(255)
            )
        `);

        // 4. Projeler tablosu
        await connection.query(`
            CREATE TABLE IF NOT EXISTS projeler (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                link VARCHAR(255)
            )
        `);

        // 5. Mesajlar tablosu
        await connection.query(`
            CREATE TABLE IF NOT EXISTS mesajlar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Varsayılan Admin Kullanıcısını oluştur (Eğer yoksa)
        const [users] = await connection.query("SELECT id FROM kullanicilar WHERE username = ?", ["admin"]);
        if (users.length === 0) {
            const saltRounds = 10;
            const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123'; // LÜTFEN .env DOSYASINDAN ADMIN_PASSWORD AYARLAYIN!
            const hash = await bcrypt.hash(defaultPassword, saltRounds);
            await connection.query("INSERT INTO kullanicilar (username, password_hash) VALUES (?, ?)", ["admin", hash]);
            console.log("Varsayılan admin hesabı oluşturuldu (kullanıcı adı: admin). Şifre .env dosyasındaki ADMIN_PASSWORD değeridir veya belirtilmemişse varsayılan: admin123'tür. LÜTFEN GİRİŞ YAPIP HEMEN DEĞİŞTİRİN!");
        }

        // Varsayılan Hakkımda içeriği (Eğer boşsa)
        const [aboutRows] = await connection.query("SELECT id FROM hakkimda LIMIT 1");
        if (aboutRows.length === 0) {
            await connection.query("INSERT INTO hakkimda (content) VALUES (?)", ["Ben bir Full-Stack Geliştiricisiyim... (Bu yazıyı admin panelinden değiştirebilirsiniz)"]);
        }

        connection.release();
        console.log("Veritabanı tabloları kontrol edildi/oluşturuldu.");
    } catch (err) {
        console.error("Veritabanı başlatma hatası:", err);
    }
}

// Başlangıçta tabloları kur
initializeDatabase();

module.exports = pool;
