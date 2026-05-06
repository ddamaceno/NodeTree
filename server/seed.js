const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'teste@teste.com',
      password: hashedPassword,
      slug: 'teste',
      displayName: 'Teste User',
      bio: 'Usuário de teste',
      messageToReaders: 'Bem-vindo ao meu perfil!'
    },
  });

  await prisma.link.createMany({
    data: [
      {
        title: 'Google',
        url: 'https://google.com',
        description: 'O maior buscador do mundo',
        userId: user.id,
        order: 0
      },
      {
        title: 'GitHub',
        url: 'https://github.com',
        description: 'Plataforma de desenvolvimento',
        userId: user.id,
        order: 1
      }
    ]
  });

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
