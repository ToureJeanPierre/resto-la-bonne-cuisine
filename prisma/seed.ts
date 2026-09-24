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
      nom: "Riz à la sauce gombo",
      description: "Riz accompagné d'une sauce gombo pilée, onctueuse, mijotée avec de la viande.",
      prix: 4000,
      categorie: "Plats",
      photo: "/images/plats/riz-sauce-gombo.jpg",
    },
    {
      nom: "Gombo grillé",
      description: "Ragoût de gombo mijoté avec de la viande, servi avec du riz blanc.",
      prix: 4000,
      categorie: "Plats",
      photo: "/images/plats/gombo-grille.jpg",
    },
    {
      nom: "Riz à la sauce claire",
      description: "Riz accompagné d'une sauce claire au poisson et aux gombos, légère et parfumée.",
      prix: 4000,
      categorie: "Plats",
      photo: "/images/plats/riz-sauce-claire.jpg",
    },
    {
      nom: "Kali à la sauce kopé",
      description: "Foutou accompagné d'une sauce kopé relevée, à la viande, au poisson et aux fruits de mer.",
      prix: 4500,
      categorie: "Plats",
      photo: "/images/plats/kali-sauce-kope.jpg",
    },
    {
      nom: "Sauce gowé au foutou",
      description: "Foutou banane et manioc servi avec une sauce gowé aux feuilles et à la viande.",
      prix: 4500,
      categorie: "Plats",
      photo: "/images/plats/sauce-gowe-foutou.jpg",
    },
    {
      nom: "Riz à la sauce graine",
      description: "Riz accompagné d'une sauce graine (noix de palme) onctueuse, mijotée avec du poulet.",
      prix: 4000,
      categorie: "Plats",
      photo: "/images/plats/riz-sauce-graine.webp",
    },
    {
      nom: "Riz à la sauce arachide",
      description: "Riz accompagné d'une sauce arachide crémeuse et parfumée, mijotée avec du poulet.",
      prix: 4000,
      categorie: "Plats",
      photo: "/images/plats/riz-sauce-arachide.jpg",
    },
    {
      nom: "Poulet braisé au riz au gras",
      description: "Poulet braisé grillé au feu de bois, servi sur un riz au gras épicé et ses légumes.",
      prix: 4500,
      categorie: "Plats",
      photo: "/images/plats/poulet-braise-riz-gras.jpg",
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

  // Ce menu ne sert qu'à démarrer une base vide (premier déploiement).
  // Dès qu'au moins un plat existe, on ne touche plus jamais à la table :
  // toute modification faite par la restauratrice (nom, prix, photo,
  // suppression, ajout) doit rester définitive d'un déploiement à l'autre.
  const nombrePlatsExistants = await prisma.plat.count();
  if (nombrePlatsExistants === 0) {
    await prisma.plat.createMany({ data: plats });
  }

  // Créé une seule fois : on ne doit jamais écraser les valeurs que la
  // restauratrice aurait déjà modifiées depuis l'administration.
  await prisma.parametres.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      adresse: "Adresse à préciser, Abidjan",
      telephone: "+225 00 00 00 00",
      horaires: "Tous les jours, 9h — 22h",
    },
    update: {},
  });

  // Compteur des numéros de commande : créé une seule fois, initialisé au
  // plus grand numéro déjà attribué (ou 1000 si la base est vierge), puis
  // plus jamais touché par le seed — seules les commandes l'incrémentent.
  const dernierNumero = await prisma.commande.aggregate({ _max: { numero: true } });
  await prisma.compteur.upsert({
    where: { id: "commande" },
    create: { id: "commande", valeur: dernierNumero._max.numero ?? 1000 },
    update: {},
  });

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
