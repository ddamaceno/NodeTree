const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /links:
 *   post:
 *     summary: Criar novo link
 *     tags: [Links]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - url
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               userId:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Link criado
 *       400:
 *         description: Erro de validação
 */
router.post('/links', async (req, res) => {
  const { title, url, userId, order } = req.body;
  
  if (!title || !url || !userId) {
    return res.status(400).json({ error: 'title, url e userId são obrigatórios' });
  }
  
  try {
    const link = await prisma.link.create({
      data: { title, url, userId, order: order || 0 }
    });
    res.status(201).json(link);
  } catch (error) {
    console.error('Erro ao criar link:', error);
    res.status(500).json({ error: 'Erro ao criar link', details: error.message });
  }
});

/**
 * @swagger
 * /links:
 *   get:
 *     summary: Listar links de um usuário
 *     tags: [Links]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de links
 */
router.get('/links', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }
  
  try {
    const links = await prisma.link.findMany({
      where: { userId: String(userId) },
      orderBy: { order: 'asc' }
    });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar links' });
  }
});

module.exports = router;
