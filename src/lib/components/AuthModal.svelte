<script lang="ts">
	import { authStore } from '$lib/stores/authStore.js';
	import { createEventDispatcher } from 'svelte';
	import { User, Mail, Lock, X } from 'lucide-svelte';

	export let isOpen = false;
	export let mode = 'signin'; // 'signin' or 'signup'

	const dispatch = createEventDispatcher();

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	function closeModal() {
		isOpen = false;
		email = '';
		password = '';
		error = '';
		dispatch('close');
	}

	async function handleEmailAuth() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		loading = true;
		error = '';

		try {
			let result;
			if (mode === 'signup') {
				result = await authStore.signUpWithEmail(email, password);
			} else {
				result = await authStore.signInWithEmail(email, password);
			}

			if (result.error) {
				error = result.error.message;
			} else {
				closeModal();
			}
		} catch (err) {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	async function handleSocialAuth(provider) {
		loading = true;
		error = '';

		try {
			let result;
			switch (provider) {
				case 'google':
					result = await authStore.signInWithGoogle();
					break;
				case 'apple':
					result = await authStore.signInWithApple();
					break;
				case 'facebook':
					result = await authStore.signInWithFacebook();
					break;
			}

			if (result.error) {
				error = result.error.message;
			}
		} catch (err) {
			error = 'Social login failed';
		} finally {
			loading = false;
		}
	}

	function switchMode() {
		mode = mode === 'signin' ? 'signup' : 'signin';
		error = '';
	}
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal}>
		<div class="modal" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
				<button class="close-btn" on:click={closeModal}>
					<X size={24} />
				</button>
			</div>

			<div class="modal-content">
				<p class="modal-subtitle">
					{mode === 'signin' 
						? 'Sign in to save your progress and compete on the leaderboard' 
						: 'Create an account to track your progress'}
				</p>

				{#if error}
					<div class="error-message">
						{error}
					</div>
				{/if}

				<!-- Social Login Buttons -->
				<div class="social-buttons">
					<button 
						class="social-btn google-btn" 
						on:click={() => handleSocialAuth('google')}
						disabled={loading}
					>
						<svg width="20" height="20" viewBox="0 0 24 24">
							<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
							<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
							<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
							<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
						</svg>
						Continue with Google
					</button>

					<button 
						class="social-btn apple-btn" 
						on:click={() => handleSocialAuth('apple')}
						disabled={loading}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 21.99C7.85 22.03 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
						</svg>
						Continue with Apple
					</button>

					<button 
						class="social-btn facebook-btn" 
						on:click={() => handleSocialAuth('facebook')}
						disabled={loading}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
						Continue with Facebook
					</button>
				</div>

				<div class="divider">
					<span>or</span>
				</div>

				<!-- Email/Password Form -->
				<form on:submit|preventDefault={handleEmailAuth} class="auth-form">
					<div class="form-group">
						<label for="email">
							<Mail size={18} />
							Email
						</label>
						<input 
							type="email" 
							id="email" 
							bind:value={email}
							placeholder="your@email.com"
							required
							disabled={loading}
						/>
					</div>

					<div class="form-group">
						<label for="password">
							<Lock size={18} />
							Password
						</label>
						<input 
							type="password" 
							id="password" 
							bind:value={password}
							placeholder="Enter your password"
							required
							disabled={loading}
						/>
					</div>

					<button type="submit" class="auth-submit-btn" disabled={loading}>
						{#if loading}
							<div class="loading-spinner"></div>
						{:else}
							<User size={18} />
						{/if}
						{mode === 'signin' ? 'Sign In' : 'Create Account'}
					</button>
				</form>

				<div class="auth-switch">
					{mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
					<button type="button" class="switch-btn" on:click={switchMode}>
						{mode === 'signin' ? 'Sign up' : 'Sign in'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 1rem;
		max-width: 400px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 1.5rem 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.modal-header h2 {
		margin: 0;
		font-family: 'Syncopate', monospace;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: black;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	.modal-content {
		padding: 0 1.5rem 1.5rem;
	}

	.modal-subtitle {
		text-align: center;
		color: rgba(0, 0, 0, 0.6);
		margin: 0 0 1.5rem 0;
		line-height: 1.5;
	}

	.error-message {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.social-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.social-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
		background: white;
		color: rgba(0, 0, 0, 0.8);
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.social-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		transform: translateY(-1px);
	}

	.social-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.divider {
		position: relative;
		text-align: center;
		margin: 1.5rem 0;
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: rgba(0, 0, 0, 0.2);
	}

	.divider span {
		background: white;
		padding: 0 1rem;
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		color: rgba(0, 0, 0, 0.8);
		font-size: 0.9rem;
	}

	.form-group input {
		padding: 0.75rem;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: black;
	}

	.auth-submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: black;
		color: white;
		border: none;
		padding: 0.75rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
		font-family: 'Syncopate', monospace;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: all 0.2s ease;
		margin-top: 0.5rem;
	}

	.auth-submit-btn:hover:not(:disabled) {
		background: rgba(0, 0, 0, 0.8);
		transform: translateY(-1px);
	}

	.auth-submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.loading-spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.auth-switch {
		text-align: center;
		margin-top: 1.5rem;
		color: rgba(0, 0, 0, 0.6);
		font-size: 0.9rem;
	}

	.switch-btn {
		background: none;
		border: none;
		color: black;
		cursor: pointer;
		font-weight: 500;
		text-decoration: underline;
		margin-left: 0.25rem;
	}

	.switch-btn:hover {
		color: rgba(0, 0, 0, 0.7);
	}

	/* Mobile Responsiveness */
	@media (max-width: 480px) {
		.modal {
			margin: 0;
			border-radius: 0;
			height: 100vh;
			max-height: none;
		}

		.modal-header {
			padding: 1rem 1rem 0;
		}

		.modal-content {
			padding: 0 1rem 1rem;
		}
	}
</style>