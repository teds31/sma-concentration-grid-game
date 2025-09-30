<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore.js';
	import { GameDataService } from '$lib/services/gameDataService.js';
	import { goto } from '$app/navigation';
	import { Trophy, Clock, Target, Brain, TrendingUp, Calendar } from 'lucide-svelte';

	let loading = true;
	let gameResults = [];
	let userStats = null;
	let bestTimes = null;
	let error = '';

	$: user = $authStore.user;

	onMount(async () => {
		// Redirect if not authenticated
		if (!user) {
			goto('/');
			return;
		}

		await loadUserData();
	});

	async function loadUserData() {
		if (!user) return;

		loading = true;
		error = '';

		try {
			// Load user's game results
			const resultsResponse = await GameDataService.getUserGameResults(user.id, 20);
			if (resultsResponse.error) throw resultsResponse.error;
			gameResults = resultsResponse.data || [];

			// Load user stats
			const statsResponse = await GameDataService.getUserStats(user.id);
			if (statsResponse.error) throw statsResponse.error;
			userStats = statsResponse.data;

			// Load best times
			const timesResponse = await GameDataService.getUserBestTimes(user.id);
			if (timesResponse.error) throw timesResponse.error;
			bestTimes = timesResponse.data || {};

		} catch (err) {
			error = 'Failed to load your game data';
			console.error('Dashboard load error:', err);
		} finally {
			loading = false;
		}
	}

	function formatTime(milliseconds) {
		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		
		if (minutes > 0) {
			return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
		}
		return `${remainingSeconds}s`;
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
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
</script>

<svelte:head>
	<title>Dashboard - SMA Concentration Grid</title>
	<meta name="description" content="View your game statistics and progress in the SMA Concentration Grid." />
</svelte:head>

<div class="dashboard-page">
	<div class="page-header">
		<h1>Your Dashboard</h1>
		<p>Track your progress and view your game statistics</p>
	</div>

	{#if loading}
		<div class="loading">
			<div class="loading-spinner"></div>
			<p>Loading your game data...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
			<button on:click={loadUserData} class="retry-btn">
				Try Again
			</button>
		</div>
	{:else}
		<!-- User Stats Summary -->
		{#if userStats}
			<section class="stats-summary">
				<h2>Your Statistics</h2>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon">
							<Trophy size={32} color="#ffd700" />
						</div>
						<div class="stat-content">
							<div class="stat-value">{userStats.totalGames}</div>
							<div class="stat-label">Total Games</div>
						</div>
					</div>
					
					<div class="stat-card">
						<div class="stat-icon">
							<Target size={32} color="#10b981" />
						</div>
						<div class="stat-content">
							<div class="stat-value">{userStats.totalCompleted}</div>
							<div class="stat-label">Completed</div>
						</div>
					</div>
					
					<div class="stat-card">
						<div class="stat-icon">
							<TrendingUp size={32} color="#8b5cf6" />
						</div>
						<div class="stat-content">
							<div class="stat-value">
								{userStats.totalGames > 0 ? Math.round((userStats.totalCompleted / userStats.totalGames) * 100) : 0}%
							</div>
							<div class="stat-label">Success Rate</div>
						</div>
					</div>
				</div>
			</section>

			<!-- Best Times -->
			{#if bestTimes && Object.keys(bestTimes).length > 0}
				<section class="best-times">
					<h2>Your Best Times</h2>
					<div class="times-grid">
						{#each Object.entries(bestTimes) as [difficulty, time]}
							<div class="time-card">
								<div class="time-header">
									<span class="difficulty-emoji">{getDifficultyEmoji(difficulty)}</span>
									<h3>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h3>
								</div>
								<div class="time-value">
									<Clock size={20} />
									{formatTime(time)}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Difficulty Breakdown -->
			<section class="difficulty-breakdown">
				<h2>Performance by Difficulty</h2>
				<div class="difficulty-grid">
					{#each ['easy', 'medium', 'hard'] as difficulty}
						<div class="difficulty-stat-card">
							<div class="difficulty-stat-header">
								<span class="difficulty-emoji">{getDifficultyEmoji(difficulty)}</span>
								<h3>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h3>
							</div>
							<div class="difficulty-stats">
								<div class="stat">
									<span class="stat-label">Played:</span>
									<span class="stat-value">{userStats.gamesPlayed[difficulty] || 0}</span>
								</div>
								<div class="stat">
									<span class="stat-label">Completed:</span>
									<span class="stat-value">{userStats.gamesCompleted[difficulty] || 0}</span>
								</div>
								<div class="stat">
									<span class="stat-label">Success Rate:</span>
									<span class="stat-value">
										{userStats.gamesPlayed[difficulty] > 0 
											? Math.round((userStats.gamesCompleted[difficulty] / userStats.gamesPlayed[difficulty]) * 100)
											: 0}%
									</span>
								</div>
								{#if userStats.averageScore[difficulty] > 0}
									<div class="stat">
										<span class="stat-label">Avg Score:</span>
										<span class="stat-value">{userStats.averageScore[difficulty].toLocaleString()}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Recent Games -->
		{#if gameResults && gameResults.length > 0}
			<section class="recent-games">
				<h2>Recent Games</h2>
				<div class="games-list">
					{#each gameResults as game}
						<div class="game-result-card" class:completed={game.completed}>
							<div class="game-info">
								<div class="game-header">
									<span 
										class="difficulty-badge"
										style="background-color: {getDifficultyColor(game.difficulty)}"
									>
										{getDifficultyEmoji(game.difficulty)} {game.difficulty.toUpperCase()}
									</span>
									<span class="game-date">
										<Calendar size={14} />
										{formatDate(game.created_at)}
									</span>
								</div>
								<div class="game-stats">
									<div class="game-stat">
										<Trophy size={16} />
										{game.score.toLocaleString()} pts
									</div>
									<div class="game-stat">
										<Clock size={16} />
										{formatTime(game.time_taken)}
									</div>
									{#if game.hints_used > 0}
										<div class="game-stat">
											<Brain size={16} />
											{game.hints_used} hints
										</div>
									{/if}
								</div>
							</div>
							<div class="game-status">
								{#if game.completed}
									<span class="status-completed">✅ Completed</span>
								{:else}
									<span class="status-failed">❌ Failed</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{:else}
			<section class="no-games">
				<div class="no-games-content">
					<Brain size={64} color="#d1d5db" />
					<h3>No Games Yet</h3>
					<p>Start playing to see your statistics and progress here!</p>
					<a href="/" class="play-now-btn">
						<Trophy size={20} />
						Start Playing
					</a>
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.dashboard-page {
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
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.page-header p {
		font-size: 1.1rem;
		color: rgba(0, 0, 0, 0.7);
		margin: 0;
	}

	/* Loading and Error States */
	.loading, .error {
		text-align: center;
		padding: 3rem;
		color: black;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(0, 0, 0, 0.1);
		border-top: 4px solid black;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.retry-btn {
		background: black;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		cursor: pointer;
		font-weight: 500;
		margin-top: 1rem;
		transition: all 0.2s ease;
	}

	.retry-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: translateY(-2px);
	}

	/* Sections */
	section {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		padding: 2rem;
		margin-bottom: 2rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	section h2 {
		text-align: center;
		color: black;
		margin-bottom: 1.5rem;
		font-size: 1.75rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
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

	/* Best Times */
	.times-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.time-card {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		text-align: center;
	}

	.time-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.time-header h3 {
		margin: 0;
		color: black;
		font-size: 1.1rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.time-value {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 1.25rem;
		font-weight: bold;
		color: black;
	}

	.difficulty-emoji {
		font-size: 1.25rem;
	}

	/* Difficulty Breakdown */
	.difficulty-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.difficulty-stat-card {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.difficulty-stat-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.difficulty-stat-header h3 {
		margin: 0;
		color: black;
		font-size: 1.25rem;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.difficulty-stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.stat .stat-label {
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	.stat .stat-value {
		color: black;
		font-weight: 500;
		font-size: 1rem;
	}

	/* Recent Games */
	.games-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.game-result-card {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		transition: all 0.2s ease;
	}

	.game-result-card:hover {
		background: rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	.game-result-card.completed {
		border-left: 4px solid #10b981;
	}

	.game-info {
		flex: 1;
	}

	.game-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}

	.difficulty-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		color: white;
		font-weight: bold;
		font-size: 0.8rem;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.game-date {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.85rem;
	}

	.game-stats {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.game-stat {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: rgba(0, 0, 0, 0.8);
		font-size: 0.9rem;
		font-weight: 500;
	}

	.game-status {
		flex-shrink: 0;
	}

	.status-completed {
		color: #10b981;
		font-weight: bold;
		font-size: 0.9rem;
	}

	.status-failed {
		color: #ef4444;
		font-weight: bold;
		font-size: 0.9rem;
	}

	/* No Games State */
	.no-games {
		text-align: center;
		padding: 3rem 2rem;
	}

	.no-games-content h3 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.5rem;
		color: black;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.no-games-content p {
		color: rgba(0, 0, 0, 0.6);
		margin-bottom: 2rem;
	}

	.play-now-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: black;
		color: white;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.75rem;
		font-weight: 500;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s ease;
	}

	.play-now-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: translateY(-2px);
		text-decoration: none;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.times-grid, .difficulty-grid {
			grid-template-columns: 1fr;
		}

		.game-result-card {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.game-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.game-stats {
			flex-direction: column;
			gap: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.stats-grid {
			grid-template-columns: 1fr;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		section {
			padding: 1.5rem;
		}
	}
</style>