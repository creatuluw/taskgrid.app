import { readTextFile, exists } from '@tauri-apps/plugin-fs';
import { fileSystemService } from './filesystem';

export interface OpenRouterConfig {
	apiKey: string;
	model: string;
	modelName: string;
}

export interface Config {
	openrouter: OpenRouterConfig;
}

export async function loadConfig(workingDirectory: string): Promise<Config | null> {
	try {
		const configPath = `${workingDirectory}/.taskgrid/config/openrouter.json`;
		const configExists = await exists(configPath);

		if (!configExists) {
			return null;
		}

		const configContent = await readTextFile(configPath);
		return JSON.parse(configContent) as Config;
	} catch (e) {
		console.error('Error loading config:', e);
		return null;
	}
}

export interface ChatMessage {
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string;
	tool_calls?: ToolCall[];
	tool_call_id?: string;
}

export interface ToolCall {
	id: string;
	type: 'function';
	function: {
		name: string;
		arguments: string;
	};
}

export interface Tool {
	type: 'function';
	function: {
		name: string;
		description: string;
		parameters: Record<string, any>;
	};
}

export interface FileOperation {
	type: 'read' | 'write' | 'create_dir' | 'list' | 'delete';
	path: string;
	content?: string;
	success: boolean;
	message?: string;
}

