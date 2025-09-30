import { supabase } from '$lib/supabase.js';

export class GameDataService {
	
	// Save a game result for a user
	static async saveGameResult(gameResult) {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('User not authenticated');

			const { data, error } = await supabase
				.from('game_results')
				.insert({
					user_id: user.id,
					difficulty: gameResult.difficulty,
					score: gameResult.score,
					time_taken: gameResult.timeTaken,
					hints_used: gameResult.hintsUsed,
					completed: gameResult.completed,
					grid_size: gameResult.gridSize,
					cells_count: gameResult.cellsCount,
					created_at: new Date().toISOString()
				})
				.select()
				.single();

			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error('Error saving game result:', error);
			return { data: null, error };
		}
	}

	// Get user's game results
	static async getUserGameResults(userId, limit = 50) {
		try {
			const { data, error } = await supabase
				.from('game_results')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false })
				.limit(limit);

			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error('Error fetching user game results:', error);
			return { data: null, error };
		}
	}

	// Get user's best times by difficulty
	static async getUserBestTimes(userId) {
		try {
			const { data, error } = await supabase
				.from('game_results')
				.select('difficulty, time_taken')
				.eq('user_id', userId)
				.eq('completed', true)
				.order('time_taken', { ascending: true });

			if (error) throw error;

			// Group by difficulty and get the best time for each
			const bestTimes = data.reduce((acc, result) => {
				if (!acc[result.difficulty] || result.time_taken < acc[result.difficulty]) {
					acc[result.difficulty] = result.time_taken;
				}
				return acc;
			}, {});

			return { data: bestTimes, error: null };
		} catch (error) {
			console.error('Error fetching user best times:', error);
			return { data: null, error };
		}
	}

	// Get user's statistics
	static async getUserStats(userId) {
		try {
			const { data, error } = await supabase
				.from('game_results')
				.select('difficulty, completed, score')
				.eq('user_id', userId);

			if (error) throw error;

			// Calculate statistics
			const stats = {
				gamesPlayed: { easy: 0, medium: 0, hard: 0 },
				gamesCompleted: { easy: 0, medium: 0, hard: 0 },
				averageScore: { easy: 0, medium: 0, hard: 0 },
				totalGames: data.length,
				totalCompleted: data.filter(game => game.completed).length
			};

			data.forEach(game => {
				stats.gamesPlayed[game.difficulty]++;
				if (game.completed) {
					stats.gamesCompleted[game.difficulty]++;
				}
			});

			// Calculate average scores
			['easy', 'medium', 'hard'].forEach(difficulty => {
				const completedGames = data.filter(game => 
					game.difficulty === difficulty && game.completed
				);
				if (completedGames.length > 0) {
					const totalScore = completedGames.reduce((sum, game) => sum + game.score, 0);
					stats.averageScore[difficulty] = Math.round(totalScore / completedGames.length);
				}
			});

			return { data: stats, error: null };
		} catch (error) {
			console.error('Error fetching user stats:', error);
			return { data: null, error };
		}
	}

	// Get global leaderboard for authenticated users
	static async getGlobalLeaderboard(difficulty = null, limit = 100) {
		try {
			let query = supabase
				.from('game_results')
				.select(`
					*,
					profiles(display_name, avatar_url)
				`)
				.eq('completed', true)
				.order('score', { ascending: false })
				.limit(limit);

			if (difficulty) {
				query = query.eq('difficulty', difficulty);
			}

			const { data, error } = await query;

			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error('Error fetching global leaderboard:', error);
			return { data: null, error };
		}
	}

	// Initialize user profile
	static async initializeUserProfile(user) {
		try {
			const { data, error } = await supabase
				.from('profiles')
				.upsert({
					id: user.id,
					email: user.email,
					display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
					avatar_url: user.user_metadata?.avatar_url || null,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				}, {
					onConflict: 'id'
				})
				.select()
				.single();

			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error('Error initializing user profile:', error);
			return { data: null, error };
		}
	}
}