<script lang="ts">
	import { gameStore } from '../stores/gameStore.js';
	import { Trophy, Clock, Target, Zap } from 'lucide-svelte';

	export let showFullStats = true;
	export let difficulty: 'easy' | 'medium' | 'hard' | null = null;

	$: stats = $gameStore.stats;
	$: bestTimes = $gameStore.bestTimes;
	$: recentScores = $gameStore.recentScores;

	function formatTime(ms: number): string {
		const seconds = (ms / 1000).toFixed(1);
		return `${seconds}s`;
	}

	function getFilteredScores() {
		if (!difficulty) return recentScores;
		return recentScores.filter(score => score.difficulty === difficulty);
	}

	function getDifficultyStats(diff: 'easy' | 'medium' | 'hard') {
		return {
			played: stats.gamesPlayed[diff] || 0,
			completed: stats.gamesCompleted[diff] || 0,
			bestTime: bestTimes[diff] || null,
			averageScore: getAverageScore(diff)
		};
	}

	function getAverageScore(diff: 'easy' | 'medium' | 'hard'): number {
		const difficultyScores = recentScores.filter(score => 
			score.difficulty === diff && score.success
		);
		
		if (difficultyScores.length === 0) return 0;
		
		const total = difficultyScores.reduce((sum, score) => sum + score.score, 0);
		return Math.round(total / difficultyScores.length);
	}

	function getCompletionRate(diff: 'easy' | 'medium' | 'hard'): number {
		const played = stats.gamesPlayed[diff] || 0;
		const completed = stats.gamesCompleted[diff] || 0;
		return played > 0 ? Math.round((completed / played) * 100) : 0;
	}

	function getTotalGamesPlayed(): number {
		return Object.values(stats.gamesPlayed).reduce((sum, count) => sum + count, 0);
	}

	function getTotalGamesCompleted(): number {
		return Object.values(stats.gamesCompleted).reduce((sum, count) => sum + count, 0);
	}

	function getOverallCompletionRate(): number {
		const total = getTotalGamesPlayed();
		const completed = getTotalGamesCompleted();
		return total > 0 ? Math.round((completed / total) * 100) : 0;
	}

	function getBestOverallTime(): number | null {
		const allTimes = Object.values(bestTimes).filter(time => time !== null);
		return allTimes.length > 0 ? Math.min(...allTimes as number[]) : null;
	}

	function getRankForScore(score: number, diff: 'easy' | 'medium' | 'hard'): string {
		const difficultyScores = recentScores
			.filter(s => s.difficulty === diff && s.success)
			.map(s => s.score)
			.sort((a, b) => b - a);

		if (difficultyScores.length === 0) return 'N/A';

		const rank = difficultyScores.findIndex(s => s <= score) + 1;
		const total = difficultyScores.length;

		if (rank === 0) return `${total + 1}/${total + 1}`;
		return `${rank}/${total}`;
	}

	function getStreakInfo() {
		let currentStreak = 0;
		let maxStreak = 0;
		let tempStreak = 0;

		// Calculate from most recent games
		const sortedScores = [...recentScores].sort((a, b) => b.timestamp - a.timestamp);

		for (let i = 0; i < sortedScores.length; i++) {
			if (sortedScores[i].success) {
				tempStreak++;
				if (i === 0) currentStreak = tempStreak;
			} else {
				maxStreak = Math.max(maxStreak, tempStreak);
				tempStreak = 0;
				if (i === 0) currentStreak = 0;
			}
		}

		maxStreak = Math.max(maxStreak, tempStreak);

		return { current: currentStreak, max: maxStreak };
	}

	$: streak = getStreakInfo();
</script>

