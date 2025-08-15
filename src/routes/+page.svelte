<script lang="ts">
	import ConcentrationGame from '$lib/components/ConcentrationGame.svelte';
	import GameStats from '$lib/components/GameStats.svelte';
	import { gameStore } from '$lib/stores/gameStore.js';
	import { settingsStore } from '$lib/stores/settingsStore.js';
	import { Play, Trophy, Settings, Brain } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import stonewallLogo from '$lib/assets/stonewall-logo.png';
	import stonewallIcon from '$lib/assets/stonewall-icon.png';

	let selectedDifficulty: 'easy' | 'medium' | 'hard' = 'easy';
	let showGame = false;
	let mounted = false;

	onMount(() => {
		mounted = true;
		// Set default difficulty from settings
		selectedDifficulty = $settingsStore.defaultDifficulty;
	});

	$: stats = $gameStore.stats;

	function startGame(difficulty: 'easy' | 'medium' | 'hard') {
		selectedDifficulty = difficulty;
		showGame = true;
		gameStore.startGame(difficulty);
	}

	function backToMenu() {
		showGame = false;
	}

	function getTotalGamesPlayed(): number {
		return Object.values(stats.gamesPlayed).reduce((sum, count) => sum + count, 0);
	}

	function getTotalGamesCompleted(): number {
		return Object.values(stats.gamesCompleted).reduce((sum, count) => sum + count, 0);
	}

	function getCompletionRate(): number {
		const total = getTotalGamesPlayed();
		const completed = getTotalGamesCompleted();
		return total > 0 ? Math.round((completed / total) * 100) : 0;
	}

	const difficultyInfo = {
		easy: {
			title: 'Easy',
			description: '4×4 grid, 4 cells to remember, 3 seconds to memorize, no distractions',
			color: '#000000',
			icon: '○'
		},
		medium: {
			title: 'Medium',
			description: '5×5 grid, 6 cells to remember, 4 seconds to memorize, 2 distractions',
			color: '#333333',
			icon: '◐'
		},
		hard: {
			title: 'Hard',
			description: '6×6 grid, 8 cells to remember, 5 seconds to memorize, 4 distractions',
			color: '#000000',
			icon: '●'
		}
	};
</script>

<svelte:head>
	<title>SMA - Concentration Grid</title>
	<meta name="description" content="SMA Concentration Grid - Advanced cognitive training through challenging grid-based exercises. Enhance memory, focus, and mental performance." />
</svelte:head>

