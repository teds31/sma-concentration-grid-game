import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default settings
const createDefaultSettings = () => ({
	// Audio settings
	soundEnabled: true,
	musicEnabled: false,
	soundVolume: 0.7,
	musicVolume: 0.5,

	// Visual settings
	visualEffects: true,
	animations: true,
	highContrast: false,
	colorBlindMode: false,
	fontSize: 'medium', // 'small', 'medium', 'large'

	// Gameplay settings
	hintsEnabled: true,
	autoSave: true,
	confirmations: true, // Confirm before resetting, etc.
	showTimer: true,
	showProgress: true,

	// Difficulty preferences
	defaultDifficulty: 'easy',
	adaptiveDifficulty: false, // Auto-adjust based on performance

	// Privacy and data
	saveStats: true,
	submitScores: true,
	dataSharing: false,

	// Accessibility
	reducedMotion: false,
	screenReader: false,
	keyboardNavigation: true,

	// UI preferences
	theme: 'light', // 'light', 'dark', 'auto'
	language: 'en',
	compactMode: false
});

// Load settings from localStorage
function loadSettings() {
	if (!browser) return createDefaultSettings();
	
	try {
		const saved = localStorage.getItem('concentration-game-settings');
		if (saved) {
			const parsed = JSON.parse(saved);
			// Merge with defaults to ensure all settings exist
			return { ...createDefaultSettings(), ...parsed };
		}
	} catch (error) {
		console.warn('Failed to load settings from localStorage:', error);
	}
	
	return createDefaultSettings();
}

// Save settings to localStorage
function saveSettings(settings) {
	if (!browser) return;
	
	try {
		localStorage.setItem('concentration-game-settings', JSON.stringify(settings));
	} catch (error) {
		console.warn('Failed to save settings to localStorage:', error);
	}
}

// Create the settings store
const settingsState = writable(loadSettings());