<div class="game-stats">
	{#if showFullStats}
		<div class="stats-header">
			<h3>Game Statistics</h3>
		</div>

		<div class="overall-stats">
			<div class="stat-card">
				<div class="stat-icon">
					<Trophy size={24} />
				</div>
				<div class="stat-content">
					<div class="stat-value">{getTotalGamesCompleted()}</div>
					<div class="stat-label">Games Won</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">
					<Target size={24} />
				</div>
				<div class="stat-content">
					<div class="stat-value">{getOverallCompletionRate()}%</div>
					<div class="stat-label">Success Rate</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">
					<Clock size={24} />
				</div>
				<div class="stat-content">
					<div class="stat-value">
						{getBestOverallTime() ? formatTime(getBestOverallTime()!) : 'N/A'}
					</div>
					<div class="stat-label">Best Time</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-icon">
					<Zap size={24} />
				</div>
				<div class="stat-content">
					<div class="stat-value">{streak.current}</div>
					<div class="stat-label">Win Streak</div>
					<div class="stat-subtitle">Max: {streak.max}</div>
				</div>
			</div>
		</div>

		<div class="difficulty-breakdown">
			<h4>Difficulty Breakdown</h4>
			<div class="difficulty-stats">
				{#each ['easy', 'medium', 'hard'] as diff}
					{@const diffStats = getDifficultyStats(diff)}
					<div class="difficulty-card">
						<div class="difficulty-header">
							<h5>{diff.charAt(0).toUpperCase() + diff.slice(1)}</h5>
							<span class="completion-rate">{getCompletionRate(diff)}% win rate</span>
						</div>
						<div class="difficulty-details">
							<div class="detail-row">
								<span>Games Played:</span>
								<span>{diffStats.played}</span>
							</div>
							<div class="detail-row">
								<span>Games Won:</span>
								<span>{diffStats.completed}</span>
							</div>
							<div class="detail-row">
								<span>Best Time:</span>
								<span>{diffStats.bestTime ? formatTime(diffStats.bestTime) : 'N/A'}</span>
							</div>
							<div class="detail-row">
								<span>Avg Score:</span>
								<span>{diffStats.averageScore}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		{#if getFilteredScores().length > 0}
			<div class="recent-games">
				<h4>Recent Games {difficulty ? `(${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})` : ''}</h4>
				<div class="games-list">
					{#each getFilteredScores().slice(0, 10) as game, index}
						<div class="game-item" class:success={game.success} class:failure={!game.success}>
							<div class="game-info">
								<span class="game-difficulty">{game.difficulty.toUpperCase()}</span>
								<span class="game-result">
									{game.success ? '' : ''}
								</span>
							</div>
							<div class="game-details">
								{#if game.success}
									<span class="game-time">{formatTime(game.time)}</span>
									<span class="game-score">{game.score} pts</span>
									<span class="game-hints">
										{game.hintsUsed > 0 ? `${game.hintsUsed} hints` : 'No hints'}
									</span>
								{:else}
									<span class="game-failed">Failed</span>
								{/if}
							</div>
							<div class="game-date">
								{new Date(game.timestamp).toLocaleDateString()}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<!-- Compact stats view -->
		<div class="compact-stats">
			<div class="compact-stat">
				<Trophy size={16} />
				<span>{getTotalGamesCompleted()} wins</span>
			</div>
			<div class="compact-stat">
				<Target size={16} />
				<span>{getOverallCompletionRate()}% success</span>
			</div>
			{#if getBestOverallTime()}
				<div class="compact-stat">
					<Clock size={16} />
					<span>Best: {formatTime(getBestOverallTime()!)}</span>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.game-stats {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.stats-header {
		margin-bottom: 1.5rem;
	}

	.stats-header h3 {
		margin: 0;
		color: var(--color-theme-1);
		font-size: 1.25rem;
		font-weight: 600;
	}

	.overall-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
		border: 1px solid #f3f4f6;
	}

	.stat-icon {
		color: var(--color-theme-1);
		opacity: 0.8;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: bold;
		color: var(--color-theme-1);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	.stat-subtitle {
		font-size: 0.7rem;
		color: #9ca3af;
		margin-top: 0.125rem;
	}

	.difficulty-breakdown {
		margin-bottom: 2rem;
	}

	.difficulty-breakdown h4 {
		margin: 0 0 1rem 0;
		color: var(--color-theme-1);
		font-size: 1rem;
		font-weight: 600;
	}

	.difficulty-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.difficulty-card {
		background: #f9fafb;
		border-radius: 0.5rem;
		padding: 1rem;
		border: 1px solid #f3f4f6;
	}

	.difficulty-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.difficulty-header h5 {
		margin: 0;
		color: var(--color-theme-1);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.completion-rate {
		font-size: 0.8rem;
		color: #6b7280;
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}

	.difficulty-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
	}

	.detail-row span:first-child {
		color: #6b7280;
	}

	.detail-row span:last-child {
		font-weight: 500;
		color: var(--color-theme-1);
	}

	.recent-games h4 {
		margin: 0 0 1rem 0;
		color: var(--color-theme-1);
		font-size: 1rem;
		font-weight: 600;
	}

	.games-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
	}

	.game-item {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 1rem;
		align-items: center;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid #f3f4f6;
		font-size: 0.85rem;
	}

	.game-item.success {
		background: #f0fdf4;
		border-color: #bbf7d0;
	}

	.game-item.failure {
		background: #fef2f2;
		border-color: #fecaca;
	}

	.game-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.game-difficulty {
		font-weight: bold;
		font-size: 0.7rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		background: var(--color-theme-1);
		color: white;
	}

	.game-result {
		font-weight: bold;
		font-size: 1rem;
	}

	.game-item.success .game-result {
		color: #16a34a;
	}

	.game-item.failure .game-result {
		color: #dc2626;
	}

	.game-details {
		display: flex;
		gap: 0.75rem;
		color: #6b7280;
	}

	.game-details span {
		white-space: nowrap;
	}

	.game-date {
		color: #9ca3af;
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.compact-stats {
		display: flex;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.compact-stat {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		color: #6b7280;
		font-size: 0.85rem;
	}

	.compact-stat :global(svg) {
		color: var(--color-theme-1);
	}

	@media (max-width: 640px) {
		.game-stats {
			padding: 1rem;
		}

		.overall-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.difficulty-stats {
			grid-template-columns: 1fr;
		}

		.game-item {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.game-info {
			justify-content: space-between;
		}

		.game-details {
			justify-content: flex-start;
		}

		.game-date {
			text-align: right;
		}

		.compact-stats {
			justify-content: center;
		}
	}
</style>