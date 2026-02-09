<script lang="ts">
	import { readTextFile } from '@tauri-apps/plugin-fs';
	import { FolderOpen, Folder, FileText, ChevronDown, ChevronRight } from 'lucide-svelte';

	interface FileNode {
		name: string;
		path: string;
		isDir: boolean;
		children?: FileNode[];
		expanded?: boolean;
	}

	interface Props {
		node: FileNode;
		depth: number;
		onSelect: (node: FileNode) => Promise<void>;
	}

	let { node, depth, onSelect }: Props = $props();

	async function handleClick() {
		if (node.isDir) {
			node.expanded = !node.expanded;
		} else {
			await onSelect(node);
		}
	}

	let padding = $derived(depth * 16);
	let displayName = $derived(node.isDir ? node.name.charAt(0).toUpperCase() + node.name.slice(1) : node.name);
</script>

<div
	class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm select-none text-gray-700 dark:text-gray-200"
	style="padding-left: {padding}px"
	onclick={handleClick}
>
	{#if node.isDir}
		{#if node.expanded}
			<FolderOpen size={16} class="text-blue-500 dark:text-blue-400" />
		{:else}
			<Folder size={16} class="text-blue-500 dark:text-blue-400" />
		{/if}
	{:else}
		<FileText size={16} class="text-gray-500 dark:text-gray-400" />
	{/if}
	<span class="flex-1 truncate">{displayName}</span>
	{#if node.isDir}
		{#if node.expanded}
			<ChevronDown size={14} class="text-gray-400 dark:text-gray-500" />
		{:else}
			<ChevronRight size={14} class="text-gray-400 dark:text-gray-500" />
		{/if}
	{/if}
</div>

{#if node.expanded && node.children}
	{#each node.children as child}
		<svelte:self node={child} depth={depth + 1} onSelect={onSelect} />
	{/each}
{/if}
