// TODO: remplacer ces informations par les vraies coordonnées du restaurant.
const ADRESSE = "Adresse à préciser, Abidjan";
const TELEPHONE = "+225 00 00 00 00";
const HORAIRES = "Tous les jours, 9h — 22h";

export default function Footer() {
  const telephoneLien = TELEPHONE.replace(/[^+\d]/g, "");

  return (
    <footer className="mt-8 space-y-4 border-t border-black/10 bg-ink px-4 py-6 text-white">
      <div>
        <p className="font-display text-lg font-bold">Restaurant Kalym</p>
        <p className="text-sm text-white/60">Le bon goût, notre passion</p>
      </div>

      <div className="space-y-2 text-sm text-white/80">
        <p>📍 {ADRESSE}</p>
        <a href={`tel:${telephoneLien}`} className="block hover:text-gold-light">
          📞 {TELEPHONE}
        </a>
        <p>🕒 {HORAIRES}</p>
      </div>

      <p className="border-t border-white/10 pt-4 text-xs text-white/40">
        © {new Date().getFullYear()} Restaurant Kalym. Tous droits réservés.
      </p>
    </footer>
  );
}
