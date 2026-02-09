<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import { toggleTheme, currentTheme } from '../stores/theme.svelte';
	import { Moon, Sun, Loader2 } from 'lucide-svelte';
	import { invoke } from '@tauri-apps/api/core';

	let { children } = $props();
	let isReady = $state(false);
	let checkInterval = $state<ReturnType<typeof setInterval> | null>(null);

	async function checkBackendReady() {
		try {
			await invoke<boolean>('backend_ready');
			isReady = true;
			if (checkInterval) {
				clearInterval(checkInterval);
				checkInterval = null;
			}
			
			const loadingScreen = document.getElementById('loading-screen');
			const svelteBody = document.getElementById('svelte-body');
			if (loadingScreen) {
				loadingScreen.style.display = 'none';
				setTimeout(() => loadingScreen.remove(), 300);
			}
			if (svelteBody) {
				svelteBody.style.display = 'contents';
			}
		} catch (error) {
			console.log('Backend not ready yet, retrying...');
		}
	}

	$effect(() => {
		if (!isReady) {
			checkBackendReady();
			checkInterval = setInterval(() => {
				checkBackendReady();
			}, 200);
		}

		return () => {
			if (checkInterval) {
				clearInterval(checkInterval);
			}
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isReady}
	<div class="fixed left-4 bottom-4 z-50">
		<button
			onclick={toggleTheme}
			class="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
			title={$currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{#if $currentTheme === 'dark'}
				<Sun size={20} class="text-yellow-500" />
			{:else}
				<Moon size={20} class="text-gray-700" />
			{/if}
		</button>
	</div>

	{@render children()}
{/if}
