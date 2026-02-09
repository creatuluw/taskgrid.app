<script lang="ts">
	import { open, ask } from '@tauri-apps/plugin-dialog';
	import { readDir, exists, mkdir, readTextFile, lstat, writeTextFile, remove } from '@tauri-apps/plugin-fs';
	import FileTree from '../components/FileTree.svelte';
	import OpenRouterConfig from '../components/OpenRouterConfig.svelte';
	import { FolderOpen, FileText, BotMessageSquare, X, Settings, Search, MessageSquare, Plus, Zap, FolderTree, BookOpen, File, FolderPlus, Trash2, Folder as FolderIcon, Edit, Save, Brain } from 'lucide-svelte';
	import { loadConfig, sendChatMessage, getChatContext, type ChatMessage, type FileOperation as FSFileOperation } from '../lib/openrouter';
	import { marked, Renderer } from 'marked';
	import hljs from 'highlight.js';

	const renderer = new Renderer();
	renderer.code = function({ text, lang }) {
		if (lang && hljs.getLanguage(lang)) {
			return `<pre><code class="hljs">${hljs.highlight(text, { language: lang }).value}</code></pre>`;
		}
		return `<pre><code class="hljs">${hljs.highlightAuto(text).value}</code></pre>`;
	};

	marked.use({ renderer });

	interface FileNode {
		name: string;
		path: string;
		isDir: boolean;
		children?: FileNode[];
		expanded?: boolean;
	}

	interface Message {
		role: 'user' | 'assistant';
		content: string;
		fileOperations?: FileOperation[];
	}

	interface FileOperation {
		type: 'read' | 'write' | 'create_dir' | 'list' | 'delete';
		path: string;
		content?: string;
		success: boolean;
		message?: string;
	}

	interface FileTab {
		id: string;
		name: string;
		path: string;
		content: string;
	}

	let workingDirectory = $state('');
	let fileTree = $state<FileNode[]>([]);
	let tabs = $state<FileTab[]>([]);
	let activeTabId = $state('');
	let chatPaneOpen = $state(false);
	let sidebarWidth = $state(15);
	let chatPaneWidth = $state(35);
	let messages = $state<Message[]>([]);
	let userInput = $state('');
	let isResizing = $state(false);
	let resizeTarget = $state<'sidebar' | 'chat' | null>(null);
	let resizeStartX = $state(0);
	let resizeStartWidth = $state(0);
	let showConfig = $state(false);
	let configRefresh = $state(0);
	let isSending = $state(false);
	let chatHistory = $state<ChatMessage[]>([]);
	let openrouterConfig = $state<Awaited<ReturnType<typeof loadConfig>>>(null);
	let currentFileOperations = $state<FileOperation[]>([]);
	let isEditing = $state(false);
	let editingContent = $state('');
	let chatInputRef: HTMLInputElement;
	let chatMessagesRef: HTMLDivElement;
	let showSkillDialog = $state(false);
	let selectedSkill = $state<{ name: string; description: string; content: string } | null>(null);
	let availableSkills = $state<{ name: string; description: string; path: string }[]>([]);

	function loadSavedSizes() {
		try {
			const savedSidebarWidth = localStorage.getItem('sidebarWidth');
			const savedChatPaneWidth = localStorage.getItem('chatPaneWidth');
			if (savedSidebarWidth) {
				sidebarWidth = parseFloat(savedSidebarWidth);
			}
			if (savedChatPaneWidth) {
				chatPaneWidth = parseFloat(savedChatPaneWidth);
			}
		} catch (error) {
			console.error('Error loading saved sizes:', error);
		}
	}

	loadSavedSizes();

	async function selectDirectory() {
		const selected = await open({
			directory: true,
			multiple: false
		});

		if (selected) {
			workingDirectory = selected as string;
			await initWorkspace();
		}
	}

	async function copySkillsFolder() {
		const agentsSkillsPath = `${workingDirectory}/.agents/skills`;
		const taskgridSkillsPath = `${workingDirectory}/.taskgrid/skills`;

		try {
			const agentsSkillsExists = await exists(agentsSkillsPath);
			if (agentsSkillsExists) {
				const entries = await readDir(agentsSkillsPath);
				
				for (const entry of entries) {
					if (entry.name) {
						const sourcePath = `${agentsSkillsPath}/${entry.name}`;
						const destPath = `${taskgridSkillsPath}/${entry.name}`;
						
						const stats = await lstat(sourcePath);
						
						if (stats.isDirectory) {
							await mkdir(destPath, { recursive: true });
							const subEntries = await readDir(sourcePath);
							
							for (const subEntry of subEntries) {
								if (subEntry.name) {
									const subSourcePath = `${sourcePath}/${subEntry.name}`;
									const subDestPath = `${destPath}/${subEntry.name}`;
									const content = await readTextFile(subSourcePath);
									await writeTextFile(subDestPath, content);
								}
							}
						} else {
							const content = await readTextFile(sourcePath);
							await writeTextFile(destPath, content);
						}
					}
				}
			}
		} catch (error) {
			console.error('Error copying skills folder:', error);
		}
	}

	async function copyAppSkillsToWorkspace() {
		const workspaceSkillsPath = `${workingDirectory}/.taskgrid/skills`;

		try {
			const skillsList = ['about-taskgrid', 'skill-creator', 'task-clarification', 'task-creation'];

			for (const skillName of skillsList) {
				const skillDir = `${workspaceSkillsPath}/${skillName}`;
				await mkdir(skillDir, { recursive: true });

				const skillManifest = await fetch(`/skills/${skillName}/SKILL.md`);
				if (skillManifest.ok) {
					const manifestContent = await skillManifest.text();
					await writeTextFile(`${skillDir}/SKILL.md`, manifestContent);
				}

				const references = await fetch(`/skills/${skillName}/references/`);
				if (references.ok) {
					const refsHtml = await references.text();
					const parser = new DOMParser();
					const doc = parser.parseFromString(refsHtml, 'text/html');
					const links = doc.querySelectorAll('a[href]');

					for (const link of Array.from(links)) {
						const fileName = link.getAttribute('href');
						if (fileName && !fileName.startsWith('..')) {
							const fileResponse = await fetch(`/skills/${skillName}/references/${fileName}`);
							if (fileResponse.ok) {
								const fileContent = await fileResponse.text();
								await mkdir(`${skillDir}/references`, { recursive: true });
								await writeTextFile(`${skillDir}/references/${fileName}`, fileContent);
							}
						}
					}
				}
			}

			console.log('Skills copied successfully');
		} catch (error) {
			console.error('Error copying app skills to workspace:', error);
		}
	}

	async function initWorkspace() {
		const taskgridDir = `${workingDirectory}/.taskgrid`;

		const taskgridExists = await exists(taskgridDir);
		if (!taskgridExists) {
			const confirmed = await ask(
				'No .taskgrid folder found. Would you like to initialize this workspace?',
				{ title: 'Initialize Workspace', kind: 'info' }
			);

			if (confirmed) {
				try {
					await mkdir(taskgridDir, { recursive: true });
					const subfolders = ['project', 'tasks', 'skills', 'config', 'wiki', 'logs', 'logic'];
					for (const folder of subfolders) {
						const folderPath = `${taskgridDir}/${folder}`;
						await mkdir(folderPath, { recursive: true });
					}

					const readmePath = `${taskgridDir}/README.md`;
					await writeTextFile(readmePath, '# TaskGrid Workspace\n\nThis directory contains your TaskGrid workspace data.\n\n## Directories\n- `/project`: Project files\n- `/tasks`: Task definitions\n- `/skills`: AI skills and agents\n- `/config`: Configuration files\n- `/wiki`: Documentation and notes\n- `/logs`: Application logs\n- `/logic`: Custom logic files\n');

					await copyAppSkillsToWorkspace();

					await loadFileTree();
					await loadOpenRouterConfig();
				} catch (error) {
					console.error('Error creating .taskgrid structure:', error);
					throw error;
				}
			}
		} else {
			await loadFileTree();
			await loadOpenRouterConfig();
		}
	}

	async function loadFileTree() {
		const taskgridDir = `${workingDirectory}/.taskgrid`;
		const entries = await readDir(taskgridDir);
		fileTree = await processEntries(entries, taskgridDir);
	}

	async function processEntries(entries: any[], basePath: string): Promise<FileNode[]> {
		const nodes: FileNode[] = [];

		for (const entry of entries) {
			const fullPath = `${basePath}/${entry.name}`;

			const node: FileNode = {
				name: entry.name,
				path: fullPath,
				isDir: false
			};

			try {
				const stats = await lstat(fullPath);
				node.isDir = stats.isDirectory;
				if (node.isDir) {
					const subEntries = await readDir(fullPath);
					node.children = await processEntries(subEntries, fullPath);
				}
			} catch (e) {
				console.error(`Error checking path ${fullPath}:`, e);
			}

			nodes.push(node);
		}

		return nodes.sort((a, b) => {
			if (a.isDir === b.isDir) {
				return a.name.localeCompare(b.name);
			}
			return a.isDir ? -1 : 1;
		});
	}

	async function handleFileSelect(node: FileNode) {
		const existingTab = tabs.find(tab => tab.path === node.path);
		
		if (existingTab) {
			activeTabId = existingTab.id;
		} else {
			const content = await readTextFile(node.path);
			const newTab: FileTab = {
				id: crypto.randomUUID(),
				name: node.name,
				path: node.path,
				content
			};
			tabs.push(newTab);
			activeTabId = newTab.id;
		}
	}

	function switchTab(tabId: string) {
		activeTabId = tabId;
	}

	function closeTab(tabId: string, event: MouseEvent) {
		event.stopPropagation();
		const tabToRemove = tabs.findIndex(tab => tab.id === tabId);
		
		if (tabToRemove === -1) return;

		tabs.splice(tabToRemove, 1);

		if (tabs.length === 0) {
			activeTabId = '';
		} else if (activeTabId === tabId) {
			const newActiveIndex = Math.min(tabToRemove, tabs.length - 1);
			activeTabId = tabs[newActiveIndex].id;
		}
	}

	async function deleteFile(tabId: string) {
		const tab = tabs.find(t => t.id === tabId);
		if (!tab) return;

		const confirmed = await ask(
			`Are you sure you want to delete ${tab.name}?`,
			{ title: 'Delete File', kind: 'warning' }
		);

		if (confirmed) {
			try {
				const fs = await import('@tauri-apps/plugin-fs');
				await fs.remove(tab.path);
				closeTab(tabId, new MouseEvent('click'));
				await loadFileTree();
			} catch (error) {
				console.error('Error deleting file:', error);
			}
		}
	}

	function startEdit() {
		const tab = tabs.find(t => t.id === activeTabId);
		if (!tab) return;
		editingContent = tab.content;
		isEditing = true;
	}

	async function saveEdit() {
		const tab = tabs.find(t => t.id === activeTabId);
		if (!tab) return;
		await writeTextFile(tab.path, editingContent);
		tab.content = editingContent;
		isEditing = false;
	}

	function cancelEdit() {
		isEditing = false;
		editingContent = '';
	}

	function isMarkdownFile(filename: string): boolean {
		return filename.toLowerCase().endsWith('.md');
	}

	function removeFrontmatter(content: string): string {
		const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
		return content.replace(frontmatterRegex, '');
	}

	function startResize(e: MouseEvent, target: 'sidebar' | 'chat') {
		isResizing = true;
		resizeTarget = target;
		resizeStartX = e.clientX;
		resizeStartWidth = target === 'sidebar' ? sidebarWidth : chatPaneWidth;
		document.addEventListener('mousemove', handleResize);
		document.addEventListener('mouseup', stopResize);
	}

	function handleResize(e: MouseEvent) {
		if (!isResizing || !resizeTarget) return;
		const containerWidth = window.innerWidth;
		let deltaPercent;
		
		if (resizeTarget === 'sidebar') {
			const deltaX = e.clientX - resizeStartX;
			deltaPercent = (deltaX / containerWidth) * 100;
			sidebarWidth = Math.max(10, Math.min(40, resizeStartWidth + deltaPercent));
		} else {
			const deltaX = resizeStartX - e.clientX;
			deltaPercent = (deltaX / containerWidth) * 100;
			chatPaneWidth = Math.max(20, Math.min(50, resizeStartWidth + deltaPercent));
		}
	}

	function stopResize() {
		isResizing = false;
		resizeTarget = null;
		document.removeEventListener('mousemove', handleResize);
		document.removeEventListener('mouseup', stopResize);
		
		try {
			localStorage.setItem('sidebarWidth', sidebarWidth.toString());
			localStorage.setItem('chatPaneWidth', chatPaneWidth.toString());
		} catch (error) {
			console.error('Error saving sizes:', error);
		}
	}

	async function loadOpenRouterConfig() {
		openrouterConfig = await loadConfig(workingDirectory);
	}

	async function loadAvailableSkills() {
		const skillsDir = `${workingDirectory}/.taskgrid/skills`;
		
		try {
			const skills: { name: string; description: string; path: string }[] = [];
			
			const skillsDirExists = await exists(skillsDir);
			if (skillsDirExists) {
				const entries = await readDir(skillsDir);
				for (const entry of entries) {
					if (entry.name) {
						const entryPath = `${skillsDir}/${entry.name}`;
						const stats = await lstat(entryPath);
						if (stats.isDirectory) {
							const skillPath = `${entryPath}/SKILL.md`;
							const skillExists = await exists(skillPath);
							if (skillExists) {
								const content = await readTextFile(skillPath);
								const match = content.match(/name:\s*(.+?)\n/);
								const descMatch = content.match(/description:\s*(.+?)\n/);
								skills.push({
									name: match ? match[1].trim() : entry.name,
									description: descMatch ? descMatch[1].trim() : 'No description available',
									path: skillPath
								});
							}
						}
					}
				}
			}
			
			availableSkills = skills;
		} catch (error) {
			console.error('Error loading skills:', error);
			availableSkills = [];
		}
	}

	async function selectSkill(skillPath: string) {
		try {
			const content = await readTextFile(skillPath);
			const nameMatch = content.match(/name:\s*(.+?)\n/);
			const descMatch = content.match(/description:\s*(.+?)\n/);
			selectedSkill = {
				name: nameMatch ? nameMatch[1].trim() : 'Unknown Skill',
				description: descMatch ? descMatch[1].trim() : 'No description',
				content
			};
			showSkillDialog = false;
			
			await sendSkillSummary();
		} catch (error) {
			console.error('Error loading skill:', error);
		}
	}

	async function sendSkillSummary() {
		if (!selectedSkill || !openrouterConfig) return;
		
		const summaryMessage: ChatMessage = {
			role: 'system',
			content: `<skill_content name="${selectedSkill.name}">\n${selectedSkill.content}\n</skill_content>`
		};
		
		const userPrompt: ChatMessage = {
			role: 'user',
			content: 'A new skill has been loaded. Please summarize what skills and capabilities you have acquired from this skill in 2-3 sentences. Keep it concise and helpful for the user.'
		};
		
		try {
			const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${openrouterConfig.openrouter.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: openrouterConfig.openrouter.model,
					messages: [summaryMessage, userPrompt]
				})
			});
			
			if (response.ok) {
				const data = await response.json();
				const summary = data.choices[0].message.content;
				
				messages = [...messages, {
					role: 'assistant',
					content: `🧠 **Skill Loaded: ${selectedSkill.name}**\n\n${summary}`
				}];
			}
		} catch (error) {
			console.error('Error generating skill summary:', error);
		}
	}

	function clearSkill() {
		selectedSkill = null;
	}

	function toggleSkillDialog() {
		if (!showSkillDialog) {
			loadAvailableSkills();
		}
		showSkillDialog = !showSkillDialog;
	}

	async function sendMessage() {
		if (!userInput.trim()) return;

		const userMessage = userInput;
		messages = [...messages, { role: 'user', content: userMessage }];
		chatHistory = [...chatHistory, { role: 'user', content: userMessage }];
		userInput = '';
		isSending = true;
		currentFileOperations = [];

		try {
			if (!openrouterConfig) {
				throw new Error('No OpenRouter configuration found. Please configure it first.');
			}

			if (!openrouterConfig.openrouter.apiKey) {
				throw new Error('API key is missing. Please configure it first.');
			}

			if (!openrouterConfig.openrouter.model) {
				throw new Error('Model is not selected. Please configure it first.');
			}

			let contextMessages = await getChatContext(workingDirectory, chatHistory);
			const operations: FSFileOperation[] = [];
			
			if (selectedSkill) {
				const skillSystemMessage = {
					role: 'system' as const,
					content: `<skill_content name="${selectedSkill.name}">\n${selectedSkill.content}\n</skill_content>`
				};
				contextMessages = [skillSystemMessage, ...contextMessages];
			}

			const onFileOperation = (operation: FSFileOperation) => {
				operations.push(operation);
				currentFileOperations = [...currentFileOperations, operation];
			};

			const response = await sendChatMessage(chatHistory, openrouterConfig, workingDirectory, onFileOperation);
			
			messages = [...messages, { 
				role: 'assistant', 
				content: response,
				fileOperations: currentFileOperations.length > 0 ? [...currentFileOperations] : undefined
			}];
			chatHistory = [...chatHistory, { role: 'assistant', content: response }];
			
			if (currentFileOperations.length > 0) {
				await loadFileTree();
			}
			
			currentFileOperations = [];
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
			messages = [
				...messages,
				{ role: 'assistant', content: `Error: ${errorMessage}` }
			];
		} finally {
			isSending = false;
		}
	}

	function toggleChatPane() {
		chatPaneOpen = !chatPaneOpen;
	}

	function toggleConfig() {
		showConfig = !showConfig;
		if (showConfig) {
			configRefresh += 1;
		} else if (workingDirectory) {
			loadOpenRouterConfig();
		}
	}

	$effect(() => {
		if (chatMessagesRef) {
			chatMessagesRef.scrollTop = chatMessagesRef.scrollHeight;
		}
	});

	$effect(() => {
		if (chatPaneOpen && chatInputRef) {
			setTimeout(() => chatInputRef.focus(), 50);
		}
	});
