const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NodeTree API',
      version: '1.0.0',
      description: 'API do Agregador de Links',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const linksRouter = require('./routes/links');
const usersRouter = require('./routes/users');
app.use('/api', linksRouter);
app.use('/api', usersRouter);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Rota raiz
 *     responses:
 *       200:
 *         description: Servidor funcionando
 */
app.get('/', (req, res) => {
  res.send('NodeTree API está funcionando!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
