<script lang="ts">
	import '../app.css';
	import '@fontsource/fira-mono';
	import '@fontsource/syncopate/400.css';
	import '@fontsource/syncopate/700.css';
	import favicon from '$lib/assets/favicon.png';
	import Navigation from '$lib/components/Navigation.svelte';
	import { settingsStore } from '$lib/stores/settingsStore.js';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Apply theme settings on mount
		settingsStore.applyTheme();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="SMA: Concentration Grid - Advanced cognitive training through challenging grid-based concentration exercises. Enhance memory, focus, and mental performance." />
	<meta name="keywords" content="SMA, concentration grid, cognitive enhancement, memory improvement, focus training, Stonewall Mind Academy, brain training" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="app">
	<Navigation />
	<main class="main-content">
		{@render children?.()}
	</main>
</div>

<style>
	:global(html) {
		height: 100%;
	}

	:global(body) {
		margin: 0;
		min-height: 100vh;
		background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%);
		font-family: 'Syncopate', 'Fira Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		line-height: 1.6;
		color: #000000;
		font-weight: 400;
	}

	:global([data-theme="dark"]) :global(body) {
		background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
		color: #ffffff;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.main-content {
		flex: 1;
		padding: 2rem 1rem;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(a) {
		color: var(--color-theme-1, #8b5cf6);
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	:global(button) {
		font-family: inherit;
	}

	:global(.sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* CSS Custom Properties for theming */
	:global(:root) {
		--color-theme-1: #000000;
		--color-theme-2: #333333;
		--color-bg-0: #ffffff;
		--color-bg-1: #fafafa;
		--color-bg-2: #f5f5f5;
		--color-text: #000000;
		--color-text-light: #666666;
		--color-accent: #000000;
		--color-border: #e0e0e0;
	}

	:global([data-theme="dark"]) {
		--color-theme-1: #ffffff;
		--color-theme-2: #cccccc;
		--color-bg-0: #000000;
		--color-bg-1: #0a0a0a;
		--color-bg-2: #1a1a1a;
		--color-text: #ffffff;
		--color-text-light: #999999;
		--color-accent: #ffffff;
		--color-border: #333333;
	}

	/* Font size adjustments */
	:global([data-font-size="small"]) {
		font-size: 14px;
	}

	:global([data-font-size="large"]) {
		font-size: 18px;
	}

	/* High contrast mode */
	:global(.high-contrast) {
		--color-theme-1: #000000;
		--color-theme-2: #ffffff;
		--color-bg-0: #ffffff;
		--color-bg-1: #ffffff;
		--color-bg-2: #f0f0f0;
		--color-text: #000000;
		--color-text-light: #333333;
	}

	:global(.high-contrast[data-theme="dark"]) {
		--color-theme-1: #ffffff;
		--color-theme-2: #ffff00;
		--color-bg-0: #000000;
		--color-bg-1: #000000;
		--color-bg-2: #333333;
		--color-text: #ffffff;
		--color-text-light: #cccccc;
	}

	/* Compact mode */
	:global(.compact-mode) .main-content {
		padding: 1rem 0.5rem;
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.main-content {
			padding: 1rem 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.main-content {
			padding: 1rem 0.5rem;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