const fileTools: Tool[] = [
	{
		type: 'function',
		function: {
			name: 'read_file',
			description: 'Read the contents of a file in the .taskgrid folder. Use this when you need to reference existing file contents or understand the current state of files.',
			parameters: {
				type: 'object',
				properties: {
					path: {
						type: 'string',
						description: 'The relative path within .taskgrid folder (e.g., "tasks/my-task.md" or "project/main.ts")'
					},
					reason: {
						type: 'string',
						description: 'Brief explanation of why you need to read this file'
					}
				},
				required: ['path', 'reason']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'write_file',
			description: 'Create or overwrite a file in the .taskgrid folder. Use this to create new files or update existing ones based on user requests.',
			parameters: {
				type: 'object',
				properties: {
					path: {
						type: 'string',
						description: 'The relative path within .taskgrid folder (e.g., "tasks/my-task.md" or "config/settings.json")'
					},
					content: {
						type: 'string',
						description: 'The content to write to the file. Should be properly formatted according to the file type.'
					},
					reason: {
						type: 'string',
						description: 'Brief explanation of what file you are creating/updating and why'
					}
				},
				required: ['path', 'content', 'reason']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'create_directory',
			description: 'Create a new directory in the .taskgrid folder. Use this to organize files and create new project structures.',
			parameters: {
				type: 'object',
				properties: {
					path: {
						type: 'string',
						description: 'The relative path within .taskgrid folder (e.g., "project/subfolder")'
					},
					reason: {
						type: 'string',
						description: 'Brief explanation of what directory you are creating and why'
					}
				},
				required: ['path', 'reason']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'list_directory',
			description: 'List the contents of a directory in the .taskgrid folder. Use this to explore the workspace structure.',
			parameters: {
				type: 'object',
				properties: {
					path: {
						type: 'string',
						description: 'The relative path within .taskgrid folder. Use "." or "project" to list directories.'
					},
					reason: {
						type: 'string',
						description: 'Brief explanation of what directory you are listing and why'
					}
				},
				required: ['path', 'reason']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'delete_file',
			description: 'Delete a file in the .taskgrid folder. Only use this when explicitly requested by the user.',
			parameters: {
				type: 'object',
				properties: {
					path: {
						type: 'string',
						description: 'The relative path within .taskgrid folder (e.g., "tasks/old-task.md")'
					},
					reason: {
						type: 'string',
						description: 'Brief explanation of what file you are deleting and why'
					}
				},
				required: ['path', 'reason']
			}
		}
	}
];

async function executeToolCall(toolCall: ToolCall, workingDirectory: string): Promise<FileOperation> {
	fileSystemService.setWorkingDirectory(workingDirectory);

	const args = JSON.parse(toolCall.function.arguments);
	const fullPath = `${workingDirectory}/.taskgrid/${args.path}`;

	try {
		switch (toolCall.function.name) {
			case 'read_file':
				const content = await fileSystemService.readFile(fullPath);
				return {
					type: 'read',
					path: args.path,
					success: true,
					message: `Successfully read ${args.path}`
				};

			case 'write_file':
				await fileSystemService.writeFile(fullPath, args.content);
				return {
					type: 'write',
					path: args.path,
					content: args.content,
					success: true,
					message: `Successfully wrote ${args.path}`
				};

			case 'create_directory':
				await fileSystemService.createDirectory(fullPath);
				return {
					type: 'create_dir',
					path: args.path,
					success: true,
					message: `Successfully created directory ${args.path}`
				};

			case 'list_directory':
				const files = await fileSystemService.listDirectory(fullPath);
				return {
					type: 'list',
					path: args.path,
					success: true,
					message: `Directory ${args.path} contains:\n${files.map(f => `- ${f.split('/').pop()}`).join('\n')}`
				};

			case 'delete_file':
				await fileSystemService.deleteFile(fullPath);
				return {
					type: 'delete',
					path: args.path,
					success: true,
					message: `Successfully deleted ${args.path}`
				};

			default:
				return {
					type: 'read',
					path: args.path,
					success: false,
					message: `Unknown tool: ${toolCall.function.name}`
				};
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return {
			type: 'read',
			path: args.path,
			success: false,
			message: `Error executing ${toolCall.function.name}: ${message}`
		};
	}
}

export async function sendChatMessage(
	messages: ChatMessage[],
	config: Config,
	workingDirectory: string,
	onFileOperation?: (operation: FileOperation) => void
): Promise<string> {
	if (!config.openrouter.apiKey) {
		throw new Error('API key is missing');
	}

	if (!config.openrouter.model) {
		throw new Error('Model is not selected');
	}

	fileSystemService.setWorkingDirectory(workingDirectory);

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${config.openrouter.apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: config.openrouter.model,
			messages,
			tools: fileTools,
			tool_choice: 'auto'
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`API request failed: ${error}`);
	}

	const data = await response.json();
	const assistantMessage = data.choices[0].message;

	if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
		messages.push(assistantMessage as ChatMessage);

		const toolResponses: Array<{ tool_call_id: string; content: string }> = [];

		for (const toolCall of assistantMessage.tool_calls) {
			const operation = await executeToolCall(toolCall, workingDirectory);
			
			if (onFileOperation) {
				onFileOperation(operation);
			}

			let responseContent: string;
			
			if (operation.success) {
				switch (operation.type) {
					case 'read':
						const fileContent = await fileSystemService.readFile(`${workingDirectory}/.taskgrid/${operation.path}`);
						responseContent = JSON.stringify({
							success: true,
							path: operation.path,
							content: fileContent
						});
						break;
					case 'list':
						responseContent = JSON.stringify({
							success: true,
							path: operation.path,
							directory_listing: operation.message
						});
						break;
					default:
						responseContent = JSON.stringify({
							success: true,
							message: operation.message
						});
				}
			} else {
				responseContent = JSON.stringify({
					success: false,
					error: operation.message
				});
			}

			toolResponses.push({
				tool_call_id: toolCall.id,
				content: responseContent
			});

			messages.push({
				role: 'tool',
				content: responseContent,
				tool_call_id: toolCall.id
			} as ChatMessage);
		}

		const followUpResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${config.openrouter.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: config.openrouter.model,
				messages,
				tools: fileTools,
				tool_choice: 'auto'
			})
		});

		if (!followUpResponse.ok) {
			const error = await followUpResponse.text();
			throw new Error(`Follow-up API request failed: ${error}`);
		}

		const followUpData = await followUpResponse.json();
		return followUpData.choices[0].message.content;
	}

	return assistantMessage.content;
}

export async function getChatContext(
	workingDirectory: string,
	messages: ChatMessage[]
): Promise<ChatMessage[]> {
	fileSystemService.setWorkingDirectory(workingDirectory);

	const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
	
	if (!lastUserMessage) {
		return messages;
	}

	const userText = lastUserMessage.content.toLowerCase();
	const needsContext = /file|read|write|edit|create|folder|directory|task|project|config|wiki|logic|skill/i.test(userText);

	if (!needsContext) {
		return messages;
	}

	try {
		const contexts = await fileSystemService.getTaskgridFiles(5, 2);
		
		if (contexts.length > 0) {
			const contextString = fileSystemService.formatContextForLLM(contexts);
			
			return [
				{
					role: 'system',
					content: `You have access to files in the .taskgrid workspace. Here are some files available for context:\n\n${contextString}\n\nYou can use file operations to read, write, create, list, or delete files within the .taskgrid folder. Always provide the full relative path when referencing files.`
				},
				...messages
			];
		}
	} catch (error) {
		console.error('Error loading file context:', error);
	}

	return messages;
}