// Create the settings store with methods
function createSettingsStore() {
	const { subscribe, set, update } = settingsState;

	return {
		subscribe,
		
		// Update a single setting
		updateSetting: (key, value) => {
			update(settings => {
				const newSettings = { ...settings, [key]: value };
				saveSettings(newSettings);
				return newSettings;
			});
		},

		// Update multiple settings at once
		updateSettings: (updates) => {
			update(settings => {
				const newSettings = { ...settings, ...updates };
				saveSettings(newSettings);
				return newSettings;
			});
		},

		// Reset all settings to defaults
		resetToDefaults: () => {
			const defaults = createDefaultSettings();
			set(defaults);
			saveSettings(defaults);
		},

		// Reset specific category of settings
		resetCategory: (category) => {
			const defaults = createDefaultSettings();
			const categoryKeys = {
				audio: ['soundEnabled', 'musicEnabled', 'soundVolume', 'musicVolume'],
				visual: ['visualEffects', 'animations', 'highContrast', 'colorBlindMode', 'fontSize'],
				gameplay: ['hintsEnabled', 'autoSave', 'confirmations', 'showTimer', 'showProgress', 'defaultDifficulty', 'adaptiveDifficulty'],
				privacy: ['saveStats', 'submitScores', 'dataSharing'],
				accessibility: ['reducedMotion', 'screenReader', 'keyboardNavigation'],
				ui: ['theme', 'language', 'compactMode']
			};

			if (categoryKeys[category]) {
				const updates = {};
				categoryKeys[category].forEach(key => {
					updates[key] = defaults[key];
				});
				
				update(settings => {
					const newSettings = { ...settings, ...updates };
					saveSettings(newSettings);
					return newSettings;
				});
			}
		},

		// Import settings from a JSON object
		importSettings: (importedSettings) => {
			try {
				const defaults = createDefaultSettings();
				// Only import valid settings keys
				const validSettings = {};
				
				Object.keys(defaults).forEach(key => {
					if (importedSettings.hasOwnProperty(key)) {
						validSettings[key] = importedSettings[key];
					}
				});
				
				const newSettings = { ...defaults, ...validSettings };
				set(newSettings);
				saveSettings(newSettings);
				
				return { success: true, imported: Object.keys(validSettings).length };
			} catch (error) {
				console.error('Failed to import settings:', error);
				return { success: false, error: error.message };
			}
		},

		// Export current settings
		exportSettings: () => {
			let currentSettings = null;
			
			settingsState.subscribe(settings => {
				currentSettings = { ...settings };
			})();
			
			return currentSettings;
		},

		// Validate and sanitize settings
		validateSettings: (settings) => {
			const defaults = createDefaultSettings();
			const validated = {};
			
			// Validate each setting with type checking and range validation
			Object.keys(defaults).forEach(key => {
				const defaultValue = defaults[key];
				const userValue = settings[key];
				
				switch (key) {
					case 'soundVolume':
					case 'musicVolume':
						validated[key] = typeof userValue === 'number' && userValue >= 0 && userValue <= 1 
							? userValue : defaultValue;
						break;
						
					case 'fontSize':
						validated[key] = ['small', 'medium', 'large'].includes(userValue) 
							? userValue : defaultValue;
						break;
						
					case 'defaultDifficulty':
						validated[key] = ['easy', 'medium', 'hard'].includes(userValue) 
							? userValue : defaultValue;
						break;
						
					case 'theme':
						validated[key] = ['light', 'dark', 'auto'].includes(userValue) 
							? userValue : defaultValue;
						break;
						
					case 'language':
						validated[key] = typeof userValue === 'string' && userValue.length === 2 
							? userValue : defaultValue;
						break;
						
					default:
						// For boolean values and other types
						validated[key] = typeof userValue === typeof defaultValue 
							? userValue : defaultValue;
				}
			});
			
			return validated;
		},

		// Get settings for a specific category
		getCategorySettings: (category) => {
			const categoryKeys = {
				audio: ['soundEnabled', 'musicEnabled', 'soundVolume', 'musicVolume'],
				visual: ['visualEffects', 'animations', 'highContrast', 'colorBlindMode', 'fontSize'],
				gameplay: ['hintsEnabled', 'autoSave', 'confirmations', 'showTimer', 'showProgress', 'defaultDifficulty', 'adaptiveDifficulty'],
				privacy: ['saveStats', 'submitScores', 'dataSharing'],
				accessibility: ['reducedMotion', 'screenReader', 'keyboardNavigation'],
				ui: ['theme', 'language', 'compactMode']
			};

			let categorySettings = {};
			
			if (categoryKeys[category]) {
				settingsState.subscribe(settings => {
					categoryKeys[category].forEach(key => {
						categorySettings[key] = settings[key];
					});
				})();
			}
			
			return categorySettings;
		},

		// Apply theme-specific CSS properties
		applyTheme: () => {
			if (!browser) return;
			
			settingsState.subscribe(settings => {
				const root = document.documentElement;
				
				// Apply theme
				if (settings.theme === 'auto') {
					const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
					root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
				} else {
					root.setAttribute('data-theme', settings.theme);
				}
				
				// Apply font size
				root.setAttribute('data-font-size', settings.fontSize);
				
				// Apply accessibility settings
				if (settings.reducedMotion) {
					root.style.setProperty('--animation-duration', '0s');
					root.style.setProperty('--transition-duration', '0s');
				} else {
					root.style.removeProperty('--animation-duration');
					root.style.removeProperty('--transition-duration');
				}
				
				if (settings.highContrast) {
					root.classList.add('high-contrast');
				} else {
					root.classList.remove('high-contrast');
				}
				
				if (settings.colorBlindMode) {
					root.classList.add('color-blind-mode');
				} else {
					root.classList.remove('color-blind-mode');
				}
				
				if (settings.compactMode) {
					root.classList.add('compact-mode');
				} else {
					root.classList.remove('compact-mode');
				}
			})();
		},

		// Check if dark mode is currently active
		isDarkMode: () => {
			let isDark = false;
			
			settingsState.subscribe(settings => {
				if (settings.theme === 'dark') {
					isDark = true;
				} else if (settings.theme === 'auto' && browser) {
					isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				}
			})();
			
			return isDark;
		}
	};
}

export const settingsStore = createSettingsStore();

// Apply initial theme on module load
if (browser) {
	settingsStore.applyTheme();
	
	// Listen for system theme changes when in auto mode
	if (window.matchMedia) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			settingsStore.applyTheme();
		});
	}
}