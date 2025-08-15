import { json } from '@sveltejs/kit';
import { validateGameResult, addToLeaderboard } from '$lib/utils/scoreUtils.js';

// In-memory storage for demo purposes
// In production, this would be replaced with a proper database
let globalLeaderboard = [];
let scoreHistory = [];

// Simulated database operations
const db = {
	async getLeaderboard(difficulty = null, limit = 100) {
		let results = [...globalLeaderboard];
		
		if (difficulty) {
			results = results.filter(entry => entry.difficulty === difficulty);
		}
		
		// Sort by score (descending), then by time (ascending) for ties
		results.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			return (a.time || Infinity) - (b.time || Infinity);
		});
		
		return results.slice(0, limit);
	},
	
	async addScore(scoreData) {
		const entry = {
			id: Date.now() + Math.random().toString(36).substr(2, 9),
			...scoreData,
			timestamp: Date.now(),
			ip: 'hidden' // In production, you might want to track this for abuse prevention
		};
		
		scoreHistory.push(entry);
		
		// Only add successful games to leaderboard
		if (entry.success) {
			globalLeaderboard = addToLeaderboard(entry, globalLeaderboard, 1000);
		}
		
		return entry;
	},
	
	async getStats() {
		const totalGames = scoreHistory.length;
		const successfulGames = scoreHistory.filter(game => game.success);
		const byDifficulty = {
			easy: scoreHistory.filter(game => game.difficulty === 'easy'),
			medium: scoreHistory.filter(game => game.difficulty === 'medium'),
			hard: scoreHistory.filter(game => game.difficulty === 'hard')
		};
		
		return {
			totalGames,
			successfulGames: successfulGames.length,
			completionRate: totalGames > 0 ? (successfulGames.length / totalGames) * 100 : 0,
			difficultyBreakdown: {
				easy: {
					total: byDifficulty.easy.length,
					successful: byDifficulty.easy.filter(g => g.success).length
				},
				medium: {
					total: byDifficulty.medium.length,
					successful: byDifficulty.medium.filter(g => g.success).length
				},
				hard: {
					total: byDifficulty.hard.length,
					successful: byDifficulty.hard.filter(g => g.success).length
				}
			},
			averageScore: successfulGames.length > 0 
				? Math.round(successfulGames.reduce((sum, game) => sum + game.score, 0) / successfulGames.length)
				: 0,
			topScore: successfulGames.length > 0 
				? Math.max(...successfulGames.map(game => game.score))
				: 0
		};
	}
};

// GET /api/scores
// Fetch leaderboard and statistics
export async function GET({ url }) {
	try {
		const difficulty = url.searchParams.get('difficulty');
		const limit = parseInt(url.searchParams.get('limit') || '100');
		const includeStats = url.searchParams.get('stats') === 'true';
		
		const leaderboard = await db.getLeaderboard(difficulty, limit);
		const response = { leaderboard };
		
		if (includeStats) {
			response.stats = await db.getStats();
		}
		
		return json(response);
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		return json(
			{ error: 'Failed to fetch leaderboard' },
			{ status: 500 }
		);
	}
}

// POST /api/scores
// Submit a new score
export async function POST({ request }) {
	try {
		const scoreData = await request.json();
		
		// Validate the submitted data
		const validation = validateGameResult(scoreData);
		if (!validation.isValid) {
			return json(
				{ error: 'Invalid score data', details: validation.errors },
				{ status: 400 }
			);
		}
		
		// Additional server-side validation
		if (!scoreData.playerName || scoreData.playerName.trim().length === 0) {
			scoreData.playerName = 'Anonymous';
		} else {
			// Sanitize player name
			scoreData.playerName = scoreData.playerName.trim().slice(0, 50);
		}
		
		// Basic anti-cheat checks
		const suspiciousActivity = detectSuspiciousActivity(scoreData);
		if (suspiciousActivity.isSuspicious) {
			console.warn('Suspicious score submission:', suspiciousActivity.reasons);
			// In production, you might want to flag or reject suspicious scores
		}
		
		// Add the score to the database
		const savedScore = await db.addScore(scoreData);
		
		// Get updated leaderboard
		const leaderboard = await db.getLeaderboard(scoreData.difficulty, 100);
		
		// Find the rank of the submitted score
		const rank = leaderboard.findIndex(entry => entry.id === savedScore.id) + 1;
		
		return json({
			success: true,
			score: savedScore,
			rank: rank > 0 ? rank : null,
			leaderboard,
			message: rank > 0 && rank <= 10 ? 'Congratulations! You made it to the top 10!' : 'Score submitted successfully!'
		});
		
	} catch (error) {
		console.error('Error submitting score:', error);
		return json(
			{ error: 'Failed to submit score' },
			{ status: 500 }
		);
	}
}

