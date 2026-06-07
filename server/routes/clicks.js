const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /clicks/{linkId}:
 *   post:
 *     summary: Registrar clique em link
 *     tags: [Clicks]
 *     parameters:
 *       - in: path
 *         name: linkId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do link
 *     responses:
 *       200:
 *         description: Clique registrado com sucesso
 *       404:
 *         description: Link não encontrado
 */
router.post('/clicks/:linkId', async (req, res) => {
  const { linkId } = req.params;

  try {
    const link = await prisma.link.findUnique({
      where: { id: linkId }
    });

    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' });
    }

    await prisma.$transaction([
      prisma.link.update({
        where: { id: linkId },
        data: {
          clicks: { increment: 1 }
        }
      }),
      prisma.click.create({
        data: {
          linkId
        }
      })
    ]);

    res.json({ success: true, url: link.url });
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    res.status(500).json({ error: 'Erro ao registrar clique' });
  }
});

module.exports = router;
