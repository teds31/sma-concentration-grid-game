// Utility functions for score calculation and management

/**
 * Calculate the score for a completed game
 * @param {number} completionTime - Time taken to complete the game in milliseconds
 * @param {number} hintsUsed - Number of hints used during the game
 * @param {string} difficulty - Game difficulty ('easy', 'medium', 'hard')
 * @param {number} sequenceLength - Length of the sequence completed
 * @returns {number} The calculated score
 */
export function calculateScore(completionTime, hintsUsed, difficulty, sequenceLength) {
	// Base score starts at 1000
	let score = 1000;
	
	// Difficulty multipliers
	const difficultyMultipliers = {
		easy: 1.0,
		medium: 1.5,
		hard: 2.0
	};
	
	// Time bonus - faster completion gives more points
	// Maximum bonus of 500 points for very fast completion
	const maxTimeBonus = 500;
	const targetTime = {
		easy: 30000,   // 30 seconds
		medium: 45000, // 45 seconds
		hard: 60000    // 60 seconds
	};
	
	const timeBonus = Math.max(0, Math.min(maxTimeBonus, 
		maxTimeBonus * (1 - completionTime / (targetTime[difficulty] * 2))
	));
	
	// Sequence length bonus - longer sequences worth more
	const sequenceBonus = sequenceLength * 25;
	
	// Hint penalty - each hint reduces score
	const hintPenalty = hintsUsed * 100;
	
	// Perfect game bonus - no hints used
	const perfectBonus = hintsUsed === 0 ? 200 : 0;
	
	// Calculate final score
	score = (score + timeBonus + sequenceBonus + perfectBonus - hintPenalty) * difficultyMultipliers[difficulty];
	
	// Ensure minimum score of 100
	return Math.max(100, Math.round(score));
}

/**
 * Calculate grade/rating based on score and difficulty
 * @param {number} score - The player's score
 * @param {string} difficulty - Game difficulty
 * @returns {object} Grade information with letter, color, and description
 */
export function calculateGrade(score, difficulty) {
	// Adjust thresholds based on difficulty
	const baseThresholds = {
		'S': 2000,  // Exceptional
		'A+': 1800, // Excellent
		'A': 1600,  // Very Good
		'A-': 1400, // Good
		'B+': 1200, // Above Average
		'B': 1000,  // Average
		'B-': 800,  // Below Average
		'C+': 600,  // Poor
		'C': 400,   // Very Poor
		'C-': 200,  // Minimal
		'F': 0      // Fail
	};
	
	// Adjust for difficulty
	const difficultyAdjustment = {
		easy: 0.8,
		medium: 1.0,
		hard: 1.2
	};
	
	const adjustment = difficultyAdjustment[difficulty] || 1.0;
	
	for (const [grade, threshold] of Object.entries(baseThresholds)) {
		if (score >= threshold * adjustment) {
			return {
				letter: grade,
				color: getGradeColor(grade),
				description: getGradeDescription(grade),
				threshold: threshold * adjustment
			};
		}
	}
	
	return {
		letter: 'F',
		color: '#ef4444',
		description: 'Better luck next time!',
		threshold: 0
	};
}

/**
 * Get color associated with a grade
 * @param {string} grade - The grade letter
 * @returns {string} CSS color value
 */
function getGradeColor(grade) {
	const colors = {
		'S': '#ffd700',   // Gold
		'A+': '#22c55e', // Green
		'A': '#16a34a',   // Dark Green
		'A-': '#65a30d',  // Olive Green
		'B+': '#eab308',  // Yellow
		'B': '#f59e0b',   // Orange
		'B-': '#ea580c',  // Dark Orange
		'C+': '#dc2626',  // Red
		'C': '#b91c1c',   // Dark Red
		'C-': '#991b1b',  // Darker Red
		'F': '#7f1d1d'    // Very Dark Red
	};
	
	return colors[grade] || '#6b7280';
}

/**
 * Get description for a grade
 * @param {string} grade - The grade letter
 * @returns {string} Grade description
 */
function getGradeDescription(grade) {
	const descriptions = {
		'S': 'Perfect! Outstanding performance!',
		'A+': 'Excellent work!',
		'A': 'Very well done!',
		'A-': 'Good job!',
		'B+': 'Nice work!',
		'B': 'Solid performance!',
		'B-': 'Keep practicing!',
		'C+': 'Room for improvement',
		'C': 'Try again for better results',
		'C-': 'Keep working at it',
		'F': 'Better luck next time!'
	};
	
	return descriptions[grade] || 'Keep trying!';
}

/**
 * Format time in a readable format
 * @param {number} milliseconds - Time in milliseconds
 * @param {boolean} includeMs - Whether to include milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(milliseconds, includeMs = false) {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	const ms = Math.floor((milliseconds % 1000) / 10);
	
	if (minutes > 0) {
		if (includeMs) {
			return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
	
	if (includeMs) {
		return `${remainingSeconds}.${ms.toString().padStart(2, '0')}s`;
	}
	
	return `${remainingSeconds}s`;
}

/**
 * Calculate statistics from an array of game results
 * @param {Array} games - Array of game result objects
 * @returns {object} Calculated statistics
 */
