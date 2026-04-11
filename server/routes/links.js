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

/**
 * @swagger
 * /links/{id}:
 *   put:
 *     summary: Atualizar link
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Link atualizado
 *       404:
 *         description: Link não encontrado
 */
router.put('/links/reorder', async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'orderedIds deve ser um array' });
  }

  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.link.update({
          where: { id },
          data: { order: index }
        })
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao reordenar links:', error);
    res.status(500).json({ error: 'Erro ao reordenar links' });
  }
});

router.put('/links/:id', async (req, res) => {
  const { id } = req.params;
  const { title, url } = req.body;

  if (!title && !url) {
    return res.status(400).json({ error: 'title ou url são obrigatórios' });
  }

  try {
    const link = await prisma.link.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(url && { url }),
      }
    });
    res.json(link);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    console.error('Erro ao atualizar link:', error);
    res.status(500).json({ error: 'Erro ao atualizar link' });
  }
});

/**
 * @swagger
 * /links/{id}:
 *   delete:
 *     summary: Deletar link
 *     tags: [Links]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Link deletado
 *       404:
 *         description: Link não encontrado
 */
router.delete('/links/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.link.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Link não encontrado' });
    }
    console.error('Erro ao deletar link:', error);
    res.status(500).json({ error: 'Erro ao deletar link' });
  }
});

module.exports = router;
