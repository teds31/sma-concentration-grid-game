<script lang="ts">
	import { settingsStore } from '$lib/stores/settingsStore.js';
	import { gameStore } from '$lib/stores/gameStore.js';
	import { onMount } from 'svelte';
	import { Volume2, VolumeX, Eye, EyeOff, Download, Upload, RotateCcw, Save } from 'lucide-svelte';

	let mounted = false;
	let showConfirmReset = false;
	let exportDataUrl = '';
	let importError = '';
	let importSuccess = '';

	onMount(() => {
		mounted = true;
	});

	$: settings = $settingsStore;

	function updateSetting(key, value) {
		settingsStore.updateSetting(key, value);
	}

	function resetCategory(category) {
		settingsStore.resetCategory(category);
	}

	function resetAllSettings() {
		settingsStore.resetToDefaults();
		showConfirmReset = false;
	}

	function resetAllData() {
		gameStore.resetAllData();
		settingsStore.resetToDefaults();
		showConfirmReset = false;
	}

	function exportData() {
		const gameData = gameStore.exportSettings ? gameStore.exportSettings() : {};
		const settingsData = settingsStore.exportSettings();
		
		const exportData = {
			timestamp: Date.now(),
			version: '1.0.0',
			settings: settingsData,
			gameData: gameData
		};
		
		const dataStr = JSON.stringify(exportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = `concentration-game-data-${new Date().toISOString().split('T')[0]}.json`;
		link.click();
		
		URL.revokeObjectURL(url);
	}

	function handleImportFile(event) {
		const file = event.target.files[0];
		if (!file) return;
		
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const importData = JSON.parse(e.target.result);
				
				if (importData.settings) {
					const result = settingsStore.importSettings(importData.settings);
					if (result.success) {
						importSuccess = `Successfully imported ${result.imported} settings`;
						importError = '';
					} else {
						importError = result.error;
						importSuccess = '';
					}
				} else {
					importError = 'Invalid data format';
					importSuccess = '';
				}
			} catch (error) {
				importError = 'Failed to parse file: ' + error.message;
				importSuccess = '';
			}
		};
		reader.readAsText(file);
		
		// Reset file input
		event.target.value = '';
	}

	const categoryInfo = {
		audio: {
			title: 'Audio Settings',
			description: 'Control sound effects and music'
		},
		visual: {
			title: 'Visual Settings', 
			description: 'Customize the game appearance'
		},
		gameplay: {
			title: 'Gameplay Settings',
			description: 'Adjust game behavior and difficulty'
		},
		accessibility: {
			title: 'Accessibility',
			description: 'Make the game more accessible'
		},
		privacy: {
			title: 'Privacy & Data',
			description: 'Control data collection and sharing'
		}
	};
</script>

<svelte:head>
	<title>Settings - SMA Concentration Grid</title>
</svelte:head>

