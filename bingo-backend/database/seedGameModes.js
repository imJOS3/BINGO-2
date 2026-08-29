import GameMode from '../model/GameMode.js';

/** Modos alineados con CreateGameModal (ids 1–9) */
export const DEFAULT_GAME_MODES = [
  { id: 1, name: 'Full Card', description: 'Llena toda la cartilla para ganar' },
  { id: 2, name: 'Right Diagonal', description: 'Completa la diagonal derecha' },
  { id: 3, name: 'Left Diagonal', description: 'Completa la diagonal izquierda' },
  { id: 4, name: 'Column B', description: 'Completa la columna B' },
  { id: 5, name: 'Column I', description: 'Completa la columna I' },
  { id: 6, name: 'Column N', description: 'Completa la columna N' },
  { id: 7, name: 'Column G', description: 'Completa la columna G' },
  { id: 8, name: 'Column O', description: 'Completa la columna O' },
  { id: 9, name: 'Custom', description: 'Modo personalizado' },
];

export const seedGameModes = async () => {
  for (const mode of DEFAULT_GAME_MODES) {
    const existing = await GameMode.findByPk(mode.id);
    if (existing) {
      await existing.update({ name: mode.name, description: mode.description });
    } else {
      await GameMode.create(mode);
      console.log(`Modo creado: ${mode.name}`);
    }
  }
};
