<script lang="ts">
	import { Brain, Target, Trophy, Lightbulb, Clock, Eye, Zap } from 'lucide-svelte';
</script>

<svelte:head>
	<title>About - SMA Concentration Grid</title>
</svelte:head>

<div class="about-page">
	<div class="page-header">
		<h1>🧠 About Stonewall Mind Academy</h1>
		<p>Advanced cognitive training through scientifically-designed mental exercises</p>
	</div>

	<!-- Game Overview -->
	<section class="content-section">
		<div class="section-icon">
			<Brain size={40} />
		</div>
		<h2>What is Stonewall Mind Academy?</h2>
		<p>
			Stonewall Mind Academy represents the cutting edge of cognitive enhancement training. Our 
			concentration exercises are scientifically designed to improve working memory, attention span, 
			and pattern recognition through progressive challenge methodologies. Each session presents 
			carefully calibrated mental tasks that push your cognitive boundaries.
		</p>
		<p>
			Founded on principles from cognitive neuroscience and elite performance psychology, our 
			training system incorporates adaptive difficulty, distraction resistance, and performance 
			analytics to create a comprehensive mental fitness program that delivers measurable results.
		</p>
	</section>

	<!-- How to Play -->
	<section class="content-section">
		<div class="section-icon">
			<Target size={40} />
		</div>
		<h2>How to Play</h2>
		
		<div class="steps-grid">
			<div class="step-card">
				<div class="step-number">1</div>
				<h3>Choose Your Difficulty</h3>
				<p>Select from Easy (4×4), Medium (5×5), or Hard (6×6) grid sizes, each with different sequence lengths and time limits.</p>
			</div>
			
			<div class="step-card">
				<div class="step-number">2</div>
				<h3>Study the Pattern</h3>
				<p>Watch carefully as the target sequence is highlighted. You have a limited time to memorize the order and positions.</p>
			</div>
			
			<div class="step-card">
				<div class="step-number">3</div>
				<h3>Reproduce the Sequence</h3>
				<p>Click the cells in the exact same order you saw them highlighted. Be precise - one wrong click ends the game!</p>
			</div>
			
			<div class="step-card">
				<div class="step-number">4</div>
				<h3>Beat the Clock</h3>
				<p>Complete the sequence before time runs out. Faster completion times earn higher scores!</p>
			</div>
		</div>
	</section>

	<!-- Difficulty Levels -->
	<section class="content-section">
		<div class="section-icon">
			<Trophy size={40} />
		</div>
		<h2>Difficulty Levels</h2>
		
		<div class="difficulty-cards">
			<div class="difficulty-card easy">
				<div class="difficulty-header">
					<span class="difficulty-emoji">🟢</span>
					<h3>Easy</h3>
				</div>
				<ul>
					<li>4×4 grid (16 cells)</li>
					<li>4 cells to memorize</li>
					<li>3 seconds memorization time</li>
					<li>No distractions</li>
					<li>Perfect for beginners</li>
				</ul>
			</div>
			
			<div class="difficulty-card medium">
				<div class="difficulty-header">
					<span class="difficulty-emoji">🟡</span>
					<h3>Medium</h3>
				</div>
				<ul>
					<li>5×5 grid (25 cells)</li>
					<li>6 cells to memorize</li>
					<li>4 seconds memorization time</li>
					<li>2 distraction cells</li>
					<li>Balanced challenge</li>
				</ul>
			</div>
			
			<div class="difficulty-card hard">
				<div class="difficulty-header">
					<span class="difficulty-emoji">🔴</span>
					<h3>Hard</h3>
				</div>
				<ul>
					<li>6×6 grid (36 cells)</li>
					<li>8 cells to memorize</li>
					<li>5 seconds memorization time</li>
					<li>4 distraction cells</li>
					<li>Expert level challenge</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Game Features -->
	<section class="content-section">
		<div class="section-icon">
			<Lightbulb size={40} />
		</div>
		<h2>Game Features</h2>
		
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">
					<Eye size={24} />
				</div>
				<h3>Hint System</h3>
				<p>Use limited hints to get help when you're stuck, but remember - each hint reduces your final score.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">
					<Clock size={24} />
				</div>
				<h3>Time Pressure</h3>
				<p>Race against the clock to complete sequences. Faster times earn bonus points and better rankings.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">
					<Target size={24} />
				</div>
				<h3>Distractions</h3>
				<p>Medium and Hard modes include distraction cells that briefly change during memorization to test your focus.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">
					<Trophy size={24} />
				</div>
				<h3>Global Leaderboard</h3>
				<p>Compete with players worldwide and see how your memory skills stack up against others.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">
					<Zap size={24} />
				</div>
				<h3>Performance Tracking</h3>
				<p>Track your progress with detailed statistics, best times, and success rates for each difficulty.</p>
			</div>
			
			<div class="feature-card">
				<div class="feature-icon">
					<Brain size={24} />
				</div>
				<h3>Cognitive Benefits</h3>
				<p>Regular play can help improve working memory, attention span, and pattern recognition skills.</p>
			</div>
		</div>
	</section>

	<!-- Scoring System -->
	<section class="content-section">
		<div class="section-icon">
			<Trophy size={40} />
		</div>
		<h2>Scoring System</h2>
		
		<div class="scoring-info">
			<div class="score-component">
				<h3>Base Score</h3>
				<p>Every completed game starts with 1000 points</p>
			</div>
			
			<div class="score-component">
				<h3>Time Bonus</h3>
				<p>Faster completion adds up to 500 bonus points</p>
			</div>
			
			<div class="score-component">
				<h3>Sequence Bonus</h3>
				<p>Longer sequences are worth more points (25 points per cell)</p>
			</div>
			
			<div class="score-component">
				<h3>Perfect Game Bonus</h3>
				<p>Complete without hints for an extra 200 points</p>
			</div>
			
			<div class="score-component">
				<h3>Difficulty Multiplier</h3>
				<p>Easy: 1.0x, Medium: 1.5x, Hard: 2.0x</p>
			</div>
			
			<div class="score-component">
				<h3>Hint Penalty</h3>
				<p>Each hint used subtracts 100 points</p>
			</div>
		</div>
		
		<div class="score-example">
			<h3>Example Score Calculation</h3>
			<div class="calculation">
				<div class="calc-step">Base Score: 1000 points</div>
				<div class="calc-step">Time Bonus: +300 points (fast completion)</div>
				<div class="calc-step">Sequence Bonus: +200 points (8 cells × 25)</div>
				<div class="calc-step">Perfect Bonus: +200 points (no hints)</div>
				<div class="calc-step">Hard Multiplier: ×2.0</div>
				<div class="calc-result">Final Score: (1000 + 300 + 200 + 200) × 2.0 = 3400 points</div>
			</div>
		</div>
	</section>

	<!-- Tips and Strategies -->
	<section class="content-section">
		<div class="section-icon">
			<Lightbulb size={40} />
		</div>
		<h2>Tips and Strategies</h2>
		
		<div class="tips-grid">
			<div class="tip-card">
				<h3>🧠 Memory Techniques</h3>
				<ul>
					<li>Use spatial memory - remember positions, not just numbers</li>
					<li>Create patterns or shapes with the sequence</li>
					<li>Use the method of loci (memory palace) for longer sequences</li>
					<li>Practice chunking - group numbers into smaller sets</li>
				</ul>
			</div>
			
			<div class="tip-card">
				<h3>👁️ Focus Strategies</h3>
				<ul>
					<li>Minimize distractions in your environment</li>
					<li>Focus on the center of the grid, use peripheral vision</li>
					<li>Don't get distracted by changing numbers in distraction cells</li>
					<li>Take breaks between games to maintain concentration</li>
				</ul>
			</div>
			
			<div class="tip-card">
				<h3>⏱️ Time Management</h3>
				<ul>
					<li>Don't rush during memorization - use the full time</li>
					<li>Click confidently during reproduction</li>
					<li>If unsure, use a hint rather than guessing</li>
					<li>Practice on easier levels to build speed</li>
				</ul>
			</div>
			
			<div class="tip-card">
				<h3>📈 Improvement Tips</h3>
				<ul>
					<li>Start with Easy mode and progress gradually</li>
					<li>Play regularly for consistent improvement</li>
					<li>Review your statistics to identify weak areas</li>
					<li>Challenge yourself with harder difficulties as you improve</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- About the Developer -->
	<section class="content-section">
		<div class="section-icon">
			<Brain size={40} />
		</div>
		<h2>About This Game</h2>
		<p>
			This concentration game was built using modern web technologies to provide a smooth, 
			accessible, and engaging experience. The game features:
		</p>
		<ul class="tech-features">
			<li>Responsive design that works on all devices</li>
			<li>Accessibility features for users with disabilities</li>
			<li>Local data storage for offline progress tracking</li>
			<li>Customizable settings for personalized experience</li>
			<li>Progressive Web App capabilities</li>
		</ul>
		
		<p>
			Built with SvelteKit, this game demonstrates the power of modern web development 
			while providing a tool for cognitive improvement and entertainment.
		</p>
	</section>

	<!-- Call to Action -->
	<section class="cta-section">
		<h2>Ready to Enhance Your Mind?</h2>
		<p>Begin your cognitive enhancement journey with Stonewall Mind Academy's proven training system!</p>
		<a href="/" class="cta-button">
			<Brain size={24} />
			Start Training Now
		</a>
	</section>
