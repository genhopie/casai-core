export const themeTokens = {
  colors: {
    background: 'bg-slate-950',
    foreground: 'text-slate-100',
    card: 'bg-slate-900',
    border: 'border-slate-800',
    accent: 'bg-indigo-600'
  }
};

export function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}
