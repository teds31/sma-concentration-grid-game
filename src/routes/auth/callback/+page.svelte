<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	import { goto } from '$app/navigation';

	let loading = true;
	let error = '';

	onMount(async () => {
		try {
			const { data, error: authError } = await supabase.auth.getSession();
			
			if (authError) {
				error = 'Authentication failed';
				console.error('Auth callback error:', authError);
			} else if (data.session) {
				// Successfully authenticated, redirect to home
				await goto('/', { replaceState: true });
			} else {
				error = 'No session found';
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error('Callback error:', err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Authenticating - SMA Concentration Grid</title>
</svelte:head>

<div class="callback-page">
	{#if loading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<h2>Completing sign in...</h2>
			<p>Please wait while we finish setting up your account.</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Authentication Error</h2>
			<p>{error}</p>
			<a href="/" class="back-btn">Return Home</a>
		</div>
	{/if}
</div>

<style>
	.callback-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: var(--color-bg-0);
	}

	.loading-container,
	.error-container {
		text-align: center;
		max-width: 400px;
		background: rgba(255, 255, 255, 0.9);
		padding: 3rem 2rem;
		border-radius: 1rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(0, 0, 0, 0.1);
		border-top: 4px solid black;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 2rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	h2 {
		margin: 0 0 1rem 0;
		color: black;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	p {
		margin: 0 0 2rem 0;
		color: rgba(0, 0, 0, 0.7);
		line-height: 1.5;
	}

	.back-btn {
		display: inline-block;
		background: black;
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 500;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: translateY(-1px);
		text-decoration: none;
	}
</style>