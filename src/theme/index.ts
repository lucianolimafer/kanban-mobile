import { useColorScheme } from 'react-native';

export const taskTonePalette = {
  mint: '#CDEEDD',
  sky: '#BDE9F8',
  butter: '#FCE9A8',
  peach: '#F9D0C3',
  lilac: '#DECDF7',
} as const;

export const columnColorPalette = [
  '#E8EEF8', '#E5F3ED', '#FFF1D6', '#EEE9F8', '#FCE3DC', '#E3F2F7',
] as const;

const shared = {
  taskTone: taskTonePalette,
  taskToneContent: { primary: '#191A18', secondary: '#5D5A52', avatar: 'rgba(255,255,255,0.62)' },
  columnTone: columnColorPalette,
  status: {
    warning: '#F0A44B',
    danger: '#B5412A',
    dangerSoft: '#FFE1D8',
    dangerBorder: '#E6BDB4',
  },
  shadow: {
    card: '#453F34',
    navigation: '#000000',
  },
} as const;

export const themes = {
  light: {
    ...shared,
    colorScheme: 'light',
    surface: {
      canvas: '#FCFBF8', page: '#F7F5F0', raised: '#FFFFFF', subtle: '#F2F0EA',
      muted: '#EEEBE5', dropZone: '#F8F7F3', dropZoneActive: '#EEEDE7',
    },
    text: { primary: '#191A18', secondary: '#56554F', muted: '#8D8B84', subtle: '#96948D', inverse: '#FFFFFF' },
    border: { default: '#E9E6DF', strong: '#D7D4CC', input: '#DCD9D1', transparent: 'transparent' },
    navigation: {
      glassTint: '#E8E8E6', glassSurface: 'rgba(238,238,236,0.82)', border: 'rgba(30,30,30,0.16)',
      active: '#3C3C3B', inactive: '#626260', activeText: '#FFFFFF', shadow: '#000000',
    },
    status: { ...shared.status, success: '#1B6C4A', successSoft: '#DDF4E8', successText: '#204D3B' },
    overlay: 'rgba(22,22,20,0.34)',
  },
  dark: {
    ...shared,
    colorScheme: 'dark',
    surface: {
      canvas: '#111210', page: '#151614', raised: '#222321', subtle: '#292A27',
      muted: '#30312E', dropZone: '#1B1C1A', dropZoneActive: '#30312D',
    },
    text: { primary: '#F4F3EF', secondary: '#C6C4BD', muted: '#A09E97', subtle: '#8D8B85', inverse: '#171816' },
    border: { default: '#343532', strong: '#4B4C48', input: '#454641', transparent: 'transparent' },
    navigation: {
      glassTint: '#252525', glassSurface: 'rgba(31,31,30,0.86)', border: 'rgba(255,255,255,0.16)',
      active: '#E5E5E2', inactive: '#AAA9A5', activeText: '#171716', shadow: '#000000',
    },
    status: {
      ...shared.status,
      success: '#70B993', successSoft: '#20382C', successText: '#B5E3CA',
      danger: '#F09A88', dangerSoft: '#48241E', dangerBorder: '#784238',
    },
    overlay: 'rgba(0,0,0,0.58)',
  },
} as const;

export type AppTheme = (typeof themes)[keyof typeof themes];

export function useAppTheme(): AppTheme {
  return themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
