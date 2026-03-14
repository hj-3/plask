const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'plask-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'userId와 password를 모두 입력해야 합니다.' });
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      // 테스트 환경에서 빠르게 로그인할 수 있도록, 테스트 계정이 없으면 자동으로 생성합니다.
      if (userId === 'test' && password === '1234') {
        const hashedPassword = await bcrypt.hash('1234', 10);
        await pool.query(
          'INSERT INTO users (user_id, password_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, hashedPassword]
        );
      } else {
        return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.' });
      }
    }

    const { password_hash } = (await pool.query('SELECT password_hash FROM users WHERE user_id = $1', [userId])).rows[0];
    const isValidPassword = await bcrypt.compare(password, password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, token, userId });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// POST /api/auth/register (선택: 회원가입 API)
router.post('/register', async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'userId와 password를 모두 입력해야 합니다.' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: '이미 존재하는 사용자입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (user_id, password_hash) VALUES ($1, $2)', [userId, hashedPassword]);

    res.json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;
