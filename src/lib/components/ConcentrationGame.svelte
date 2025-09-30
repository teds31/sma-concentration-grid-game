<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { writable, get } from 'svelte/store';
	import { gameStore } from '../stores/gameStore.js';
	import { settingsStore } from '../stores/settingsStore.js';
	import { authStore } from '../stores/authStore.js';
	import { GameDataService } from '../services/gameDataService.js';
	import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-svelte';

	export let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

	let gameState = writable('setup'); // 'setup', 'memorize', 'play', 'complete'
	let timeLeft = writable(0);
	let startTime = 0;
	let timerInterval: number;
	let gameBoard: number[][] = [];
	let playerBoard: boolean[][] = [];
	let targetSequence: { row: number; col: number }[] = [];
	let playerSequence: { row: number; col: number }[] = [];
	let showingTarget = false;
	let distractionCells: Set<string> = new Set();
	let hintsUsed = 0;
	let maxHints = 0;

	// Game configuration
	const config = {
		easy: { size: 4, sequence: 4, memorizeTime: 3000, distractions: 0 },
		medium: { size: 5, sequence: 6, memorizeTime: 4000, distractions: 2 },
		hard: { size: 6, sequence: 8, memorizeTime: 5000, distractions: 4 }
	};

	$: currentConfig = config[difficulty];
	$: maxHints = Math.floor(currentConfig.sequence / 2);

	onMount(() => {
		initializeGame();
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function initializeGame() {
		const size = currentConfig.size;
		
		// Initialize game board with random numbers
		gameBoard = Array(size).fill(null).map(() => 
			Array(size).fill(null).map(() => Math.floor(Math.random() * 9) + 1)
		);
		
		// Initialize player board (all false)
		playerBoard = Array(size).fill(null).map(() => Array(size).fill(false));
		
		// Generate target sequence
		targetSequence = [];
		const usedPositions = new Set<string>();
		
		for (let i = 0; i < currentConfig.sequence; i++) {
			let row, col, posKey;
			do {
				row = Math.floor(Math.random() * size);
				col = Math.floor(Math.random() * size);
				posKey = `${row}-${col}`;
			} while (usedPositions.has(posKey));
			
			usedPositions.add(posKey);
			targetSequence.push({ row, col });
		}
		
		// Generate distraction cells for medium/hard
		distractionCells.clear();
		if (currentConfig.distractions > 0) {
			for (let i = 0; i < currentConfig.distractions; i++) {
				let row, col, posKey;
				do {
					row = Math.floor(Math.random() * size);
					col = Math.floor(Math.random() * size);
					posKey = `${row}-${col}`;
				} while (usedPositions.has(posKey) || distractionCells.has(posKey));
				
				distractionCells.add(posKey);
			}
		}
		
		playerSequence = [];
		hintsUsed = 0;
		gameState.set('setup');
	}

	function startGame() {
		gameState.set('memorize');
		showingTarget = true;
		timeLeft.set(currentConfig.memorizeTime);
		startTime = Date.now();
		
		// Start memorization timer
		timerInterval = setInterval(() => {
			timeLeft.update(t => t - 100);
			if (get(timeLeft) <= 0) {
				clearInterval(timerInterval);
				startPlayPhase();
			}
		}, 100);
		
		// Show distractions during memorization for harder difficulties
		if (currentConfig.distractions > 0) {
			setTimeout(() => {
				showDistractionsTemporarily();
			}, currentConfig.memorizeTime / 2);
		}
	}

	function showDistractionsTemporarily() {
		// Flash distraction cells briefly during memorization
		setTimeout(() => {
			// This creates a visual distraction by briefly changing numbers
			distractionCells.forEach(cellKey => {
				const [row, col] = cellKey.split('-').map(Number);
				const originalValue = gameBoard[row][col];
				gameBoard[row][col] = Math.floor(Math.random() * 9) + 1;
				
				setTimeout(() => {
					gameBoard[row][col] = originalValue;
				}, 300);
			});
		}, 100);
	}

	function startPlayPhase() {
		gameState.set('play');
		showingTarget = false;
		timeLeft.set(60000); // 60 seconds to complete
		
		timerInterval = setInterval(() => {
			timeLeft.update(t => t - 100);
			if (get(timeLeft) <= 0) {
				clearInterval(timerInterval);
				endGame(false);
			}
		}, 100);
	}

	function handleCellClick(row: number, col: number) {
		if (get(gameState) !== 'play') return;
		
		const clickIndex = playerSequence.length;
		const expectedCell = targetSequence[clickIndex];
		
		if (row === expectedCell.row && col === expectedCell.col) {
			// Correct cell clicked
			playerSequence.push({ row, col });
			playerBoard[row][col] = true;
			
			// Play success sound if enabled
			if (get(settingsStore).soundEnabled) {
				playSound('success');
			}
			
			// Check if sequence is complete
			if (playerSequence.length === targetSequence.length) {
				endGame(true);
			}
		} else {
			// Wrong cell clicked - game over
			endGame(false);
		}
	}

	function useHint() {
		if (hintsUsed >= maxHints || get(gameState) !== 'play') return;
		
		const nextIndex = playerSequence.length;
		if (nextIndex < targetSequence.length) {
			const hintCell = targetSequence[nextIndex];
			
			// Briefly highlight the correct cell
			const cellElement = document.querySelector(`[data-cell="${hintCell.row}-${hintCell.col}"]`);
			if (cellElement) {
				cellElement.classList.add('hint-flash');
				setTimeout(() => {
					cellElement.classList.remove('hint-flash');
				}, 1000);
			}
			
			hintsUsed++;
		}
	}

	async function endGame(success: boolean) {
		clearInterval(timerInterval);
		gameState.set('complete');
		
		if (success) {
			const completionTime = Date.now() - startTime;
			const score = calculateScore(completionTime, hintsUsed);
			
			const gameResult = {
				difficulty,
				time: completionTime,
				hintsUsed,
				score,
				success: true
			};
			
			// Update game store with results
			gameStore.completeGame(gameResult);
			
			// Save to Supabase if user is authenticated
			const user = get(authStore).user;
			if (user) {
				try {
					const gameDataService = new GameDataService();
					await gameDataService.saveGameResult({
						difficulty,
						score,
						time_seconds: Math.round(completionTime / 1000),
						hints_used: hintsUsed,
						completed: true
					});
				} catch (error) {
					console.error('Failed to save game result:', error);
				}
			}
			
			// Play completion sound
			if (get(settingsStore).soundEnabled) {
				playSound('complete');
			}
		} else {
			// Save failed attempt if user is authenticated
			const user = get(authStore).user;
			if (user) {
				try {
					const gameDataService = new GameDataService();
					await gameDataService.saveGameResult({
						difficulty,
						score: 0,
						time_seconds: Math.round((Date.now() - startTime) / 1000),
						hints_used: hintsUsed,
						completed: false
					});
				} catch (error) {
					console.error('Failed to save game result:', error);
				}
			}
			
			// Play failure sound
			if (get(settingsStore).soundEnabled) {
				playSound('failure');
			}
		}
	}

	function calculateScore(time: number, hints: number): number {
		const baseScore = 1000;
		const timeBonus = Math.max(0, 60000 - time) / 100;
		const hintPenalty = hints * 50;
		const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
		
		return Math.round((baseScore + timeBonus - hintPenalty) * difficultyMultiplier);
	}

	function playSound(type: 'success' | 'failure' | 'complete') {
		// Simple audio feedback using Web Audio API
		if (typeof window === 'undefined') return;
		
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		
		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);
		
		switch (type) {
			case 'success':
				oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
				oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
				break;
			case 'failure':
				oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
				oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
				break;
			case 'complete':
				oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
				oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
				oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
				break;
		}
		
		gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
		
		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + 0.3);
	}

	function resetGame() {
		if (timerInterval) clearInterval(timerInterval);
		initializeGame();
	}

	function formatTime(ms: number): string {
		const seconds = Math.ceil(ms / 1000);
		return `${seconds}s`;
	}

	function getCellClass(row: number, col: number): string {
		const isTarget = showingTarget && targetSequence.some(cell => cell.row === row && cell.col === col);
		const isSelected = playerBoard[row][col];
		const isDistraction = distractionCells.has(`${row}-${col}`);
		
		let classes = 'game-cell';
		if (isTarget) classes += ' target-cell';
		if (isSelected) classes += ' selected-cell';
		if (isDistraction && get(gameState) === 'memorize') classes += ' distraction-cell';
		
		return classes;
	}
