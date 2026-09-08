const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clear existing data (dev/bootstrap only)
  await prisma.workPhoto.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.projectWorkCategory.deleteMany();
  await prisma.userWorkCategory.deleteMany();
  await prisma.workSession.deleteMany();
  await prisma.projectAssignment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workCategory.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123', 10);

  const contractor = await prisma.user.create({
    data: {
      email: 'contractor@example.com',
      name: 'John Contractor',
      passwordHash,
      role: Role.CONTRACTOR,
    },
  });
  console.log('Created Contractor:', contractor.email);

  const cat1 = await prisma.workCategory.create({
    data: { name: 'CONSTRUCTION', contractorId: contractor.id },
  });
  const cat2 = await prisma.workCategory.create({
    data: { name: 'PLUMBING', contractorId: contractor.id },
  });
  console.log('Created WorkCategories:', cat1.name, ',', cat2.name);

  const worker1 = await prisma.user.create({
    data: {
      email: 'worker1@example.com',
      name: 'Alice Worker',
      passwordHash,
      role: Role.WORKER,
      contractorId: contractor.id,
      workCategoryLinks: {
        create: [
          { workCategoryId: cat1.id },
          { workCategoryId: cat2.id },
        ],
      },
    },
  });

  const worker2 = await prisma.user.create({
    data: {
      email: 'worker2@example.com',
      name: 'Bob Worker',
      passwordHash,
      role: Role.WORKER,
      contractorId: contractor.id,
      workCategoryLinks: {
        create: [{ workCategoryId: cat1.id }],
      },
    },
  });
  console.log('Created Workers:', worker1.email, ',', worker2.email);

  const project = await prisma.project.create({
    data: {
      name: 'Main Construction Site',
      description: 'The primary project for testing',
      contractorId: contractor.id,
      workCategoryLinks: {
        create: [
          { workCategoryId: cat1.id },
          { workCategoryId: cat2.id },
        ],
      },
    },
  });
  console.log('Created Project:', project.name);

  await prisma.projectAssignment.createMany({
    data: [
      { projectId: project.id, workerId: worker1.id, workCategoryId: cat1.id, hourlyRate: 25 },
      { projectId: project.id, workerId: worker2.id, workCategoryId: cat1.id, hourlyRate: 20 },
    ],
  });
  console.log('Assigned workers to project.');
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
