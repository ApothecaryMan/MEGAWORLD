// Global Configuration & Settings
let continuousMode = false;
let font = 'fn';
let sz = 22;
let align = 'ar';
let activeIdx = 0;
let chapters = [];
let dragSrcIdx = null;
let sidebarVisible = true;

const palettes = [
  { cls: 'bg-def', s: '#e8e6e0', bg: 'var(--color-background-primary)', fg: 'var(--color-text-primary)' },
  { cls: 'bg-ivory', s: '#fdf6e3', bg: '#fdf6e3', fg: '#3b3020' },
  { cls: 'bg-pink', s: '#fde8e8', bg: '#fdf0f0', fg: '#3a1e1e' },
  { cls: 'bg-mint', s: '#d1fae5', bg: '#f0fdf5', fg: '#1a3326' },
  { cls: 'bg-sky', s: '#dbeafe', bg: '#eff6ff', fg: '#1e2f4a' },
  { cls: 'bg-gray', s: '#f4f4f2', bg: '#f4f4f2', fg: '#2a2a2a' },
  { cls: 'bg-night', s: '#1a1a2e', bg: '#1a1a2e', fg: '#e0d8c8' },
  { cls: 'bg-dark', s: '#212121', bg: '#212121', fg: '#d4c9b0' },
];

let activePalette = palettes[0];
