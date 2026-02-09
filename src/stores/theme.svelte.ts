import { getCurrentWindow } from '@tauri-apps/api/window';
import type { Theme } from '@tauri-apps/api/window';
import { writable, get } from 'svelte/store';

const DEFAULT_THEME = 'dark' as const;
const STORAGE_KEY = 'taskgrid-theme';

function getInitialTheme(): Theme {
	if (typeof localStorage === 'undefined') return DEFAULT_THEME;
	
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}
	
	return DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
	if (typeof document !== 'undefined') {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
}

async function setWindowTheme(theme: Theme) {
	try {
		const window = getCurrentWindow();
		await window.setTheme(theme);
	} catch (error) {
		console.error('Failed to set Tauri window theme:', error);
	}
}

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

if (typeof window !== 'undefined') {
	setWindowTheme(initialTheme);
}

const themeStore = writable<Theme>(initialTheme);

const setTheme = async (theme: Theme) => {
	themeStore.set(theme);
	
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, theme);
	}
	
	applyTheme(theme);
	await setWindowTheme(theme);
};

const toggleTheme = async () => {
	const current = get(themeStore);
	const newTheme: Theme = current === 'dark' ? 'light' : 'dark';
	themeStore.set(newTheme);
	
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, newTheme);
	}
	
	applyTheme(newTheme);
	await setWindowTheme(newTheme);
};

export { themeStore as currentTheme, setTheme, toggleTheme };