</div>

<style>
	.about-page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 4rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		color: black;
		text-shadow: none;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 2px;
	}

	.page-header p {
		font-size: 1.2rem;
		color: rgba(0, 0, 0, 0.7);
		margin: 0;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	/* Content Sections */
	.content-section {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1.5rem;
		padding: 2.5rem;
		margin-bottom: 3rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		position: relative;
	}

	.section-icon {
		color: #fbbf24;
		margin-bottom: 1rem;
		display: flex;
		justify-content: flex-start;
	}

	.content-section h2 {
		color: black;
		font-size: 2rem;
		margin: 0 0 1.5rem 0;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 1px;
	}

	.content-section p {
		color: rgba(0, 0, 0, 0.8);
		line-height: 1.7;
		margin-bottom: 1.5rem;
		font-size: 1.1rem;
	}

	.content-section p:last-child {
		margin-bottom: 0;
	}

	/* Steps Grid */
	.steps-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.step-card {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		position: relative;
	}

	.step-number {
		position: absolute;
		top: -15px;
		left: 1.5rem;
		width: 30px;
		height: 30px;
		background: var(--color-theme-1);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.1rem;
	}

	.step-card h3 {
		color: black;
		margin: 0.5rem 0 1rem 0;
		font-size: 1.2rem;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.step-card p {
		color: rgba(0, 0, 0, 0.7);
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	/* Difficulty Cards */
	.difficulty-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.difficulty-card {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1rem;
		padding: 2rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		position: relative;
		overflow: hidden;
	}

	.difficulty-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
	}

	.difficulty-card.easy::before {
		background: #10b981;
	}

	.difficulty-card.medium::before {
		background: #f59e0b;
	}

	.difficulty-card.hard::before {
		background: #ef4444;
	}

	.difficulty-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.difficulty-emoji {
		font-size: 1.5rem;
	}

	.difficulty-header h3 {
		color: black;
		margin: 0;
		font-size: 1.5rem;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 1px;
	}

	.difficulty-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.difficulty-card li {
		color: rgba(0, 0, 0, 0.7);
		margin-bottom: 0.75rem;
		padding-left: 1.5rem;
		position: relative;
	}

	.difficulty-card li::before {
		content: '•';
		color: #fbbf24;
		position: absolute;
		left: 0;
		font-weight: bold;
	}

	/* Features Grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.feature-icon {
		color: var(--color-theme-1);
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.feature-card h3 {
		color: black;
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.feature-card p {
		color: rgba(0, 0, 0, 0.7);
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	/* Scoring Info */
	.scoring-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin: 2rem 0;
	}

	.score-component {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		text-align: center;
	}

	.score-component h3 {
		color: #fbbf24;
		margin: 0 0 0.75rem 0;
		font-size: 1.1rem;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.score-component p {
		color: rgba(0, 0, 0, 0.7);
		margin: 0;
		font-size: 0.9rem;
	}

	.score-example {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1rem;
		padding: 2rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		margin-top: 2rem;
	}

	.score-example h3 {
		color: black;
		margin: 0 0 1.5rem 0;
		text-align: center;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 1px;
	}

	.calculation {
		font-family: 'Fira Mono', monospace;
		max-width: 400px;
		margin: 0 auto;
	}

	.calc-step {
		color: rgba(0, 0, 0, 0.7);
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.calc-result {
		color: #fbbf24;
		font-weight: bold;
		padding: 1rem 0 0 0;
		border-top: 2px solid rgba(0, 0, 0, 0.3);
		margin-top: 1rem;
	}

	/* Tips Grid */
	.tips-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.tip-card {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 1rem;
		padding: 2rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.tip-card h3 {
		color: black;
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.tip-card ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tip-card li {
		color: rgba(0, 0, 0, 0.7);
		margin-bottom: 0.75rem;
		padding-left: 1.5rem;
		position: relative;
		line-height: 1.5;
	}

	.tip-card li::before {
		content: '→';
		color: var(--color-theme-1);
		position: absolute;
		left: 0;
		font-weight: bold;
	}

	/* Tech Features */
	.tech-features {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 0.75rem;
	}

	.tech-features li {
		color: rgba(0, 0, 0, 0.7);
		padding-left: 1.5rem;
		position: relative;
		line-height: 1.5;
	}

	.tech-features li::before {
		content: '✓';
		color: #10b981;
		position: absolute;
		left: 0;
		font-weight: bold;
	}

	/* CTA Section */
	.cta-section {
		text-align: center;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border-radius: 1.5rem;
		padding: 3rem 2rem;
		margin-bottom: 3rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
	}

	.cta-section h2 {
		color: black;
		font-size: 2rem;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		letter-spacing: 1px;
	}

	.cta-section p {
		color: rgba(0, 0, 0, 0.7);
		font-size: 1.1rem;
		margin: 0 0 2rem 0;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		background: var(--color-theme-1);
		color: white;
		text-decoration: none;
		padding: 1rem 2rem;
		border-radius: 1rem;
		font-weight: bold;
		font-size: 1.1rem;
		transition: all 0.3s ease;
		border: 2px solid var(--color-theme-1);
		text-transform: uppercase;
		font-family: 'Syncopate', monospace;
		letter-spacing: 1px;
	}

	.cta-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
		text-decoration: none;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.content-section {
			padding: 2rem 1.5rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.content-section h2 {
			font-size: 1.5rem;
		}

		.steps-grid, .difficulty-cards, .features-grid, .tips-grid {
			grid-template-columns: 1fr;
		}

		.scoring-info {
			grid-template-columns: repeat(2, 1fr);
		}

		.tech-features {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.content-section {
			padding: 1.5rem 1rem;
		}

		.scoring-info {
			grid-template-columns: 1fr;
		}

		.cta-section {
			padding: 2rem 1.5rem;
		}
	}
</style>