{#if !showGame}
	<div class="home-page">
		<!-- Hero Section -->
		<section class="hero">
			<div class="hero-content">
				<div class="hero-logo">
					<img src={stonewallLogo} alt="Stonewall Mind Academy" class="main-logo" />
				</div>
				<h1 class="hero-title">Concentration Grid</h1>
				<p class="hero-subtitle">
					Master your ability to focus! SMA: Concentration Grid Game is an advanced cognitive training through pattern recognition and memory exercises.
					Challenge your mind with progressive difficulty levels designed for elite mental performance.
				</p>

				{#if mounted && getTotalGamesPlayed() > 0}
					<div class="hero-stats">
						<div class="stat-badge">
							<Trophy size={20} />
							<span>{getTotalGamesCompleted()} games won</span>
						</div>
						<div class="stat-badge">
							<span>{getCompletionRate()}% success rate</span>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- Difficulty Selection -->
		<section class="difficulty-selection">
			<h2>Choose Your Challenge</h2>
			<div class="difficulty-grid">
				{#each Object.entries(difficultyInfo) as [difficulty, info]}
					<div class="difficulty-card" style="--accent-color: {info.color}">
						<div class="difficulty-header">
							<span class="difficulty-icon">{info.icon}</span>
							<h3>{info.title}</h3>
						</div>
						<p class="difficulty-description">{info.description}</p>

						{#if mounted}
							<div class="difficulty-stats">
								<div class="stat">
									<span class="stat-label">Played:</span>
									<span class="stat-value">{stats.gamesPlayed[difficulty] || 0}</span>
								</div>
								<div class="stat">
									<span class="stat-label">Won:</span>
									<span class="stat-value">{stats.gamesCompleted[difficulty] || 0}</span>
								</div>
								{#if $gameStore.bestTimes[difficulty]}
									<div class="stat">
										<span class="stat-label">Best Time:</span>
										<span class="stat-value">{($gameStore.bestTimes[difficulty] / 1000).toFixed(1)}s</span>
									</div>
								{/if}
							</div>
						{/if}

						<button
							class="play-button"
							on:click={() => startGame(difficulty)}
							style="background-color: {info.color}"
						>
							<Play size={20} />
							Play {info.title}
						</button>
					</div>
				{/each}
			</div>
		</section>

		<!-- Game Stats Preview -->
		{#if mounted && getTotalGamesPlayed() > 0}
			<section class="stats-preview">
				<h2>Your Progress</h2>
				<GameStats showFullStats={false} />
				<div class="stats-actions">
					<a href="/leaderboard" class="action-link">
						<Trophy size={20} />
						View Leaderboard
					</a>
					<a href="/settings" class="action-link">
						<Settings size={20} />
						Game Settings
					</a>
				</div>
			</section>
		{/if}

		<!-- How to Play -->
		<section class="how-to-play">
			<h2>How to Play</h2>
			<div class="steps">
				<div class="step">
					<div class="step-number">1</div>
					<div class="step-content">
						<h3>Choose Difficulty</h3>
						<p>Select Easy, Medium, or Hard based on your skill level</p>
					</div>
				</div>
				<div class="step">
					<div class="step-number">2</div>
					<div class="step-content">
						<h3>Memorize the Sequence</h3>
						<p>Watch as the target cells light up in order. Pay close attention!</p>
					</div>
				</div>
				<div class="step">
					<div class="step-number">3</div>
					<div class="step-content">
						<h3>Reproduce the Pattern</h3>
						<p>Click the cells in the exact same order you saw them</p>
					</div>
				</div>
				<div class="step">
					<div class="step-number">4</div>
					<div class="step-content">
						<h3>Beat the Clock</h3>
						<p>Complete the sequence before time runs out to earn points</p>
					</div>
				</div>
			</div>
		</section>
	</div>
{:else}
	<div class="game-container">
		<div class="game-header">
			<button class="back-button" on:click={backToMenu}>
				← Back to Menu
			</button>
		</div>
		<ConcentrationGame difficulty={selectedDifficulty} />
	</div>
{/if}

<style>
	.home-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Hero Section */
	.hero {
		text-align: center;
		margin-bottom: 4rem;
	}

	.hero-content {
		background: rgba(0, 0, 0, 0.05);
		backdrop-filter: blur(10px);
		border-radius: 1.5rem;
		padding: 3rem 2rem;
		border: 2px solid var(--color-border);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	:global([data-theme="dark"]) .hero-content {
		background: rgba(255, 255, 255, 0.05);
		border-color: var(--color-border);
		box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
	}

	.hero-logo {
		margin-bottom: 0;
		display: flex;
		justify-content: center;
	}

	.main-logo {
		height: 250px;
		width: auto;
		object-fit: contain;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 700;
		font-family: 'Syncopate', monospace;
		margin: 0 0 1rem 0;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		text-transform: capitalize;
		color: var(--color-text-light);
		margin: 0 0 2rem 0;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.6;
		font-weight: 400;
	}

	.hero-stats {
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.stat-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-accent);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		color: var(--color-bg-0);
		font-weight: 500;
		border: 1px solid var(--color-border);
	}

	/* Difficulty Selection */
	.difficulty-selection {
		margin-bottom: 4rem;
	}

	.difficulty-selection h2 {
		text-align: center;
		font-size: 2rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		margin-bottom: 2rem;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.difficulty-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.difficulty-card {
		background: var(--color-bg-1);
		border-radius: 1rem;
		padding: 2rem;
		border: 2px solid var(--color-border);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	:global([data-theme="dark"]) .difficulty-card {
		box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
	}

	.difficulty-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--accent-color);
	}

	.difficulty-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		border-color: var(--color-accent);
	}

	:global([data-theme="dark"]) .difficulty-card:hover {
		box-shadow: 0 8px 32px rgba(255, 255, 255, 0.15);
	}

	.difficulty-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.difficulty-icon {
		font-size: 1.5rem;
	}

	.difficulty-header h3 {
		margin: 0;
		font-size: 1.5rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.difficulty-description {
		color: var(--color-text-light);
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.difficulty-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.stat {
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 0.8rem;
		color: var(--color-text-light);
		margin-bottom: 0.25rem;
	}

	.stat-value {
		display: block;
		font-weight: bold;
		color: var(--color-text);
		font-size: 1.1rem;
	}

	.play-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		border: 2px solid var(--color-accent);
		border-radius: 0.75rem;
		color: var(--color-bg-0);
		background: var(--color-accent);
		font-weight: bold;
		font-size: 1rem;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.play-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		background: transparent;
		color: white;
	}

	:global([data-theme="dark"]) .play-button:hover {
		box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
	}

	/* Stats Preview */
	.stats-preview {
		margin-bottom: 4rem;
	}

	.stats-preview h2 {
		text-align: center;
		font-size: 2rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		margin-bottom: 2rem;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.stats-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.action-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: transparent;
		color: var(--color-text);
		text-decoration: none;
		border-radius: 0.75rem;
		border: 2px solid var(--color-border);
		transition: all 0.2s ease;
		font-weight: 500;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-size: 0.9rem;
	}

	.action-link:hover {
		background: var(--color-accent);
		color: var(--color-bg-0);
		border-color: var(--color-accent);
		transform: translateY(-2px);
		text-decoration: none;
	}

	/* How to Play */
	.how-to-play {
		margin-bottom: 4rem;
	}

	.how-to-play h2 {
		text-align: center;
		font-size: 2rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		margin-bottom: 2rem;
		color: var(--color-text);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		width: 3rem;
		height: 3rem;
		background: var(--color-accent);
		color: var(--color-bg-0);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.25rem;
		font-family: 'Syncopate', monospace;
		flex-shrink: 0;
		border: 2px solid var(--color-accent);
	}

	.step-content h3 {
		margin: 0 0 0.5rem 0;
		color: var(--color-text);
		font-size: 1.25rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.step-content p {
		margin: 0;
		color: var(--color-text-light);
		line-height: 1.5;
	}

	/* Game Container */
	.game-container {
		max-width: 800px;
		margin: 0 auto;
	}

	.game-header {
		margin-bottom: 2rem;
	}

	.back-button {
		background: transparent;
		border: 2px solid var(--color-border);
		color: var(--color-text);
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		cursor: pointer;
		font-weight: 500;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s ease;
	}

	.back-button:hover {
		background: var(--color-accent);
		color: var(--color-bg-0);
		border-color: var(--color-accent);
		transform: translateY(-2px);
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.1rem;
		}

		.difficulty-grid {
			grid-template-columns: 1fr;
		}

		.steps {
			grid-template-columns: 1fr;
		}

		.hero-content {
			padding: 2rem 1.5rem;
		}

		.difficulty-card {
			padding: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.hero-title {
			font-size: 2rem;
		}

		.stats-actions {
			flex-direction: column;
			align-items: center;
		}

		.action-link {
			width: 100%;
			max-width: 300px;
			justify-content: center;
		}
	}
</style>
