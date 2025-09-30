import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase.js';

const createAuthStore = () => {
	const { subscribe, set, update } = writable({
		user: null,
		loading: true,
		initialized: false
	});

	return {
		subscribe,
		
		// Initialize auth state
		async initialize() {
			try {
				const { data: { session }, error } = await supabase.auth.getSession();
				if (error) throw error;
				
				set({
					user: session?.user ?? null,
					loading: false,
					initialized: true
				});

				// Listen for auth changes
				supabase.auth.onAuthStateChange((event, session) => {
					set({
						user: session?.user ?? null,
						loading: false,
						initialized: true
					});
				});
			} catch (error) {
				console.error('Auth initialization error:', error);
				set({
					user: null,
					loading: false,
					initialized: true
				});
			}
		},

		// Sign in with email/password
		async signInWithEmail(email, password) {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			return { data, error };
		},

		// Sign up with email/password
		async signUpWithEmail(email, password, userData = {}) {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: userData
				}
			});
			return { data, error };
		},

		// Sign in with Google
		async signInWithGoogle() {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			return { data, error };
		},

		// Sign in with Apple
		async signInWithApple() {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'apple',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			return { data, error };
		},

		// Sign in with Facebook
		async signInWithFacebook() {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'facebook',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			return { data, error };
		},

		// Sign out
		async signOut() {
			const { error } = await supabase.auth.signOut();
			return { error };
		},

		// Get current user
		getCurrentUser() {
			return supabase.auth.getUser();
		}
	};
};

export const authStore = createAuthStore();