<div class="settings-page">
	<div class="page-header">
		<h1>⚙️ Game Settings</h1>
		<p>Customize your game experience</p>
	</div>

	<!-- Audio Settings -->
		<section class="settings-section">
			<div class="section-header">
				<h2>{categoryInfo.audio.title}</h2>
				<p>{categoryInfo.audio.description}</p>
				<button class="reset-category-btn" on:click={() => resetCategory('audio')}>
					Reset Audio
				</button>
			</div>
			
			<div class="settings-grid">
				<div class="setting-item">
					<div class="setting-info">
						<label for="sound-enabled">Sound Effects</label>
						<span class="setting-description">Enable game sound effects</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="sound-enabled"
							checked={settings.soundEnabled}
							on:change={(e) => updateSetting('soundEnabled', e.target.checked)}
						>
						<span class="toggle-slider">
							{#if settings.soundEnabled}
								<Volume2 size={16} />
							{:else}
								<VolumeX size={16} />
							{/if}
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="sound-volume">Sound Volume</label>
						<span class="setting-description">Adjust sound effect volume</span>
					</div>
					<div class="range-control">
						<input 
							type="range" 
							id="sound-volume"
							min="0" 
							max="1" 
							step="0.1"
							value={settings.soundVolume}
							disabled={!settings.soundEnabled}
							on:input={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
						>
						<span class="range-value">{Math.round(settings.soundVolume * 100)}%</span>
					</div>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="music-enabled">Background Music</label>
						<span class="setting-description">Enable background music (coming soon)</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="music-enabled"
							checked={settings.musicEnabled}
							disabled
							on:change={(e) => updateSetting('musicEnabled', e.target.checked)}
						>
						<span class="toggle-slider disabled">
							<Volume2 size={16} />
						</span>
					</label>
				</div>
			</div>
		</section>

		<!-- Visual Settings -->
		<section class="settings-section">
			<div class="section-header">
				<h2>{categoryInfo.visual.title}</h2>
				<p>{categoryInfo.visual.description}</p>
				<button class="reset-category-btn" on:click={() => resetCategory('visual')}>
					Reset Visual
				</button>
			</div>
			
			<div class="settings-grid">
				<div class="setting-item">
					<div class="setting-info">
						<label for="theme">Theme</label>
						<span class="setting-description">Choose your preferred color scheme</span>
					</div>
					<select 
						id="theme"
						value={settings.theme}
						on:change={(e) => updateSetting('theme', e.target.value)}
						class="select-control"
					>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
						<option value="auto">Auto (System)</option>
					</select>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="font-size">Font Size</label>
						<span class="setting-description">Adjust text size throughout the game</span>
					</div>
					<select 
						id="font-size"
						value={settings.fontSize}
						on:change={(e) => updateSetting('fontSize', e.target.value)}
						class="select-control"
					>
						<option value="small">Small</option>
						<option value="medium">Medium</option>
						<option value="large">Large</option>
					</select>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="visual-effects">Visual Effects</label>
						<span class="setting-description">Enable animations and visual effects</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="visual-effects"
							checked={settings.visualEffects}
							on:change={(e) => updateSetting('visualEffects', e.target.checked)}
						>
						<span class="toggle-slider">
							{#if settings.visualEffects}
								<Eye size={16} />
							{:else}
								<EyeOff size={16} />
							{/if}
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="high-contrast">High Contrast</label>
						<span class="setting-description">Increase contrast for better visibility</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="high-contrast"
							checked={settings.highContrast}
							on:change={(e) => updateSetting('highContrast', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="compact-mode">Compact Mode</label>
						<span class="setting-description">Use less space for UI elements</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="compact-mode"
							checked={settings.compactMode}
							on:change={(e) => updateSetting('compactMode', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>
			</div>
		</section>

		<!-- Gameplay Settings -->
		<section class="settings-section">
			<div class="section-header">
				<h2>{categoryInfo.gameplay.title}</h2>
				<p>{categoryInfo.gameplay.description}</p>
				<button class="reset-category-btn" on:click={() => resetCategory('gameplay')}>
					Reset Gameplay
				</button>
			</div>
			
			<div class="settings-grid">
				<div class="setting-item">
					<div class="setting-info">
						<label for="default-difficulty">Default Difficulty</label>
						<span class="setting-description">Starting difficulty for new games</span>
					</div>
					<select 
						id="default-difficulty"
						value={settings.defaultDifficulty}
						on:change={(e) => updateSetting('defaultDifficulty', e.target.value)}
						class="select-control"
					>
						<option value="easy">🟢 Easy</option>
						<option value="medium">🟡 Medium</option>
						<option value="hard">🔴 Hard</option>
					</select>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="hints-enabled">Hints</label>
						<span class="setting-description">Allow using hints during games</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="hints-enabled"
							checked={settings.hintsEnabled}
							on:change={(e) => updateSetting('hintsEnabled', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="show-timer">Show Timer</label>
						<span class="setting-description">Display countdown timer during games</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="show-timer"
							checked={settings.showTimer}
							on:change={(e) => updateSetting('showTimer', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="confirmations">Confirmations</label>
						<span class="setting-description">Ask for confirmation before important actions</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="confirmations"
							checked={settings.confirmations}
							on:change={(e) => updateSetting('confirmations', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>
			</div>
		</section>

		<!-- Accessibility Settings -->
		<section class="settings-section">
			<div class="section-header">
				<h2>{categoryInfo.accessibility.title}</h2>
				<p>{categoryInfo.accessibility.description}</p>
				<button class="reset-category-btn" on:click={() => resetCategory('accessibility')}>
					Reset Accessibility
				</button>
			</div>
			
			<div class="settings-grid">
				<div class="setting-item">
					<div class="setting-info">
						<label for="reduced-motion">Reduced Motion</label>
						<span class="setting-description">Minimize animations and motion effects</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="reduced-motion"
							checked={settings.reducedMotion}
							on:change={(e) => updateSetting('reducedMotion', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="keyboard-navigation">Keyboard Navigation</label>
						<span class="setting-description">Enable keyboard-only navigation</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="keyboard-navigation"
							checked={settings.keyboardNavigation}
							on:change={(e) => updateSetting('keyboardNavigation', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="color-blind-mode">Color Blind Support</label>
						<span class="setting-description">Enhanced colors for color blindness</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="color-blind-mode"
							checked={settings.colorBlindMode}
							on:change={(e) => updateSetting('colorBlindMode', e.target.checked)}
						>
						<span class="toggle-slider">
							<Eye size={16} />
						</span>
					</label>
				</div>
			</div>
		</section>

		<!-- Privacy & Data Settings -->
		<section class="settings-section">
			<div class="section-header">
				<h2>{categoryInfo.privacy.title}</h2>
				<p>{categoryInfo.privacy.description}</p>
				<button class="reset-category-btn" on:click={() => resetCategory('privacy')}>
					Reset Privacy
				</button>
			</div>
			
			<div class="settings-grid">
				<div class="setting-item">
					<div class="setting-info">
						<label for="save-stats">Save Statistics</label>
						<span class="setting-description">Save your game statistics locally</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="save-stats"
							checked={settings.saveStats}
							on:change={(e) => updateSetting('saveStats', e.target.checked)}
						>
						<span class="toggle-slider">
							<Save size={16} />
						</span>
					</label>
				</div>

				<div class="setting-item">
					<div class="setting-info">
						<label for="submit-scores">Submit Scores</label>
						<span class="setting-description">Allow submitting scores to global leaderboard</span>
					</div>
					<label class="toggle-switch">
						<input 
							type="checkbox" 
							id="submit-scores"
							checked={settings.submitScores}
							on:change={(e) => updateSetting('submitScores', e.target.checked)}
						>
						<span class="toggle-slider">
							<Upload size={16} />
						</span>
					</label>
				</div>
			</div>
		</section>

		<!-- Data Management -->
		<section class="settings-section">
			<div class="section-header">
				<h2>Data Management</h2>
				<p>Import, export, and reset your game data</p>
			</div>
			
			<div class="data-management">
				<div class="data-action">
					<div class="action-info">
						<h3>Export Data</h3>
						<p>Download your settings and game data as a backup</p>
					</div>
					<button class="action-btn export-btn" on:click={exportData}>
						<Download size={20} />
						Export Data
					</button>
				</div>

				<div class="data-action">
					<div class="action-info">
						<h3>Import Data</h3>
						<p>Restore settings and game data from a backup file</p>
					</div>
					<div class="import-controls">
						<input 
							type="file" 
							accept=".json"
							on:change={handleImportFile}
							class="file-input"
							id="import-file"
						>
						<label for="import-file" class="action-btn import-btn">
							<Upload size={20} />
							Import Data
						</label>
					</div>
				</div>

				{#if importError}
					<div class="import-message error">
						{importError}
					</div>
				{/if}

				{#if importSuccess}
					<div class="import-message success">
						{importSuccess}
					</div>
				{/if}

				<div class="data-action danger">
					<div class="action-info">
						<h3>Reset Everything</h3>
						<p>Clear all settings, statistics, and game data</p>
					</div>
					<button 
						class="action-btn danger-btn" 
						on:click={() => showConfirmReset = true}
					>
						<RotateCcw size={20} />
						Reset All Data
					</button>
				</div>
			</div>
		</section>
</div>

<!-- Reset Confirmation Modal -->
{#if showConfirmReset}
	<div class="modal-overlay" on:click={() => showConfirmReset = false}>
		<div class="modal" on:click|stopPropagation>
			<h3>Confirm Reset</h3>
			<p>This will permanently delete all your settings, statistics, and game data. This action cannot be undone.</p>
			<div class="modal-actions">
				<button class="cancel-btn" on:click={() => showConfirmReset = false}>
					Cancel
				</button>
				<button class="confirm-btn" on:click={resetAllData}>
					Reset Everything
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.settings-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: black;
		text-shadow: none;
	}

	.page-header p {
		font-size: 1.1rem;
		color: rgba(0, 0, 0, 0.7);
		margin: 0;
	}

	/* Settings Sections */
	.settings-section {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.section-header div {
		flex: 1;
	}

	.section-header h2 {
		margin: 0 0 0.5rem 0;
		color: black;
		font-size: 1.5rem;
	}

	.section-header p {
		margin: 0;
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	.reset-category-btn {
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.3);
		color: black;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.reset-category-btn:hover {
		background: rgba(0, 0, 0, 0.2);
		color: white;
	}

	/* Settings Grid */
	.settings-grid {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 0.75rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.setting-info {
		flex: 1;
	}

	.setting-info label {
		display: block;
		color: black;
		font-weight: 500;
		margin-bottom: 0.25rem;
		cursor: pointer;
	}

	.setting-description {
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.85rem;
		line-height: 1.4;
	}

	/* Toggle Switch */
	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 32px;
		cursor: pointer;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 32px;
		transition: 0.3s;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 0 4px;
	}

	.toggle-slider.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-switch input:checked + .toggle-slider {
		background-color: var(--color-theme-1);
		justify-content: flex-end;
	}

	.toggle-slider:before {
		position: absolute;
		content: "";
		height: 24px;
		width: 24px;
		background-color: white;
		border-radius: 50%;
		transition: 0.3s;
		left: 4px;
	}

	.toggle-switch input:checked + .toggle-slider:before {
		transform: translateX(28px);
	}

	/* Range Control */
	.range-control {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 200px;
	}

	.range-control input[type="range"] {
		flex: 1;
		-webkit-appearance: none;
		height: 6px;
		border-radius: 3px;
		background: rgba(0, 0, 0, 0.2);
		outline: none;
	}

	.range-control input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-theme-1);
		cursor: pointer;
	}

	.range-control input[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-theme-1);
		cursor: pointer;
		border: none;
	}

	.range-value {
		color: black;
		font-weight: 500;
		min-width: 40px;
		text-align: right;
	}

	/* Select Control */
	.select-control {
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.3);
		color: black;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		min-width: 150px;
	}

	.select-control option {
		background: white;
		color: black;
	}

	/* Data Management */
	.data-management {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.data-action {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 0.75rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.data-action.danger {
		border-color: rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.1);
	}

	.action-info h3 {
		margin: 0 0 0.5rem 0;
		color: black;
		font-size: 1.1rem;
	}

	.action-info p {
		margin: 0;
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	/* Action Buttons */
	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.3);
		border-radius: 0.75rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
		text-decoration: none;
		font-size: 0.9rem;
	}

	.export-btn {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}

	.export-btn:hover {
		background: #059669;
		transform: translateY(-2px);
	}

	.import-btn {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.import-btn:hover {
		background: #2563eb;
		transform: translateY(-2px);
	}

	.danger-btn {
		background: #ef4444;
		color: white;
		border-color: #ef4444;
	}

	.danger-btn:hover {
		background: #dc2626;
		transform: translateY(-2px);
	}

	/* File Input */
	.file-input {
		display: none;
	}

	.import-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	/* Import Messages */
	.import-message {
		padding: 1rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
	}

	.import-message.error {
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.4);
		color: #fca5a5;
	}

	.import-message.success {
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.4);
		color: #6ee7b7;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 1rem;
		padding: 2rem;
		max-width: 400px;
		width: 100%;
		color: #1f2937;
	}

	.modal h3 {
		margin: 0 0 1rem 0;
		color: #ef4444;
	}

	.modal p {
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.cancel-btn, .confirm-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
	}

	.cancel-btn {
		background: #e5e7eb;
		color: #374151;
	}

	.confirm-btn {
		background: #ef4444;
		color: white;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.setting-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.range-control {
			width: 100%;
		}

		.data-action {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.reset-category-btn {
			align-self: flex-start;
		}
	}

	@media (max-width: 480px) {
		.settings-section {
			padding: 1.5rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.modal {
			padding: 1.5rem;
		}

		.modal-actions {
			flex-direction: column;
		}
	}
</style>