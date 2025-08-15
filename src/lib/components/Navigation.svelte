<script lang="ts">
	import { page } from '$app/stores';
	import { gameStore } from '../stores/gameStore.js';
	import { settingsStore } from '../stores/settingsStore.js';
	import { Home, Trophy, Settings, Info, Brain, Menu, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import stonewallLogo from '/stonewall-logo-black.png';
	import stonewallIcon from '$lib/assets/stonewall-icon.png';

	let mobileMenuOpen = false;
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	$: currentPath = $page.url.pathname;
	$: stats = $gameStore.stats;
	$: isDarkMode = mounted ? $settingsStore.theme === 'dark' || ($settingsStore.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) : false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function isActivePath(path: string): boolean {
		return currentPath === path;
	}

	function getTotalGamesCompleted(): number {
		return Object.values(stats.gamesCompleted).reduce((sum, count) => sum + count, 0);
	}
</script>

<nav class="main-navigation">
	<div class="nav-container">
		<!-- Logo/Brand -->
		<div class="nav-brand">
			<a href="/" class="brand-link" on:click={closeMobileMenu}>
				<img src={stonewallLogo} alt="Stonewall Mind Academy" class="brand-logo" />
				<!-- <span class="brand-text">Concentration Grid Game</span> -->
			</a>
		</div>

		<!-- Desktop Navigation -->
		<div class="nav-links desktop-nav">
			<a
				href="/"
				class="nav-link"
				class:active={isActivePath('/')}
				title="Play Game"
			>
				<Home size={20} />
				<span>Game</span>
			</a>

			<a
				href="/leaderboard"
				class="nav-link"
				class:active={isActivePath('/leaderboard')}
				title="Leaderboard"
			>
				<Trophy size={20} />
				<span>Leaderboard</span>
			</a>

			<a
				href="/settings"
				class="nav-link"
				class:active={isActivePath('/settings')}
				title="Settings"
			>
				<Settings size={20} />
				<span>Settings</span>
			</a>

			<a
				href="/about"
				class="nav-link"
				class:active={isActivePath('/about')}
				title="About"
			>
				<Info size={20} />
				<span>About</span>
			</a>
		</div>

		<!-- User Stats (Desktop) -->
		<div class="nav-stats desktop-nav">
			<div class="stat-item">
				<Trophy size={16} />
				<span>{getTotalGamesCompleted()}</span>
			</div>
		</div>

		<!-- Mobile Menu Toggle -->
		<button
			class="mobile-menu-toggle"
			on:click={toggleMobileMenu}
			aria-label="Toggle mobile menu"
		>
			{#if mobileMenuOpen}
				<X size={24} />
			{:else}
				<Menu size={24} />
			{/if}
		</button>
	</div>

	<!-- Mobile Navigation Menu -->
	{#if mobileMenuOpen}
		<div class="mobile-nav" class:open={mobileMenuOpen}>
			<div class="mobile-nav-content">
				<a
					href="/"
					class="mobile-nav-link"
					class:active={isActivePath('/')}
					on:click={closeMobileMenu}
				>
					<Home size={20} />
					<span>Game</span>
				</a>

				<a
					href="/leaderboard"
					class="mobile-nav-link"
					class:active={isActivePath('/leaderboard')}
					on:click={closeMobileMenu}
				>
					<Trophy size={20} />
					<span>Leaderboard</span>
				</a>

				<a
					href="/settings"
					class="mobile-nav-link"
					class:active={isActivePath('/settings')}
					on:click={closeMobileMenu}
				>
					<Settings size={20} />
					<span>Settings</span>
				</a>

				<a
					href="/about"
					class="mobile-nav-link"
					class:active={isActivePath('/about')}
					on:click={closeMobileMenu}
				>
					<Info size={20} />
					<span>About</span>
				</a>

				<div class="mobile-nav-stats">
					<div class="stat-item">
						<Trophy size={16} />
						<span>Games Won: {getTotalGamesCompleted()}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</nav>

<style>
	.main-navigation {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 100;
		transition: all 0.3s ease;
	}

	:global([data-theme="dark"]) .main-navigation {
		background: rgba(17, 24, 39, 0.95);
		border-bottom-color: #374151;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		height: 64px;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-theme-1, #8b5cf6);
		font-weight: bold;
		font-size: 1.25rem;
		transition: all 0.2s ease;
	}

	.brand-link:hover {
		opacity: 0.8;
		transform: translateY(-1px);
	}

	.brand-logo {
		height: 125px;
		width: auto;
		object-fit: contain;
	}

	.brand-icon {
		height: 32px;
		width: 32px;
		object-fit: contain;
		display: none;
	}

	.brand-text {
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-links {
		gap: 0.5rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: #6b7280;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		font-weight: 500;
		font-size: 0.9rem;
		position: relative;
	}

	.nav-link:hover {
		background: #f3f4f6;
		color: var(--color-theme-1, #8b5cf6);
		transform: translateY(-1px);
	}

	.nav-link.active {
		background: var(--color-theme-1, #8b5cf6);
		color: white;
	}

	.nav-link.active:hover {
		background: var(--color-theme-1, #8b5cf6);
		opacity: 0.9;
	}

	:global([data-theme="dark"]) .nav-link {
		color: #d1d5db;
	}

	:global([data-theme="dark"]) .nav-link:hover {
		background: #374151;
		color: var(--color-theme-1, #8b5cf6);
	}

	.nav-stats {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-left: 1rem;
		border-left: 1px solid #e5e7eb;
	}

	:global([data-theme="dark"]) .nav-stats {
		border-left-color: #374151;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		color: #6b7280;
		font-size: 0.85rem;
		font-weight: 500;
	}

	:global([data-theme="dark"]) .stat-item {
		color: #d1d5db;
	}

	.stat-item :global(svg) {
		color: var(--color-theme-1, #8b5cf6);
	}

	.mobile-menu-toggle {
		display: none;
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.mobile-menu-toggle:hover {
		background: #f3f4f6;
		color: var(--color-theme-1, #8b5cf6);
	}

	:global([data-theme="dark"]) .mobile-menu-toggle {
		color: #d1d5db;
	}

	:global([data-theme="dark"]) .mobile-menu-toggle:hover {
		background: #374151;
	}

	.mobile-nav {
		display: none;
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid #e5e7eb;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transform: translateY(-100%);
		opacity: 0;
		transition: all 0.3s ease;
	}

	.mobile-nav.open {
		transform: translateY(0);
		opacity: 1;
	}

	:global([data-theme="dark"]) .mobile-nav {
		background: rgba(17, 24, 39, 0.98);
		border-bottom-color: #374151;
	}

	.mobile-nav-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mobile-nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		text-decoration: none;
		color: #6b7280;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.mobile-nav-link:hover {
		background: #f3f4f6;
		color: var(--color-theme-1, #8b5cf6);
	}

	.mobile-nav-link.active {
		background: var(--color-theme-1, #8b5cf6);
		color: white;
	}

	:global([data-theme="dark"]) .mobile-nav-link {
		color: #d1d5db;
	}

	:global([data-theme="dark"]) .mobile-nav-link:hover {
		background: #374151;
		color: var(--color-theme-1, #8b5cf6);
	}

	.mobile-nav-stats {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	:global([data-theme="dark"]) .mobile-nav-stats {
		border-top-color: #374151;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.desktop-nav {
			display: none;
		}

		.mobile-menu-toggle {
			display: block;
		}

		.mobile-nav {
			display: block;
		}

		.nav-container {
			padding: 0.5rem 1rem;
		}

		.brand-text {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.nav-container {
			padding: 0.5rem 0.75rem;
		}

		.brand-link {
			font-size: 1.1rem;
		}
	}

	/* Animations */
	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* High contrast mode */
	:global(.high-contrast) .nav-link:hover {
		background: #000;
		color: #fff;
	}

	:global(.high-contrast) .nav-link.active {
		background: #000;
		color: #fff;
		border: 2px solid #fff;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.nav-link,
		.mobile-nav,
		.mobile-menu-toggle,
		.brand-link {
			transition: none;
		}
	}

	/* Focus styles for accessibility */
	.nav-link:focus,
	.mobile-nav-link:focus,
	.mobile-menu-toggle:focus,
	.brand-link:focus {
		outline: 2px solid var(--color-theme-1, #8b5cf6);
		outline-offset: 2px;
	}
</style>