export function calculateStats(games) {
	if (!games || games.length === 0) {
		return {
			totalGames: 0,
			completedGames: 0,
			completionRate: 0,
			averageScore: 0,
			bestScore: 0,
			averageTime: 0,
			bestTime: null,
			totalPlayTime: 0,
			hintsUsed: 0,
			perfectGames: 0
		};
	}
	
	const completedGames = games.filter(game => game.success);
	const totalTime = games.reduce((sum, game) => sum + (game.time || 0), 0);
	const totalScore = completedGames.reduce((sum, game) => sum + (game.score || 0), 0);
	const totalHints = games.reduce((sum, game) => sum + (game.hintsUsed || 0), 0);
	const perfectGames = completedGames.filter(game => game.hintsUsed === 0).length;
	
	const bestTime = completedGames.length > 0 
		? Math.min(...completedGames.map(game => game.time)) 
		: null;
	
	const bestScore = completedGames.length > 0 
		? Math.max(...completedGames.map(game => game.score)) 
		: 0;
	
	return {
		totalGames: games.length,
		completedGames: completedGames.length,
		completionRate: games.length > 0 ? (completedGames.length / games.length) * 100 : 0,
		averageScore: completedGames.length > 0 ? totalScore / completedGames.length : 0,
		bestScore,
		averageTime: completedGames.length > 0 ? totalTime / completedGames.length : 0,
		bestTime,
		totalPlayTime: totalTime,
		hintsUsed: totalHints,
		perfectGames
	};
}

/**
 * Determine if a score qualifies for the leaderboard
 * @param {number} score - The score to check
 * @param {Array} leaderboard - Current leaderboard entries
 * @param {number} maxEntries - Maximum entries allowed on leaderboard
 * @returns {boolean} Whether the score qualifies
 */
export function qualifiesForLeaderboard(score, leaderboard = [], maxEntries = 100) {
	if (leaderboard.length < maxEntries) {
		return true;
	}
	
	const lowestScore = Math.min(...leaderboard.map(entry => entry.score));
	return score > lowestScore;
}

/**
 * Add a score to the leaderboard and maintain order
 * @param {object} scoreEntry - New score entry to add
 * @param {Array} leaderboard - Current leaderboard
 * @param {number} maxEntries - Maximum entries to keep
 * @returns {Array} Updated leaderboard
 */
export function addToLeaderboard(scoreEntry, leaderboard = [], maxEntries = 100) {
	const newLeaderboard = [...leaderboard, scoreEntry];
	
	// Sort by score (descending), then by time (ascending) for ties
	newLeaderboard.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		return (a.time || Infinity) - (b.time || Infinity);
	});
	
	// Limit to max entries
	return newLeaderboard.slice(0, maxEntries);
}

/**
 * Generate a shareable summary of a game result
 * @param {object} gameResult - The game result object
 * @returns {string} Shareable text summary
 */
export function generateShareText(gameResult) {
	const { difficulty, score, time, hintsUsed, success } = gameResult;
	
	if (!success) {
		return `I attempted a ${difficulty} concentration game but didn't complete it. Going to try again! 🎮`;
	}
	
	const grade = calculateGrade(score, difficulty);
	const timeStr = formatTime(time);
	const hintsStr = hintsUsed === 0 ? 'no hints!' : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''}`;
	
	return `🧠 Concentration Game Result:\n` +
		   `Difficulty: ${difficulty.toUpperCase()}\n` +
		   `Score: ${score} (Grade: ${grade.letter})\n` +
		   `Time: ${timeStr}\n` +
		   `Hints used: ${hintsStr}\n` +
		   `\n${grade.description} 🎯`;
}

/**
 * Validate a game result object
 * @param {object} result - Game result to validate
 * @returns {object} Validation result with isValid and errors
 */
export function validateGameResult(result) {
	const errors = [];
	
	if (!result || typeof result !== 'object') {
		return { isValid: false, errors: ['Game result must be an object'] };
	}
	
	// Required fields
	const requiredFields = ['difficulty', 'time', 'score', 'hintsUsed', 'success'];
	for (const field of requiredFields) {
		if (!(field in result)) {
			errors.push(`Missing required field: ${field}`);
		}
	}
	
	// Validate difficulty
	if (result.difficulty && !['easy', 'medium', 'hard'].includes(result.difficulty)) {
		errors.push('Difficulty must be "easy", "medium", or "hard"');
	}
	
	// Validate numeric fields
	if (result.time !== undefined && (typeof result.time !== 'number' || result.time < 0)) {
		errors.push('Time must be a non-negative number');
	}
	
	if (result.score !== undefined && (typeof result.score !== 'number' || result.score < 0)) {
		errors.push('Score must be a non-negative number');
	}
	
	if (result.hintsUsed !== undefined && (typeof result.hintsUsed !== 'number' || result.hintsUsed < 0 || !Number.isInteger(result.hintsUsed))) {
		errors.push('Hints used must be a non-negative integer');
	}
	
	// Validate boolean fields
	if (result.success !== undefined && typeof result.success !== 'boolean') {
		errors.push('Success must be a boolean');
	}
	
	return {
		isValid: errors.length === 0,
		errors
	};
}