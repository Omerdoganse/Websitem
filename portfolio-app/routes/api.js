const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = 'super_secret_temporary_key_for_portfolio';

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Yetkisiz erişim' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Erişim reddedildi' });
        req.user = user;
        next();
    });
}

// ----------------------------------------------------
// PUBLIC ROUTES
// ----------------------------------------------------

router.get('/portfolio-data', async (req, res) => {
    try {
        const [aboutRows] = await pool.query("SELECT content FROM hakkimda LIMIT 1");
        const [skills] = await pool.query("SELECT id, yetenek_adi as name, ikon_kodu as icon FROM yetenekler");
        const [projects] = await pool.query("SELECT id, proje_adi as title, aciklama as description, github_linki as link, gorsel_url as image_url FROM projeler");

        res.json({
            about: aboutRows.length ? aboutRows[0].content : "",
            skills: skills,
            projects: projects
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/mesajlar', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ error: 'Tüm alanlar gereklidir' });

        const [result] = await pool.query("INSERT INTO mesajlar (gonderen_ad, gonderen_email, mesaj_icerigi) VALUES (?, ?, ?)", [name, email, message]);
        res.json({ id: result.insertId, message: 'Mesaj başarıyla gönderildi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------
// PROTECTED ROUTES (Admin Panel CRUD Operations)
// ----------------------------------------------------

// ==== ABOUT ====
router.get('/hakkimda', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM hakkimda LIMIT 1");
        res.json(rows[0] || { content: "" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/hakkimda', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;
        const [rows] = await pool.query("SELECT id FROM hakkimda LIMIT 1");
        if (rows.length > 0) {
            await pool.query("UPDATE hakkimda SET content = ? WHERE id = ?", [content, rows[0].id]);
        } else {
            await pool.query("INSERT INTO hakkimda (content) VALUES (?)", [content]);
        }
        res.json({ success: true, message: 'Başarıyla güncellendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==== SKILLS ====
router.get('/yetenekler', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, yetenek_adi as name, ikon_kodu as icon FROM yetenekler");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/yetenekler', authenticateToken, async (req, res) => {
    try {
        const { name, icon } = req.body;
        const [result] = await pool.query("INSERT INTO yetenekler (yetenek_adi, ikon_kodu) VALUES (?, ?)", [name, icon]);
        res.json({ id: result.insertId, name, icon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/yetenekler/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM yetenekler WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==== PROJECTS ====
router.get('/projeler', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, proje_adi as title, aciklama as description, github_linki as link, gorsel_url as image_url FROM projeler");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/projeler', authenticateToken, async (req, res) => {
    try {
        const { title, description, image_url, link } = req.body;
        const [result] = await pool.query("INSERT INTO projeler (proje_adi, aciklama, gorsel_url, github_linki) VALUES (?, ?, ?, ?)", [title, description, image_url, link]);
        res.json({ id: result.insertId, title, description, image_url, link });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/projeler/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM projeler WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==== MESSAGES ====
router.get('/mesajlar', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, gonderen_ad as name, gonderen_email as email, mesaj_icerigi as message, gonderilme_tarihi as created_at FROM mesajlar ORDER BY gonderilme_tarihi DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/mesajlar/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query("DELETE FROM mesajlar WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