</script>

<div class="concentration-game">
	<div class="game-header">
		<div class="game-info">
			<h2>Concentration Game - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
			<div class="game-stats">
				{#if $gameState === 'memorize'}
					<span class="timer memorize">Memorize: {formatTime($timeLeft)}</span>
				{:else if $gameState === 'play'}
					<span class="timer play">Time: {formatTime($timeLeft)}</span>
				{/if}
				<span class="sequence-progress">Progress: {playerSequence.length}/{targetSequence.length}</span>
				{#if $gameState === 'play'}
					<span class="hints">Hints: {hintsUsed}/{maxHints}</span>
				{/if}
			</div>
		</div>
		
		<div class="game-controls">
			{#if $gameState === 'setup'}
				<button class="control-btn start" on:click={startGame}>
					<Play size={20} />
					Start Game
				</button>
			{:else if $gameState === 'play'}
				<button 
					class="control-btn hint" 
					on:click={useHint}
					disabled={hintsUsed >= maxHints}
				>
					<Eye size={20} />
					Hint ({maxHints - hintsUsed})
				</button>
			{/if}
			
			<button class="control-btn reset" on:click={resetGame}>
				<RotateCcw size={20} />
				Reset
			</button>
		</div>
	</div>

	{#if $gameState === 'setup'}
		<div class="game-instructions">
			<h3>How to Play:</h3>
			<ol>
				<li>Watch carefully as the target sequence is highlighted</li>
				<li>Memorize the sequence of numbers and their positions</li>
				<li>Click the cells in the exact same order</li>
				<li>Complete the sequence before time runs out!</li>
			</ol>
			<div class="difficulty-info">
				<strong>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level:</strong>
				<span>Grid: {currentConfig.size}×{currentConfig.size}</span>
				<span>Sequence: {currentConfig.sequence} cells</span>
				<span>Memorize time: {currentConfig.memorizeTime / 1000}s</span>
				{#if currentConfig.distractions > 0}
					<span>Distractions: {currentConfig.distractions}</span>
				{/if}
			</div>
		</div>
	{/if}

	<div class="game-board" style="grid-template-columns: repeat({currentConfig.size}, 1fr);">
		{#each gameBoard as row, rowIndex}
			{#each row as cellValue, colIndex}
				<button
					class={getCellClass(rowIndex, colIndex)}
					data-cell="{rowIndex}-{colIndex}"
					on:click={() => handleCellClick(rowIndex, colIndex)}
					disabled={$gameState !== 'play'}
				>
					{cellValue}
				</button>
			{/each}
		{/each}
	</div>

	{#if $gameState === 'complete'}
		<div class="game-results">
			{#if playerSequence.length === targetSequence.length}
				<div class="success-message">
					<h3>🎉 Congratulations! 🎉</h3>
					<p>You completed the sequence successfully!</p>
					<div class="final-stats">
						<span>Time: {Math.round((Date.now() - startTime) / 1000)}s</span>
						<span>Hints used: {hintsUsed}/{maxHints}</span>
						<span>Score: {calculateScore(Date.now() - startTime, hintsUsed)}</span>
					</div>
				</div>
			{:else}
				<div class="failure-message">
					<h3>Game Over</h3>
					<p>Wrong sequence or time ran out. Try again!</p>
					<div class="correct-sequence">
						<strong>Correct sequence was:</strong>
						<div class="sequence-display">
							{#each targetSequence as cell, index}
								<span class="sequence-item">
									{index + 1}: {gameBoard[cell.row][cell.col]} (Row {cell.row + 1}, Col {cell.col + 1})
								</span>
							{/each}
						</div>
					</div>
				</div>
			{/if}
			
			<button class="control-btn start" on:click={resetGame}>
				Play Again
			</button>
		</div>
	{/if}
</div>

<style>
	.concentration-game {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
		font-family: 'Fira Mono', monospace;
	}

	.game-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.game-info h2 {
		margin: 0 0 0.5rem 0;
		color: var(--color-theme-1);
		font-size: 1.5rem;
	}

	.game-stats {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.9rem;
	}

	.timer {
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		font-weight: bold;
	}

	.timer.memorize {
		background: #fef3c7;
		color: #92400e;
	}

	.timer.play {
		background: #dbeafe;
		color: #1e40af;
	}

	.game-controls {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.control-btn.start {
		background: #10b981;
		color: white;
	}

	.control-btn.start:hover {
		background: #059669;
	}

	.control-btn.hint {
		background: #f59e0b;
		color: white;
	}

	.control-btn.hint:hover:not(:disabled) {
		background: #d97706;
	}

	.control-btn.hint:disabled {
		background: #d1d5db;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.control-btn.reset {
		background: #6b7280;
		color: white;
	}

	.control-btn.reset:hover {
		background: #4b5563;
	}

	.game-instructions {
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 0.75rem;
		margin-bottom: 2rem;
		border: 1px solid #e5e7eb;
	}

	.game-instructions h3 {
		margin: 0 0 1rem 0;
		color: var(--color-theme-1);
	}

	.game-instructions ol {
		margin: 0 0 1rem 0;
		padding-left: 1.5rem;
	}

	.game-instructions li {
		margin-bottom: 0.5rem;
	}

	.difficulty-info {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.9rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.difficulty-info strong {
		color: var(--color-theme-1);
	}

	.game-board {
		display: grid;
		gap: 0.5rem;
		margin: 2rem 0;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.game-cell {
		aspect-ratio: 1;
		border: 2px solid #e5e7eb;
		border-radius: 0.5rem;
		background: white;
		font-size: 1.25rem;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60px;
	}

	.game-cell:hover:not(:disabled) {
		border-color: var(--color-theme-1);
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.game-cell:disabled {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.game-cell.target-cell {
		background: #fbbf24 !important;
		border-color: #d97706 !important;
		border-width: 3px !important;
		animation: pulse 1s infinite;
		box-shadow: 0 0 0 2px #f59e0b, 0 0 0 4px rgba(245, 158, 11, 0.3);
		transform: scale(1.05);
	}

	.game-cell.selected-cell {
		background: #d1fae5;
		border-color: #10b981;
	}

	.game-cell.distraction-cell {
		background: #fee2e2;
		border-color: #ef4444;
		animation: shake 0.5s ease-in-out;
	}

	:global(.hint-flash) {
		background: #dbeafe !important;
		border-color: #3b82f6 !important;
		animation: hint-pulse 1s ease-in-out;
	}

	.game-results {
		text-align: center;
		padding: 2rem;
		background: #f9fafb;
		border-radius: 0.75rem;
		border: 1px solid #e5e7eb;
	}

	.success-message {
		color: #065f46;
	}

	.success-message h3 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.failure-message {
		color: #7f1d1d;
	}

	.failure-message h3 {
		margin: 0 0 1rem 0;
		font-size: 1.5rem;
	}

	.final-stats {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 1rem 0;
		flex-wrap: wrap;
	}

	.correct-sequence {
		margin: 1rem 0;
		padding: 1rem;
		background: white;
		border-radius: 0.5rem;
		border: 1px solid #d1d5db;
	}

	.sequence-display {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.sequence-item {
		font-family: 'Fira Mono', monospace;
		font-size: 0.9rem;
	}

	@keyframes pulse {
		0%, 100% { 
			opacity: 1; 
			transform: scale(1.05);
			box-shadow: 0 0 0 2px #f59e0b, 0 0 0 4px rgba(245, 158, 11, 0.3);
		}
		50% { 
			opacity: 0.8; 
			transform: scale(1.1);
			box-shadow: 0 0 0 3px #f59e0b, 0 0 0 6px rgba(245, 158, 11, 0.5);
		}
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-2px); }
		75% { transform: translateX(2px); }
	}

	@keyframes hint-pulse {
		0% { background: #dbeafe; }
		50% { background: #93c5fd; }
		100% { background: #dbeafe; }
	}

	@media (max-width: 640px) {
		.concentration-game {
			padding: 1rem;
		}

		.game-header {
			flex-direction: column;
			text-align: center;
		}

		.game-stats {
			justify-content: center;
		}

		.game-controls {
			justify-content: center;
		}

		.difficulty-info {
			justify-content: center;
		}

		.final-stats {
			flex-direction: column;
			gap: 0.5rem;
		}

		.game-cell {
			min-height: 50px;
			font-size: 1rem;
		}

		.game-cell.target-cell {
			background: #f59e0b !important;
			border-color: #d97706 !important;
			border-width: 4px !important;
			transform: scale(1.1) !important;
			box-shadow: 0 0 0 3px #f59e0b, 0 0 0 6px rgba(245, 158, 11, 0.6) !important;
			animation: mobile-pulse 0.8s infinite;
		}

		@keyframes mobile-pulse {
			0%, 100% { 
				opacity: 1; 
				transform: scale(1.1);
			}
			50% { 
				opacity: 0.7; 
				transform: scale(1.15);
			}
		}
	}
</style>