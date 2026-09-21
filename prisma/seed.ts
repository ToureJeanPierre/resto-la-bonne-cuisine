import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const motDePasseAdmin = await bcrypt.hash("admin1234", 10);
  const motDePasseLivreur = await bcrypt.hash("livreur1234", 10);

  await prisma.utilisateur.upsert({
    where: { telephone: "0700000001" },
    create: {
      nom: "Restauratrice",
      telephone: "0700000001",
      motDePasse: motDePasseAdmin,
      role: "ADMIN",
    },
    update: {},
  });

  await prisma.utilisateur.upsert({
    where: { telephone: "0700000002" },
    create: {
      nom: "Kouassi (Livreur)",
      telephone: "0700000002",
      motDePasse: motDePasseLivreur,
      role: "LIVREUR",
    },
    update: {},
  });

  const plats = [
    {
      nom: "Poulet braisé",
      description: "Poulet braisé accompagné d'attiéké.",
      prix: 4000,
      categorie: "Plats",
      photo: null,
    },
    {
      nom: "Poisson braisé",
      description: "Poisson braisé, sauce pimentée et attiéké.",
      prix: 4500,
      categorie: "Plats",
      photo: null,
    },
    {
      nom: "Riz au poulet",
      description: "Riz sauce arachide et morceaux de poulet.",
      prix: 3500,
      categorie: "Plats",
      photo: null,
    },
    {
      nom: "Alloco",
      description: "Bananes plantains frites, sauce tomate maison.",
      prix: 1500,
      categorie: "Accompagnements",
      photo: null,
    },
    {
      nom: "Jus de bissap",
      description: "Jus artisanal d'hibiscus bien frais.",
      prix: 1000,
      categorie: "Boissons",
      photo: null,
    },
  ];

  for (const plat of plats) {
    const existant = await prisma.plat.findFirst({ where: { nom: plat.nom } });
    if (!existant) {
      await prisma.plat.create({ data: plat });
    }
  }

  console.log("Seed terminé.");
  console.log("Admin: 0700000001 / admin1234");
  console.log("Livreur: 0700000002 / livreur1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
