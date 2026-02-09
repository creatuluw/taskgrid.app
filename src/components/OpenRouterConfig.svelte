<script lang="ts">
	import { readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs';
	import { Save, RefreshCw } from 'lucide-svelte';

	interface Config {
		openrouter: {
			apiKey: string;
			model: string;
			modelName: string;
		};
	}

	let apiKey = $state('');
	let selectedModel = $state('');
	let models = $state<Array<{ id: string; name: string; description?: string }>>([]);
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');

	let { workingDirectory, onclose = () => {}, refresh = 0 } = $props();

	async function loadConfig() {
		try {
			const configPath = `${workingDirectory}/.taskgrid/config/openrouter.json`;
			const configExists = await exists(configPath);

			if (configExists) {
				const configContent = await readTextFile(configPath);
				const config: Config = JSON.parse(configContent);
				apiKey = config.openrouter.apiKey;
				selectedModel = config.openrouter.model;

				if (apiKey) {
					await fetchModels();
				}
			}
		} catch (e) {
			console.error('Error loading config:', e);
		}
	}

	async function saveConfig() {
		try {
			const config: Config = {
				openrouter: {
					apiKey,
					model: selectedModel,
					modelName: models.find((m) => m.id === selectedModel)?.name || ''
				}
			};

			const configPath = `${workingDirectory}/.taskgrid/config/openrouter.json`;
			await writeTextFile(configPath, JSON.stringify(config, null, 2));
			success = 'Config saved successfully!';
			error = '';
			setTimeout(() => (success = ''), 3000);
		} catch (e) {
			console.error('Error saving config:', e);
			error = 'Failed to save config';
			success = '';
		}
	}

	async function fetchModels() {
		if (!apiKey) {
			error = 'Please enter an API key first';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('https://openrouter.ai/api/v1/models', {
				headers: {
					Authorization: `Bearer ${apiKey}`
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch models');
			}

			const data = await response.json();
			models = data.data || [];
		} catch (e) {
			console.error('Error fetching models:', e);
			error = 'Failed to fetch models. Check your API key.';
		} finally {
			isLoading = false;
		}
	}

	async function saveAndClose() {
		await saveConfig();
		onclose?.();
	}

	$effect(() => {
		if (workingDirectory) {
			loadConfig();
		}
	});

	$effect(() => {
		refresh;
		if (workingDirectory) {
			loadConfig();
		}
	});
</script>

<div class="p-6 max-w-2xl mx-auto">
	<h2 class="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">OpenRouter Configuration</h2>

	{#if success}
		<div class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
			{success}
		</div>
	{/if}

	{#if error}
		<div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
			{error}
		</div>
	{/if}

	<div class="space-y-6">
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
			<input
				type="password"
				bind:value={apiKey}
				placeholder="Enter your OpenRouter API key"
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Get your API key from <a href="https://openrouter.ai/keys" target="_blank" class="text-blue-500 dark:text-blue-400 hover:underline">openrouter.ai/keys</a></p>
		</div>

		<div>
			<div class="flex items-center justify-between mb-2">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Model</label>
				<button
					onclick={fetchModels}
					disabled={isLoading || !apiKey}
					class="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-200"
				>
					{#if isLoading}
						<div class="animate-spin w-4 h-4 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full"></div>
					{:else}
						<RefreshCw size={14} />
					{/if}
					Refresh Models
				</button>
			</div>

			{#if models.length > 0}
				<select
					bind:value={selectedModel}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">Select a model...</option>
					{#each models as model}
						<option value={model.id}>
							{model.name} - {model.id}
						</option>
					{/each}
				</select>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Found {models.length} models</p>
			{:else}
				<div class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
					{apiKey ? 'Click "Refresh Models" to fetch available models' : 'Enter API key to fetch models'}
				</div>
			{/if}
		</div>

		<div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
			<button
				onclick={saveAndClose}
				disabled={!apiKey || !selectedModel}
				class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
			>
				<Save size={16} />
				Save Configuration
			</button>
		</div>
	</div>
</div>
