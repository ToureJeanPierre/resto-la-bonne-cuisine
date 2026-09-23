export const PARAMETRES_PAR_DEFAUT = {
  adresse: "Adresse à préciser, Abidjan",
  telephone: "+225 00 00 00 00",
  horaires: "Tous les jours, 9h — 22h",
};

export default function Footer({
  parametres,
}: {
  parametres: { adresse: string; telephone: string; horaires: string };
}) {
  const { adresse, telephone, horaires } = parametres;
  const telephoneLien = telephone.replace(/[^+\d]/g, "");

  return (
    <footer className="mt-8 space-y-4 border-t border-black/10 bg-ink px-4 py-6 text-white">
      <div>
        <p className="font-display text-lg font-bold">Restaurant Kalym</p>
        <p className="text-sm text-white/60">Le bon goût, notre passion</p>
      </div>

      <div className="space-y-2 text-sm text-white/80">
        <p>📍 {adresse}</p>
        <a href={`tel:${telephoneLien}`} className="block hover:text-gold-light">
          📞 {telephone}
        </a>
        <p>🕒 {horaires}</p>
      </div>

      <p className="border-t border-white/10 pt-4 text-xs text-white/40">
        © {new Date().getFullYear()} Restaurant Kalym. Tous droits réservés.
      </p>
    </footer>
  );
}
