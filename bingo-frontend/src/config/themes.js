export const ballThemes = {
  default: {
    name: 'Default',
    gradient: 'from-yellow-400 to-orange-500',
    textColor: 'text-white',
    shadowColor: 'shadow-orange-500/50'
  },
  gold: {
    name: 'Oro',
    gradient: 'from-yellow-300 to-yellow-600',
    textColor: 'text-yellow-900',
    shadowColor: 'shadow-yellow-500/50'
  },
  blue: {
    name: 'Azul',
    gradient: 'from-blue-400 to-blue-600',
    textColor: 'text-white',
    shadowColor: 'shadow-blue-500/50'
  },
  purple: {
    name: 'Púrpura',
    gradient: 'from-purple-400 to-purple-600',
    textColor: 'text-white',
    shadowColor: 'shadow-purple-500/50'
  },
  pink: {
    name: 'Rosa',
    gradient: 'from-pink-400 to-pink-600',
    textColor: 'text-white',
    shadowColor: 'shadow-pink-500/50'
  },
  classic3d: {
    name: 'Clásico 3D',
    colors: {
      B: { gradient: 'from-blue-300 via-blue-500 to-blue-800', ringColor: 'ring-blue-900', textColor: 'text-white', shadowColor: 'shadow-blue-900/70' },
      I: { gradient: 'from-red-300 via-red-500 to-red-800', ringColor: 'ring-red-900', textColor: 'text-white', shadowColor: 'shadow-red-900/70' },
      N: { gradient: 'from-gray-300 via-gray-500 to-gray-800', ringColor: 'ring-gray-900', textColor: 'text-white', shadowColor: 'shadow-gray-900/70' },
      G: { gradient: 'from-green-300 via-green-500 to-green-800', ringColor: 'ring-green-900', textColor: 'text-white', shadowColor: 'shadow-green-900/70' },
      O: { gradient: 'from-yellow-300 via-yellow-500 to-yellow-800', ringColor: 'ring-yellow-900', textColor: 'text-white', shadowColor: 'shadow-yellow-900/70' }
    }
  }
};

export const cardThemes = {
  default: {
    name: 'Default',
    headerGradient: 'from-red-500 to-red-600',
    cellGradient: 'from-blue-500 to-purple-600',
    cellHoverGradient: 'from-blue-400 to-purple-500',
    borderColor: 'border-white',
    textColor: 'text-white',
    backgroundColor: 'bg-white/10'
  },
  neon: {
    name: 'Neón',
    headerGradient: 'from-pink-500 to-pink-600',
    cellGradient: 'from-cyan-500 to-blue-500',
    cellHoverGradient: 'from-cyan-400 to-blue-400',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-100',
    backgroundColor: 'bg-cyan-900/20'
  },
  dark: {
    name: 'Oscuro',
    headerGradient: 'from-gray-700 to-gray-800',
    cellGradient: 'from-gray-600 to-gray-700',
    cellHoverGradient: 'from-gray-500 to-gray-600',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-100',
    backgroundColor: 'bg-gray-900/50'
  },
  green: {
    name: 'Verde',
    headerGradient: 'from-green-500 to-green-600',
    cellGradient: 'from-emerald-600 to-teal-600',
    cellHoverGradient: 'from-emerald-500 to-teal-500',
    borderColor: 'border-green-300',
    textColor: 'text-green-100',
    backgroundColor: 'bg-green-900/20'
  }
};

export const backgroundThemes = {
  default: {
    name: 'Default',
    gradient: 'from-purple-900 via-blue-900 to-indigo-900'
  },
  sunset: {
    name: 'Atardecer',
    gradient: 'from-orange-900 via-red-800 to-pink-900'
  },
  ocean: {
    name: 'Océano',
    gradient: 'from-blue-900 via-cyan-800 to-teal-900'
  },
  forest: {
    name: 'Bosque',
    gradient: 'from-green-900 via-emerald-800 to-teal-900'
  },
  midnight: {
    name: 'Medianoche',
    gradient: 'from-slate-900 via-purple-900 to-slate-900'
  },
  neon: {
    name: 'Neón',
    gradient: 'from-pink-900 via-purple-900 to-cyan-900'
  },
  aurora: {
    name: 'Aurora',
    gradient: 'from-green-800 via-blue-900 to-purple-900'
  }
};