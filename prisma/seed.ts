import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'Ets.godfathercorp@gmail.com';
  const adminPassword = 'admin'; // A changer en prod !

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin GodFather',
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // Categories
  // const categories = [
  //   { slug: 'consoles', name: 'Consoles', description: 'Next-gen, current-gen et modèles reconditionnés, prêts à jouer.' },
  //   { slug: 'retro', name: 'Rétro gaming', description: 'Classiques, éditions collector et packs rétro sélectionnés.' },
  //   { slug: 'accessoires', name: 'Accessoires', description: 'Manettes, stations, câbles, supports et optimisation du confort.' },
  //   { slug: 'audio', name: 'Audio', description: 'Casques, micros et solutions d’immersion compétitives.' },
  //   { slug: 'bundles', name: 'Bundles', description: 'Packs console + accessoires, calibrés selon votre style de jeu.' },
  //   { slug: 'setup', name: 'Setup & streaming', description: 'Équipement et upgrades pour un setup propre, performant et stable.' },
  //   { slug: 'stockage', name: 'Stockage', description: 'Extensions, SSD, cartes mémoire et optimisation des chargements.' },
  //   { slug: 'cadeaux', name: 'Cartes & cadeaux', description: 'Idées cadeaux gaming, cartes et bundles prêts à offrir.' },
  //   { slug: 'maintenance', name: 'Maintenance', description: 'Nettoyage, optimisation, réglages et accompagnement technique.' },
  //   { slug: 'nouveautes', name: 'Nouveautés', description: 'Drops, restocks et dernières sorties consoles & accessoires.' },
  // ];

  // for (const cat of categories) {
  //   await prisma.category.upsert({
  //     where: { slug: cat.slug },
  //     update: {},
  //     create: cat,
  //   });
  // }
  console.log('Categories skipped');

  // Products (Sample)
  // const products = [
  //   {
  //     slug: 'ps5-digital',
  //     name: 'Sony PlayStation 5 Digital Edition',
  //     brand: 'Sony',
  //     badge: 'New',
  //     categorySlug: 'consoles',
  //     shortDescription: 'Console next-gen sans lecteur, performances 4K/120Hz.',
  //     description: 'La PS5 Digital Edition offre des temps de chargement ultra-rapides grâce au SSD ultra-rapide, une immersion plus poussée grâce au retour haptique, aux gâchettes adaptatives et à l’audio 3D, sans oublier un catalogue exceptionnel de jeux PlayStation nouvelle génération.',
  //     price: 449.0,
  //   },
  //   {
  //     slug: 'xbox-series-x',
  //     name: 'Xbox Series X',
  //     brand: 'Microsoft',
  //     badge: 'Stock',
  //     categorySlug: 'consoles',
  //     shortDescription: 'La console la plus puissante, 4K native et 12TB.',
  //     description: 'La Xbox Series X est la console la plus rapide et la plus puissante jamais conçue par Microsoft. Jouez à des milliers de titres issus de quatre générations de consoles.',
  //     price: 499.0,
  //   },
  //   {
  //     slug: 'dualsense-white',
  //     name: 'Manette DualSense White',
  //     brand: 'Sony',
  //     badge: 'Top',
  //     categorySlug: 'accessoires',
  //     shortDescription: 'Manette officielle PS5, retour haptique.',
  //     description: 'Découvrez une expérience de jeu plus intense et immersive qui donne vie à l’action au creux de vos mains.',
  //     price: 69.0,
  //   },
  // ];

  // for (const prod of products) {
  //   const category = await prisma.category.findUnique({ where: { slug: prod.categorySlug } });
  //   if (category) {
  //     await prisma.product.upsert({
  //       where: { slug: prod.slug },
  //       update: {},
  //       create: {
  //         slug: prod.slug,
  //         name: prod.name,
  //         brand: prod.brand,
  //         badge: prod.badge,
  //         shortDescription: prod.shortDescription,
  //         description: prod.description,
  //         price: prod.price,
  //         categoryId: category.id,
  //       },
  //     });
  //   }
  // }
  console.log('Products skipped');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
