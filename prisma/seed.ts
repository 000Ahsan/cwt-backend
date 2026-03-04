import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');

    // Clear existing data (optional, but good for testing)
    // Ordered to avoid foreign key constraint issues
    await prisma.workPhoto.deleteMany();
    await prisma.workLog.deleteMany();
    await prisma.workSession.deleteMany();
    await prisma.projectAssignment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Password123', saltRounds);

    // 1. Create a Contractor
    const contractor = await prisma.user.create({
        data: {
            email: 'contractor@example.com',
            name: 'John Contractor',
            passwordHash: passwordHash,
            role: Role.CONTRACTOR,
        },
    });

    console.log('Created Contractor:', contractor.email);

    // 2. Create Workers
    const worker1 = await prisma.user.create({
        data: {
            email: 'worker1@example.com',
            name: 'Alice Worker',
            passwordHash: passwordHash,
            role: Role.WORKER,
            contractorId: contractor.id,
        },
    });

    const worker2 = await prisma.user.create({
        data: {
            email: 'worker2@example.com',
            name: 'Bob Worker',
            passwordHash: passwordHash,
            role: Role.WORKER,
            contractorId: contractor.id,
        },
    });

    console.log('Created Workers:', worker1.email, ',', worker2.email);

    // 3. Create a Project
    const project = await prisma.project.create({
        data: {
            name: 'Main Construction Site',
            description: 'The primary project for testing',
            contractorId: contractor.id,
        },
    });

    console.log('Created Project:', project.name);

    // 4. Assign Workers to Project
    await prisma.projectAssignment.createMany({
        data: [
            { projectId: project.id, workerId: worker1.id },
            { projectId: project.id, workerId: worker2.id },
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
