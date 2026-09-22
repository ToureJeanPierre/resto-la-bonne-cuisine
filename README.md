# Restaurant Kalym — Application de commande, livraison et fidélisation

Prototype fonctionnel construit selon le cahier des charges : PWA mobile-first
(Next.js) avec trois espaces — **client**, **restauratrice (admin)** et
**livreur** — et une API/serveur commune.

## Stack technique

- **Next.js 14** (App Router) — sert à la fois le front (PWA) et l'API (route
  handlers), conformément à l'architecture en 3 parties recommandée par le
  cahier des charges (client / admin / serveur+API), tout en restant un seul
  déploiement pour la phase 1.
- **Prisma + PostgreSQL** pour la base de données (nécessaire pour un
  déploiement serverless comme Vercel, dont le système de fichiers n'est pas
  persistant — SQLite n'y fonctionnerait pas). En local, tu peux pointer sur
  une base Postgres gratuite (Neon, Supabase, Vercel Postgres) ou une instance
  locale.
- **Tailwind CSS** pour l'interface.
- **jose** (JWT en cookie httpOnly) pour l'authentification admin/livreur.
- **qrcode** (génération) et **html5-qrcode** (scan côté livreur) pour la
  validation de livraison.

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner un DATABASE_URL Postgres valide
npx prisma db push
npm run db:seed
npm run dev
```

Comptes de test créés par le seed :

- **Admin** (`/admin/login`) : téléphone `0700000001`, mot de passe `admin1234`
- **Livreur** (`/livreur/login`) : téléphone `0700000002`, mot de passe `livreur1234`

Le client n'a pas de compte à créer : il est identifié par son numéro de
téléphone dès sa première commande (conformément au principe de simplicité du
cahier des charges).

## Périmètre couvert (première version)

- Accueil, Menu du jour, Fiche plat, Panier, Favoris (stockage local)
- Commande, choix du mode de livraison/retrait, choix du moyen de paiement
- **Paiement modulaire** (`src/lib/payment.ts`) : mode **TEST** (simulation),
  paiement à la livraison, et stubs Wave / Orange Money prêts à être branchés
  sur les vraies API sans changer le reste du parcours
- Suivi de commande avec statuts (reçue → confirmée → préparation → prête →
  livraison → livrée / annulée)
- **QR Code unique par commande** + **code de secours à usage unique**, avec
  protections contre la double validation et la validation d'une commande
  déjà livrée/annulée
- **Fidélité** : 5 repas livrés = 1 repas offert, crédité uniquement après
  livraison validée ; utilisation de la récompense au moment du paiement
- Avis et notation (masquables par l'administratrice)
- Partage de l'application (Web Share API + copie de lien)
- Notifications par étape de commande
- **Administration** : tableau de bord du jour, gestion du menu (ajout,
  modification, disponibilité, suppression), gestion des commandes (filtres +
  regroupement des plats à préparer), gestion des livraisons (assignation),
  gestion des clients (avec correction manuelle exceptionnelle de la
  fidélité), gestion des avis
- **Livreur** : liste des livraisons assignées, scan QR Code, saisie du code
  de secours

## Fonctions volontairement laissées pour une version ultérieure

Réservation de table, GPS livreur, gestion poussée des stocks, commandes de
groupe, promotions avancées, statistiques avancées — comme indiqué au
cahier des charges (§59).

## Déploiement (Vercel)

1. Sur [vercel.com](https://vercel.com), « Add New Project » → importer le
   dépôt GitHub `ToureJeanPierre/resto-la-bonne-cuisine`
   (branche `claude/new-session-kiu4sn`, qui est la branche par défaut).
2. Ajouter une base de données : onglet **Storage** du projet Vercel →
   **Create Database** → Postgres (ou brancher un Neon/Supabase existant).
   Vercel ajoute automatiquement la variable `DATABASE_URL`.
3. Ajouter la variable d'environnement `JWT_SECRET` (une chaîne aléatoire
   longue) dans **Settings → Environment Variables**.
4. Avant le premier déploiement (ou juste après), exécuter une fois, en
   local, avec le `DATABASE_URL` de production dans `.env` :
   ```bash
   npx prisma db push
   npm run db:seed
   ```
5. Déployer. L'URL Vercel fournie (`https://....vercel.app`) est le lien à
   partager par WhatsApp, comme recommandé dans le cahier des charges.

**Ensuite** :

- Changer le mot de passe admin/livreur créés par le seed dès le premier accès.
- Brancher les vrais comptes marchands dans `src/lib/payment.ts`
  (`WaveProvider`, `OrangeMoneyProvider`) — clés API côté serveur uniquement,
  jamais dans le client.
- Générer les icônes PWA aux formats/tailles requis et packager en
  application Android (TWA) une fois la version web validée par de vrais
  clients, comme recommandé dans le cahier des charges.
