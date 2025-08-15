<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore } from '$lib/stores/gameStore.js';
	import { formatTime } from '$lib/utils/scoreUtils.js';
	import { Trophy, Medal, Award, User, Clock, Target, Zap } from 'lucide-svelte';

	let leaderboard = [];
	let loading = true;
	let error = null;
	let selectedDifficulty = 'all';
	let stats = null;

	onMount(async () => {
		await loadLeaderboard();
	});

	async function loadLeaderboard() {
		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/scores?difficulty=${selectedDifficulty === 'all' ? '' : selectedDifficulty}&stats=true`);

			if (response.ok) {
				const data = await response.json();
				leaderboard = data.leaderboard || [];
				stats = data.stats || null;
			} else {
				throw new Error('Failed to load leaderboard');
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading leaderboard:', err);
		} finally {
			loading = false;
		}
	}

	function getRankIcon(rank) {
		switch (rank) {
			case 1: return { icon: Trophy, color: '#ffd700' };
			case 2: return { icon: Medal, color: '#c0c0c0' };
			case 3: return { icon: Award, color: '#cd7f32' };
			default: return { icon: User, color: '#6b7280' };
		}
	}

	function getDifficultyColor(difficulty) {
		switch (difficulty) {
			case 'easy': return '#10b981';
			case 'medium': return '#f59e0b';
			case 'hard': return '#ef4444';
			default: return '#6b7280';
		}
	}

	function getDifficultyEmoji(difficulty) {
		switch (difficulty) {
			case 'easy': return '🟢';
			case 'medium': return '🟡';
			case 'hard': return '🔴';
			default: return '⚪';
		}
	}

	function getFilteredLeaderboard() {
		if (selectedDifficulty === 'all') {
			return leaderboard;
		}
		return leaderboard.filter(entry => entry.difficulty === selectedDifficulty);
	}

	$: filteredLeaderboard = getFilteredLeaderboard();
	$: myStats = $gameStore.stats;
	$: myBestTimes = $gameStore.bestTimes;
</script>

<svelte:head>
	<title>Leaderboard - SMA Concentration Grid</title>
</svelte:head>

<div class="leaderboard-page">
	<div class="page-header">
		<h1>🏆 Global Leaderboard</h1>
		<p>See how you stack up against other players worldwide</p>
	</div>

	<!-- Global Stats -->
	{#if stats}
		<section class="global-stats">
			<h2>Global Statistics</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">
						<Trophy size={32} color="#ffd700" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.totalGames.toLocaleString()}</div>
						<div class="stat-label">Total Games</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">
						<Target size={32} color="#10b981" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.completionRate.toFixed(1)}%</div>
						<div class="stat-label">Success Rate</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">
						<Zap size={32} color="#f59e0b" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.averageScore.toLocaleString()}</div>
						<div class="stat-label">Average Score</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">
						<Award size={32} color="#8b5cf6" />
					</div>
					<div class="stat-content">
						<div class="stat-value">{stats.topScore.toLocaleString()}</div>
						<div class="stat-label">Highest Score</div>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Difficulty Filter -->
	<section class="filter-section">
		<div class="filter-header">
			<h2>Filter by Difficulty</h2>
		</div>
		<div class="filter-buttons">
			<button
				class="filter-btn text-white"
				class:active={selectedDifficulty === 'all'}
				on:click={() => { selectedDifficulty = 'all'; loadLeaderboard(); }}
			>
				All Levels
			</button>
			<button
				class="filter-btn easy"
				class:active={selectedDifficulty === 'easy'}
				on:click={() => { selectedDifficulty = 'easy'; loadLeaderboard(); }}
			>
				🟢 Easy
			</button>
			<button
				class="filter-btn medium"
				class:active={selectedDifficulty === 'medium'}
				on:click={() => { selectedDifficulty = 'medium'; loadLeaderboard(); }}
			>
				🟡 Medium
			</button>
			<button
				class="filter-btn hard"
				class:active={selectedDifficulty === 'hard'}
				on:click={() => { selectedDifficulty = 'hard'; loadLeaderboard(); }}
			>
				🔴 Hard
			</button>
		</div>
	</section>

	<!-- My Performance -->
	<section class="my-performance">
		<h2>Your Performance</h2>
		<div class="performance-grid">
			{#each ['easy', 'medium', 'hard'] as difficulty}
				<div class="performance-card">
					<div class="performance-header">
						<span class="difficulty-emoji">{getDifficultyEmoji(difficulty)}</span>
						<h3>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h3>
					</div>
					<div class="performance-stats">
						<div class="perf-stat">
							<span class="perf-label">Games Won:</span>
							<span class="perf-value">{myStats.gamesCompleted[difficulty] || 0}</span>
						</div>
						<div class="perf-stat">
							<span class="perf-label">Best Time:</span>
							<span class="perf-value">
								{myBestTimes[difficulty] ? formatTime(myBestTimes[difficulty]) : 'N/A'}
							</span>
						</div>
						<div class="perf-stat">
							<span class="perf-label">Success Rate:</span>
							<span class="perf-value">
								{myStats.gamesPlayed[difficulty] > 0
									? Math.round((myStats.gamesCompleted[difficulty] / myStats.gamesPlayed[difficulty]) * 100)
									: 0}%
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Leaderboard -->
	<section class="leaderboard-section">
		<h2>
			{selectedDifficulty === 'all' ? 'All Difficulties' : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} Leaderboard
		</h2>

		{#if loading}
			<div class="loading">
				<div class="loading-spinner"></div>
				<p>Loading leaderboard...</p>
			</div>
		{:else if error}
			<div class="error">
				<p>Error loading leaderboard: {error}</p>
				<button class="retry-btn" on:click={loadLeaderboard}>
					Try Again
				</button>
			</div>
		{:else if filteredLeaderboard.length === 0}
			<div class="empty-state">
				<Trophy size={64} color="#d1d5db" />
				<h3>No scores yet</h3>
				<p>Be the first to set a score in this difficulty!</p>
				<a href="/" class="play-now-btn">Play Now</a>
			</div>
		{:else}
			<div class="leaderboard-table">
				<div class="table-header">
					<div class="rank-col">Rank</div>
					<div class="player-col">Player</div>
					<div class="score-col">Score</div>
					<div class="time-col">Time</div>
					<div class="difficulty-col">Difficulty</div>
					<div class="date-col">Date</div>
				</div>

				{#each filteredLeaderboard as entry, index}
					{@const rankInfo = getRankIcon(index + 1)}
					<div class="table-row" class:top-three={index < 3}>
						<div class="rank-col">
							<div class="rank-info">
								<svelte:component this={rankInfo.icon} size={20} color={rankInfo.color} />
								<span class="rank-number">#{index + 1}</span>
							</div>
						</div>

						<div class="player-col">
							<span class="player-name">{entry.playerName || 'Anonymous'}</span>
						</div>

						<div class="score-col">
							<span class="score-value">{entry.score.toLocaleString()}</span>
						</div>

						<div class="time-col">
							<span class="time-value">{formatTime(entry.time)}</span>
							{#if entry.hintsUsed > 0}
								<span class="hints-used">({entry.hintsUsed} hints)</span>
							{/if}
						</div>

						<div class="difficulty-col">
							<span
								class="difficulty-badge"
								style="background-color: {getDifficultyColor(entry.difficulty)}"
							>
								{getDifficultyEmoji(entry.difficulty)} {entry.difficulty.toUpperCase()}
							</span>
						</div>

						<div class="date-col">
							<span class="date-value">{new Date(entry.timestamp).toLocaleDateString()}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	.leaderboard-page {
		max-width: 1200px;
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

	/* Global Stats */
	.global-stats {
		margin-bottom: 3rem;
	}

	.global-stats h2 {
		text-align: center;
		color: black;
		margin-bottom: 2rem;
		font-size: 1.75rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.stat-icon {
		flex-shrink: 0;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: bold;
		color: black;
		display: block;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.9rem;
		color: rgba(0, 0, 0, 0.6);
		margin-top: 0.25rem;
	}

	/* Filter Section */
	.filter-section {
		margin-bottom: 3rem;
	}

	.filter-header h2 {
		text-align: center;
		color: black;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.filter-buttons {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.filter-btn {
		padding: 0.75rem 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.3);
		background: rgba(255, 255, 255, 0.9);
		color: black;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.filter-btn:hover {
		background: rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.filter-btn.active {
		background: var(--color-theme-1);
		border-color: var(--color-theme-1);
		transform: translateY(-2px);
		color: white;
	}

	.filter-btn.easy.active {
		background: #10b981;
		border-color: #10b981;
	}

	.filter-btn.medium.active {
		background: #f59e0b;
		border-color: #f59e0b;
	}

	.filter-btn.hard.active {
		background: #ef4444;
		border-color: #ef4444;
	}

	/* My Performance */
	.my-performance {
		margin-bottom: 3rem;
	}

	.my-performance h2 {
		text-align: center;
		color: black;
		margin-bottom: 2rem;
		font-size: 1.75rem;
	}

	.performance-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.performance-card {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.performance-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.difficulty-emoji {
		font-size: 1.25rem;
	}

	.performance-header h3 {
		margin: 0;
		color: black;
		font-size: 1.25rem;
	}

	.performance-stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.perf-stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.perf-label {
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	.perf-value {
		color: black;
		font-weight: 500;
	}

	/* Leaderboard Section */
	.leaderboard-section {
		margin-bottom: 3rem;
	}

	.leaderboard-section h2 {
		text-align: center;
		color: black;
		margin-bottom: 2rem;
		font-size: 1.75rem;
	}

	.leaderboard-table {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		overflow: hidden;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.table-header {
		display: grid;
		grid-template-columns: 80px 1fr 100px 120px 120px 100px;
		gap: 1rem;
		padding: 1rem 1.5rem;
		background: rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		font-weight: bold;
		color: black;
		font-size: 0.9rem;
	}

	.table-row {
		display: grid;
		grid-template-columns: 80px 1fr 100px 120px 120px 100px;
		gap: 1rem;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		align-items: center;
		transition: background 0.2s ease;
	}

	.table-row:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.table-row.top-three {
		background: rgba(255, 215, 0, 0.1);
	}

	.rank-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.rank-number {
		font-weight: bold;
		color: black;
	}

	.player-name {
		color: black;
		font-weight: 500;
	}

	.score-value {
		color: #fbbf24;
		font-weight: bold;
		font-size: 1.1rem;
	}

	.time-value {
		color: black;
		font-weight: 500;
	}

	.hints-used {
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.8rem;
		display: block;
		margin-top: 0.25rem;
	}

	.difficulty-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		color: white;
		font-weight: bold;
		font-size: 0.8rem;
	}

	.date-value {
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	/* Loading, Error, Empty States */
	.loading, .error, .empty-state {
		text-align: center;
		padding: 3rem;
		color: black;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(0, 0, 0, 0.3);
		border-top: 4px solid black;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.retry-btn, .play-now-btn {
		background: var(--color-theme-1);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		cursor: pointer;
		font-weight: 500;
		text-decoration: none;
		display: inline-block;
		margin-top: 1rem;
		transition: all 0.2s ease;
	}

	.retry-btn:hover, .play-now-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.empty-state h3 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.5rem;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.table-header, .table-row {
			grid-template-columns: 1fr;
			gap: 0.5rem;
			text-align: left;
		}

		.table-header {
			display: none;
		}

		.table-row {
			flex-direction: column;
			display: flex;
			align-items: flex-start;
			padding: 1rem;
		}

		.rank-info {
			align-self: flex-start;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.performance-grid {
			grid-template-columns: 1fr;
		}

		.filter-buttons {
			flex-direction: column;
			align-items: center;
		}

		.filter-btn {
			width: 100%;
			max-width: 200px;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.page-header h1 {
			font-size: 2rem;
		}
	}
</style>