const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = 'super_secret_temporary_key_for_portfolio'; // In a real app, use environment variables

// Admin Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
        }

        const [users] = await pool.query('SELECT * FROM kullanicilar WHERE username = ?', [username]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
