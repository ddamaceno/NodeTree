const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const MOCKED_USER_ID = '3487a01f-caca-4a92-a25c-12e00a5cec80';

// Rota pública - buscar perfil por slug
router.get('/users/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { slug }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário público:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

router.put('/users/me', verifyToken, async (req, res) => {
  const { displayName, bio, location, avatar, theme, messageToReaders } = req.body;
  const userId = req.userId;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(avatar !== undefined && { avatar }),
        ...(theme !== undefined && { theme }),
        ...(messageToReaders !== undefined && { messageToReaders }),
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

router.get('/users/me', verifyToken, async (req, res) => {
  const userId = req.userId;
  console.log('[Backend] Buscando usuário com ID:', userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log('[Backend] Usuário encontrado:', user);
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

module.exports = router;
