import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Data Migration: Static Categories to Dynamic WorkCategories ---');

    const contractors = await prisma.user.findMany({
        where: { role: 'CONTRACTOR' }
    });

    for (const contractor of contractors) {
        console.log(`Processing contractor: ${contractor.name} (${contractor.id})`);

        // 1. Gather all unique category names for this contractor
        const categoryNames = new Set<string>();

        // From Projects
        const projects = await prisma.project.findMany({
            where: { contractorId: contractor.id }
        });
        projects.forEach(p => {
            if (p.categories) {
                p.categories.split(',').map(s => s.trim()).filter(Boolean).forEach(c => categoryNames.add(c));
            }
        });

        // From Workers
        const workers = await prisma.user.findMany({
            where: { contractorId: contractor.id }
        });
        workers.forEach(w => {
            if (w.categories) {
                w.categories.split(',').map(s => s.trim()).filter(Boolean).forEach(c => categoryNames.add(c));
            }
        });

        // 2. Create the WorkCategories
        const nameToIdMap = new Map<string, string>();
        for (const name of categoryNames) {
            const cat = await prisma.workCategory.upsert({
                where: {
                    contractorId_name: {
                        contractorId: contractor.id,
                        name: name
                    }
                },
                update: {},
                create: {
                    name,
                    contractorId: contractor.id,
                }

            });
            nameToIdMap.set(name, cat.id);
            console.log(`  Identified/Created Category: ${name}`);
        }

        // 3. Link Projects to Categories
        for (const project of projects) {
            if (project.categories) {
                const projectCatNames = project.categories.split(',').map(s => s.trim()).filter(Boolean);
                for (const name of projectCatNames) {
                    const catId = nameToIdMap.get(name);
                    if (catId) {
                        await prisma.projectWorkCategory.upsert({
                            where: {
                                projectId_workCategoryId: {
                                    projectId: project.id,
                                    workCategoryId: catId
                                }
                            },
                            update: {},
                            create: {
                                projectId: project.id,
                                workCategoryId: catId
                            }
                        });
                    }
                }
            }
        }

        // 4. Link Workers to Categories
        for (const worker of workers) {
            if (worker.categories) {
                const workerCatNames = worker.categories.split(',').map(s => s.trim()).filter(Boolean);
                for (const name of workerCatNames) {
                    const catId = nameToIdMap.get(name);
                    if (catId) {
                        await prisma.userWorkCategory.upsert({
                            where: {
                                userId_workCategoryId: {
                                    userId: worker.id,
                                    workCategoryId: catId
                                }
                            },
                            update: {},
                            create: {
                                userId: worker.id,
                                workCategoryId: catId
                            }
                        });
                    }
                }
            }
        }

        // 5. Update WorkSessions with the new WorkCategoryId
        const sessions = await prisma.workSession.findMany({
            where: {
                workerId: { in: workers.map(w => w.id) },
                workCategoryId: null
            }
        });

        for (const session of sessions) {
            if (session.category) {
                const catId = nameToIdMap.get(session.category);
                if (catId) {
                    await prisma.workSession.update({
                        where: { id: session.id },
                        data: {
                            workCategoryId: catId,
                            hourlyRateAtTime: 0
                        }
                    });
                }
            }
        }
    }

    console.log('--- Migration Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
