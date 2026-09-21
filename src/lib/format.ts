export function formatFCFA(montant: number): string {
  return `${montant.toLocaleString("fr-FR")} F`;
}

export function genererCodeSecours(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