// PUT /api/scores/:id
// Update a score (for corrections, etc.)
export async function PUT({ params, request }) {
	try {
		const { id } = params;
		const updates = await request.json();
		
		// In a real database, you would update the score here
		// For this demo, we'll just return an error
		return json(
			{ error: 'Score updates not supported in demo mode' },
			{ status: 501 }
		);
		
	} catch (error) {
		console.error('Error updating score:', error);
		return json(
			{ error: 'Failed to update score' },
			{ status: 500 }
		);
	}
}

// DELETE /api/scores/:id
// Delete a score (admin function)
export async function DELETE({ params }) {
	try {
		const { id } = params;
		
		// In a real database, you would delete the score here
		// For this demo, we'll just return an error
		return json(
			{ error: 'Score deletion not supported in demo mode' },
			{ status: 501 }
		);
		
	} catch (error) {
		console.error('Error deleting score:', error);
		return json(
			{ error: 'Failed to delete score' },
			{ status: 500 }
		);
	}
}

// Helper function to detect suspicious activity
function detectSuspiciousActivity(scoreData) {
	const reasons = [];
	let isSuspicious = false;
	
	// Check for unreasonably high scores
	const maxReasonableScore = {
		easy: 3000,
		medium: 4500,
		hard: 6000
	};
	
	if (scoreData.score > maxReasonableScore[scoreData.difficulty]) {
		reasons.push('Score too high for difficulty');
		isSuspicious = true;
	}
	
	// Check for unreasonably fast completion times
	const minReasonableTime = {
		easy: 5000,   // 5 seconds
		medium: 8000, // 8 seconds
		hard: 12000   // 12 seconds
	};
	
	if (scoreData.success && scoreData.time < minReasonableTime[scoreData.difficulty]) {
		reasons.push('Completion time too fast');
		isSuspicious = true;
	}
	
	// Check for impossible score/time combinations
	if (scoreData.success && scoreData.hintsUsed === 0 && scoreData.time < 10000 && scoreData.score > 2000) {
		reasons.push('Perfect game with impossible time/score combination');
		isSuspicious = true;
	}
	
	// Check for negative values (should be caught by validation, but double-check)
	if (scoreData.time < 0 || scoreData.score < 0 || scoreData.hintsUsed < 0) {
		reasons.push('Negative values detected');
		isSuspicious = true;
	}
	
	return { isSuspicious, reasons };
}

// Initialize with some sample data for demonstration
if (globalLeaderboard.length === 0) {
	const sampleScores = [
		{ playerName: 'Alice', difficulty: 'easy', score: 1500, time: 25000, hintsUsed: 0, success: true },
		{ playerName: 'Bob', difficulty: 'easy', score: 1200, time: 35000, hintsUsed: 1, success: true },
		{ playerName: 'Charlie', difficulty: 'medium', score: 2100, time: 40000, hintsUsed: 0, success: true },
		{ playerName: 'Diana', difficulty: 'medium', score: 1800, time: 45000, hintsUsed: 2, success: true },
		{ playerName: 'Eve', difficulty: 'hard', score: 2800, time: 55000, hintsUsed: 1, success: true },
		{ playerName: 'Frank', difficulty: 'hard', score: 2400, time: 60000, hintsUsed: 3, success: true },
		{ playerName: 'Grace', difficulty: 'easy', score: 1350, time: 28000, hintsUsed: 1, success: true },
		{ playerName: 'Henry', difficulty: 'medium', score: 1950, time: 42000, hintsUsed: 1, success: true },
		{ playerName: 'Iris', difficulty: 'hard', score: 2650, time: 58000, hintsUsed: 2, success: true },
		{ playerName: 'Jack', difficulty: 'easy', score: 1100, time: 38000, hintsUsed: 2, success: true }
	];
	
	sampleScores.forEach(score => {
		const entry = {
			id: Date.now() + Math.random().toString(36).substr(2, 9),
			...score,
			timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
			ip: 'demo'
		};
		
		scoreHistory.push(entry);
		globalLeaderboard = addToLeaderboard(entry, globalLeaderboard, 1000);
	});
}