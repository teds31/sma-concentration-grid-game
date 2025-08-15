import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Types for our game data
const createInitialGameState = () => ({
	stats: {
		gamesPlayed: { easy: 0, medium: 0, hard: 0 },
		gamesCompleted: { easy: 0, medium: 0, hard: 0 },
		totalPlayTime: 0,
		averageScore: { easy: 0, medium: 0, hard: 0 }
	},
	bestTimes: {
		easy: null,
		medium: null,
		hard: null
	},
	recentScores: [], // Array of score objects
	currentGame: null,
	globalLeaderboard: []
});

// Load initial state from localStorage
function loadGameState() {
	if (!browser) return createInitialGameState();
	
	try {
		const saved = localStorage.getItem('concentration-game-state');
		if (saved) {
			const parsed = JSON.parse(saved);
			// Merge with default state to handle any missing properties
			return { ...createInitialGameState(), ...parsed };
		}
	} catch (error) {
		console.warn('Failed to load game state from localStorage:', error);
	}
	
	return createInitialGameState();
}

// Create the writable store
const gameState = writable(loadGameState());

// Helper function to save state to localStorage
function saveState(state) {
	if (!browser) return;
	
	try {
		localStorage.setItem('concentration-game-state', JSON.stringify(state));
	} catch (error) {
		console.warn('Failed to save game state to localStorage:', error);
	}
}

// Create the game store with methods
function createGameStore() {
	const { subscribe, set, update } = gameState;

	return {
		subscribe,
		
		// Start a new game
		startGame: (difficulty) => {
			update(state => {
				const newState = {
					...state,
					currentGame: {
						difficulty,
						startTime: Date.now(),
						hints: 0,
						completed: false
					}
				};
				
				// Update games played counter
				newState.stats.gamesPlayed[difficulty]++;
				
				saveState(newState);
				return newState;
			});
		},

		// Complete a game with results
		completeGame: (gameResult) => {
			update(state => {
				const { difficulty, time, hintsUsed, score, success } = gameResult;
				
				const newState = { ...state };
				
				// Update completion stats if successful
				if (success) {
					newState.stats.gamesCompleted[difficulty]++;
					
					// Update best time if this is better
					const currentBest = newState.bestTimes[difficulty];
					if (!currentBest || time < currentBest) {
						newState.bestTimes[difficulty] = time;
					}
				}
				
				// Add to recent scores
				const scoreEntry = {
					difficulty,
					time,
					score,
					hintsUsed,
					success,
					timestamp: Date.now()
				};
				
				newState.recentScores.unshift(scoreEntry);
				
				// Keep only last 100 scores
				if (newState.recentScores.length > 100) {
					newState.recentScores = newState.recentScores.slice(0, 100);
				}
				
				// Update total play time
				newState.stats.totalPlayTime += time;
				
				// Clear current game
				newState.currentGame = null;
				
				saveState(newState);
				return newState;
			});
		},

		// Submit score to global leaderboard
		submitScore: async (scoreData) => {
			try {
				const response = await fetch('/api/scores', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(scoreData)
				});
				
				if (response.ok) {
					const result = await response.json();
					
					// Update local leaderboard
					update(state => {
						const newState = { ...state };
						newState.globalLeaderboard = result.leaderboard || [];
						saveState(newState);
						return newState;
					});
					
					return result;
				} else {
					throw new Error('Failed to submit score');
				}
			} catch (error) {
				console.error('Error submitting score:', error);
				throw error;
			}
		},

		// Fetch latest leaderboard
		fetchLeaderboard: async () => {
			try {
				const response = await fetch('/api/scores');
				
				if (response.ok) {
					const data = await response.json();
					
					update(state => {
						const newState = { ...state };
						newState.globalLeaderboard = data.leaderboard || [];
						saveState(newState);
						return newState;
					});
					
					return data.leaderboard;
				} else {
					throw new Error('Failed to fetch leaderboard');
				}
			} catch (error) {
				console.error('Error fetching leaderboard:', error);
				throw error;
			}
		},

		// Reset all game data
		resetAllData: () => {
			const newState = createInitialGameState();
			set(newState);
			saveState(newState);
		},

		// Reset stats only, keep recent scores
		resetStats: () => {
			update(state => {
				const newState = {
					...state,
					stats: createInitialGameState().stats,
					bestTimes: createInitialGameState().bestTimes
				};
				saveState(newState);
				return newState;
			});
		},

		// Get statistics for a specific difficulty
		getDifficultyStats: (difficulty) => {
			let stats = null;
			
			gameState.subscribe(state => {
				const played = state.stats.gamesPlayed[difficulty] || 0;
				const completed = state.stats.gamesCompleted[difficulty] || 0;
				const bestTime = state.bestTimes[difficulty];
				
				// Calculate average score for this difficulty
				const difficultyScores = state.recentScores
					.filter(score => score.difficulty === difficulty && score.success)
					.map(score => score.score);
				
				const averageScore = difficultyScores.length > 0
					? Math.round(difficultyScores.reduce((sum, score) => sum + score, 0) / difficultyScores.length)
					: 0;
				
				stats = {
					played,
					completed,
					bestTime,
					averageScore,
					completionRate: played > 0 ? Math.round((completed / played) * 100) : 0
				};
			})();
			
			return stats;
		},

		// Get recent scores with optional filtering
		getRecentScores: (difficulty = null, limit = 10) => {
			let scores = [];
			
			gameState.subscribe(state => {
				scores = difficulty 
					? state.recentScores.filter(score => score.difficulty === difficulty)
					: state.recentScores;
				
				scores = scores.slice(0, limit);
			})();
			
			return scores;
		},

		// Get user's ranking for a specific score
		getUserRanking: (score, difficulty) => {
			let ranking = null;
			
			gameState.subscribe(state => {
				const difficultyScores = state.globalLeaderboard
					.filter(entry => entry.difficulty === difficulty)
					.map(entry => entry.score)
					.sort((a, b) => b - a);
				
				if (difficultyScores.length === 0) {
					ranking = { rank: 1, total: 1 };
				} else {
					const rank = difficultyScores.findIndex(s => s <= score) + 1;
					ranking = {
						rank: rank === 0 ? difficultyScores.length + 1 : rank,
						total: difficultyScores.length + 1
					};
				}
			})();
			
			return ranking;
		}
	};
}

export const gameStore = createGameStore();