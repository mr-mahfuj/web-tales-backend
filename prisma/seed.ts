import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = [
        {
            name: 'Technology',
            description: 'Technology related stories',
        },
        {
            name: 'Lifestyle',
            description: 'Lifestyle stories',
        },
        {
            name: 'Business',
            description: 'Business and entrepreneurship',
        },
        {
            name: 'Education',
            description: 'Education related content',
        },
        {
            name: 'Entertainment',
            description: 'Movies, music and entertainment',
        },
        {
            name: 'Health',
            description: 'Health and wellness',
        },
        {
            name: 'Travel',
            description: 'Travel experiences',
        },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: {
                name: category.name,
            },
            update: {},
            create: category,
        });
    }

    console.log('Categories seeded successfully.');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