</script>

<div class="flex h-screen relative">
  <!-- Left Sidebar -->
  <div class="flex" style="width: {sidebarWidth}%;">
    <!-- Sidebar Content -->
    <div class="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-1 h-full overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 class="font-semibold text-gray-700 dark:text-gray-200 text-sm">Workspace</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{workingDirectory || 'No workspace selected'}</p>
      </div>

      <div class="flex-1 p-4 overflow-y-auto">
        {#each fileTree as node}
          <FileTree {node} depth={0} onSelect={handleFileSelect} />
        {/each}
      </div>
    </div>

    <!-- Left Sidebar Resize Handle -->
    <div
      class="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize shrink-0"
      onmousedown={(e) => startResize(e, 'sidebar')}
      class:resizing={isResizing && resizeTarget === 'sidebar'}
    ></div>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col relative">
    <!-- Chat Toggle Button -->
    {#if !chatPaneOpen && workingDirectory}
      <div class="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onclick={toggleConfig}
          class="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
          title="Settings"
        >
          <Settings size={20} class="text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onclick={toggleChatPane}
          class="p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
          title="Toggle Chat"
        >
          <BotMessageSquare size={20} class="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    {/if}

    <!-- Config Modal -->
    {#if showConfig}
      <div class="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Configuration</h2>
            <button onclick={toggleConfig} class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X size={20} class="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <OpenRouterConfig workingDirectory={workingDirectory} onclose={toggleConfig} refresh={configRefresh} />
        </div>
      </div>
    {/if}

    <!-- Skill Selection Dialog -->
    {#if showSkillDialog}
      <div class="fixed inset-0 bg-black dark:bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto m-4">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-2">
              <Brain size={20} class="text-purple-600 dark:text-purple-400" />
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Select a Skill</h2>
            </div>
            <button onclick={toggleSkillDialog} class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X size={20} class="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div class="p-4">
            {#if availableSkills.length === 0}
              <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                <Brain size={48} class="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p class="text-lg mb-2">No skills available</p>
                <p class="text-sm">Skills will appear in your workspace's .taskgrid/skills or .agents/skills folder</p>
              </div>
            {:else}
              <div class="space-y-3">
                {#each availableSkills as skill}
                  <div
                    class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-all"
                    onclick={() => selectSkill(skill.path)}
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 dark:text-white mb-1">{skill.name}</h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{skill.description}</p>
                      </div>
                      <Zap size={16} class="text-purple-500 dark:text-purple-400 mt-1 ml-2 shrink-0" />
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

     <div class="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
       {#if tabs.length > 0}
         <!-- Tab Bar -->
         <div class="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
           {#each tabs as tab}
             <div
               class="flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-200 dark:border-gray-700 cursor-pointer select-none whitespace-nowrap {activeTabId === tab.id
                 ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t-2 border-t-blue-500'
                 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}"
               onclick={() => switchTab(tab.id)}
             >
             <span class="truncate max-w-[200px]">{tab.name}</span>
             <button
               onclick={(e) => closeTab(tab.id, e)}
               class="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
               title="Close tab"
             >
               <X size={14} />
             </button>
           </div>
           {/each}
         </div>

         <!-- Tab Content -->
         {#each tabs as tab}
           {#if tab.id === activeTabId}
             <div class="flex-1 min-h-0 overflow-y-auto p-6">
               <div class="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                 <h2 class="font-semibold text-gray-700 dark:text-gray-200">{tab.path}</h2>
                 <div class="flex items-center gap-1">
                   {#if !isEditing}
                     <button
                       onclick={startEdit}
                       class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                       title="Edit file"
                     >
                       <Edit size={16} class="text-gray-500 dark:text-gray-400" />
                     </button>
                     <button
                       onclick={() => deleteFile(tab.id)}
                       class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                       title="Delete file"
                     >
                       <Trash2 size={16} class="text-gray-500 dark:text-gray-400" />
                     </button>
                   {:else}
                     <button
                       onclick={saveEdit}
                       class="p-1 hover:bg-green-200 dark:hover:bg-green-700 rounded"
                       title="Save"
                     >
                       <Save size={16} class="text-green-600 dark:text-green-400" />
                     </button>
                     <button
                       onclick={cancelEdit}
                       class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                       title="Cancel"
                     >
                       <X size={16} class="text-gray-500 dark:text-gray-400" />
                     </button>
                   {/if}
                 </div>
               </div>
               {#if isEditing}
                 <textarea
                   bind:value={editingContent}
                   class="w-full h-full min-h-[500px] p-4 font-mono text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                   placeholder="Edit file content..."
                 ></textarea>
               {:else}
                  {#if isMarkdownFile(tab.name)}
                    <div class="markdown-content text-gray-800 dark:text-gray-200 p-6">
                      {@html marked(removeFrontmatter(tab.content))}
                    </div>
                 {:else}
                   <pre class="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200">{tab.content}</pre>
                 {/if}
               {/if}
             </div>
           {/if}
         {/each}
       {:else}
         <div class="flex-1 flex items-center justify-center p-8">
           {#if !workingDirectory}
             <button
               onclick={selectDirectory}
               class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
             >
               Select Workspace
             </button>
           {:else}
             <div class="grid grid-cols-3 gap-6 max-w-3xl w-full">
               <!-- Create Task Card -->
               <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer relative">
                 <Plus size={20} class="absolute top-3 right-3 text-green-600 dark:text-green-400" />
                 <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Create Task</h3>
                 <p class="text-xs text-gray-600 dark:text-gray-400">Create new tasks</p>
               </div>

              <!-- Chat Card -->
              <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer relative" onclick={toggleChatPane}>
                <MessageSquare size={20} class="absolute top-3 right-3 text-purple-600 dark:text-purple-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Chat</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Chat with AI assistant</p>
              </div>

              <!-- Search Card -->
              <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer relative">
                <Search size={20} class="absolute top-3 right-3 text-blue-600 dark:text-blue-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Search</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Search through files and content</p>
              </div>

              <!-- Add Skills Card -->
              <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-yellow-500 dark:hover:border-yellow-500 transition-all cursor-pointer relative">
                <Zap size={20} class="absolute top-3 right-3 text-yellow-600 dark:text-yellow-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Add Skills</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Manage skills</p>
              </div>

              <!-- Project View Card -->
              <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer relative">
                <FolderTree size={20} class="absolute top-3 right-3 text-orange-600 dark:text-orange-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Project View</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">View project structure</p>
              </div>

              <!-- Wiki View Card -->
              <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all cursor-pointer relative">
                <BookOpen size={20} class="absolute top-3 right-3 text-pink-600 dark:text-pink-400" />
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Wiki View</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Browse wiki documentation</p>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Chat Pane -->
  {#if chatPaneOpen}
    <div class="flex" style="width: {chatPaneWidth}%;">
      <!-- Resize Handle -->
      <div
        class="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize shrink-0"
        onmousedown={(e) => startResize(e, 'chat')}
        class:resizing={isResizing && resizeTarget === 'chat'}
      ></div>

      <!-- Chat Content -->
      <div class="flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-1">
        <!-- Chat Header -->
        <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <BotMessageSquare size={16} class="text-gray-700 dark:text-gray-200" />
            <div>
              <h3 class="font-semibold text-gray-700 dark:text-gray-200 text-sm">Chat</h3>
              <div class="flex items-center gap-2">
                {#if openrouterConfig?.openrouter.modelName}
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {openrouterConfig.openrouter.modelName}
                  </p>
                {:else}
                  <p class="text-xs text-gray-400 dark:text-gray-500">No model</p>
                {/if}
                {#if selectedSkill}
                  <div class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Brain size={12} />
                    <span class="truncate max-w-[100px]">{selectedSkill.name}</span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            {#if selectedSkill}
              <button
                onclick={clearSkill}
                class="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded relative"
                title={`Active skill: ${selectedSkill.name} (Click to remove)`}
              >
                <Brain size={16} class="text-green-600 dark:text-green-400" />
                <div class="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
              </button>
            {:else}
              <button
                onclick={toggleSkillDialog}
                class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Load a skill"
              >
                <Brain size={16} class="text-gray-500 dark:text-gray-400" />
              </button>
            {/if}
            <button
              onclick={toggleConfig}
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Settings"
            >
              <Settings size={16} class="text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onclick={toggleChatPane}
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Close"
            >
              <X size={16} class="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4" bind:this={chatMessagesRef}>
          {#each messages as message}
            <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[80%] space-y-2">
                <div
                  class="rounded-lg px-3 py-2 text-sm {message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                >
                  {#if message.role === 'assistant'}
                    <div class="markdown-content">
                      {@html marked(message.content)}
                    </div>
                  {:else}
                    {message.content}
                  {/if}
                </div>
                
                {#if message.fileOperations && message.fileOperations.length > 0}
                  <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-2">
                    <div class="text-xs font-semibold text-gray-600 dark:text-gray-300">File Operations:</div>
                    {#each message.fileOperations as op}
                      <div class="flex items-start gap-2 text-xs">
                        {#if op.type === 'read'}
                          <File size={14} class="text-blue-500 mt-0.5 shrink-0" />
                        {:else if op.type === 'write'}
                          <File size={14} class="text-green-500 mt-0.5 shrink-0" />
                        {:else if op.type === 'create_dir'}
                          <FolderPlus size={14} class="text-purple-500 mt-0.5 shrink-0" />
                        {:else if op.type === 'list'}
                          <FolderIcon size={14} class="text-yellow-500 mt-0.5 shrink-0" />
                        {:else if op.type === 'delete'}
                          <Trash2 size={14} class="text-red-500 mt-0.5 shrink-0" />
                        {/if}
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-gray-700 dark:text-gray-200 truncate">{op.path}</div>
                          <div class="text-gray-500 dark:text-gray-400">
                            {op.success ? op.message : `<span class="text-red-500">${op.message}</span>`}
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <div class="flex justify-center">
              <div class="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg px-3 py-2 text-sm">
                Start a conversation...
              </div>
            </div>
          {/each}

          {#if isSending}
            <div class="flex justify-start">
              <div class="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </div>
              </div>
            </div>
          {/if}

          {#if currentFileOperations.length > 0}
            <div class="flex justify-start">
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 text-sm">
                <div class="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Processing file operations...</div>
                {#each currentFileOperations as op}
                  <div class="text-xs text-blue-600 dark:text-blue-400 truncate">
                    {op.type}: {op.path}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Chat Input -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={userInput}
              bind:this={chatInputRef}
              onkeydown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              class="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onclick={sendMessage}
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      </div>
  {/if}
</div>

<style>
	.resizing {
		background-color: rgb(96 165 250) !important;
	}
</style>
