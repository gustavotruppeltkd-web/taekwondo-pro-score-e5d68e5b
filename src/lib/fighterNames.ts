/**
 * Resolves a fighter's display name, falling back to the default label
 * ("Atleta Azul" / "Atleta Vermelho") when no name was entered.
 * Used both on the live scoreboard and in the match PDF report.
 */
export const resolveFighterName = (name: string, side: 'chung' | 'hong'): string =>
  name.trim() || (side === 'chung' ? 'Atleta Azul' : 'Atleta Vermelho');
