import { invoke } from '@tauri-apps/api/core';
import { readTextFile, writeTextFile, readDir, mkdir, exists, lstat } from '@tauri-apps/plugin-fs';

export interface FileOperation {
	type: 'read' | 'write' | 'list' | 'delete' | 'create_dir';
	path: string;
	success: boolean;
	message?: string;
}

export interface FileContext {
	path: string;
	content?: string;
	exists: boolean;
}

class FileSystemService {
	private workingDirectory: string = '';
	private taskgridDir: string = '';

	setWorkingDirectory(dir: string) {
		this.workingDirectory = dir;
		this.taskgridDir = `${dir}/.taskgrid`;
	}

	private validatePath(path: string): boolean {
		if (!this.workingDirectory) return false;
		
		try {
			const normalizedTaskgrid = this.taskgridDir.replace(/\\/g, '/');
			const normalizedPath = path.replace(/\\/g, '/');
			
			const relativePath = normalizedPath.replace(normalizedTaskgrid, '').replace(/^\//, '');
			
			return relativePath === relativePath.replace(/\.\./g, '');
		} catch {
			return false;
		}
	}

	async readFile(path: string): Promise<string> {
		if (!this.validatePath(path)) {
			throw new Error('Invalid file path: Must be within .taskgrid folder');
		}

		try {
			return await invoke('read_file_safe', {
				workingDir: this.workingDirectory,
				filePath: path
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Failed to read file: ${message}`);
		}
	}

	async writeFile(path: string, content: string): Promise<void> {
		if (!this.validatePath(path)) {
			throw new Error('Invalid file path: Must be within .taskgrid folder');
		}

		try {
			await invoke('write_file_safe', {
				workingDir: this.workingDirectory,
				filePath: path,
				content
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Failed to write file: ${message}`);
		}
	}

	async listDirectory(path: string): Promise<string[]> {
		if (!this.validatePath(path)) {
			throw new Error('Invalid directory path: Must be within .taskgrid folder');
		}

		try {
			return await invoke('list_directory_safe', {
				workingDir: this.workingDirectory,
				dirPath: path
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Failed to list directory: ${message}`);
		}
	}

	async deleteFile(path: string): Promise<void> {
		if (!this.validatePath(path)) {
			throw new Error('Invalid file path: Must be within .taskgrid folder');
		}

		try {
			await invoke('delete_file_safe', {
				workingDir: this.workingDirectory,
				filePath: path
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Failed to delete file: ${message}`);
		}
	}

	async createDirectory(path: string): Promise<void> {
		if (!this.validatePath(path)) {
			throw new Error('Invalid directory path: Must be within .taskgrid folder');
		}

		try {
			await invoke('create_directory_safe', {
				workingDir: this.workingDirectory,
				dirPath: path
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Failed to create directory: ${message}`);
		}
	}

	async getFileContext(path: string): Promise<FileContext> {
		try {
			const fileExists = await exists(path);
			
			if (fileExists) {
				const content = await this.readFile(path);
				return {
					path,
					content,
					exists: true
				};
			} else {
				return {
					path,
					exists: false
				};
			}
		} catch (error) {
			return {
				path,
				exists: false
			};
		}
	}

	async getTaskgridFiles(maxFiles: number = 10, maxDepth: number = 2): Promise<FileContext[]> {
		const contexts: FileContext[] = [];
		const visited = new Set<string>();

		async function collectFiles(dirPath: string, depth: number): Promise<void> {
			if (depth > maxDepth || contexts.length >= maxFiles || visited.has(dirPath)) {
				return;
			}

			visited.add(dirPath);

			try {
				const entries = await readDir(dirPath);
				
				for (const entry of entries) {
					if (contexts.length >= maxFiles) break;
					
					if (entry.name) {
						const entryPath = `${dirPath}/${entry.name}`;
						
						try {
							const stats = await lstat(entryPath);
							
							if (stats.isFile) {
								const content = await readTextFile(entryPath);
								contexts.push({
									path: entryPath,
									content,
									exists: true
								});
							} else if (stats.isDirectory) {
								await collectFiles(entryPath, depth + 1);
							}
						} catch {
							continue;
						}
					}
				}
			} catch {
				return;
			}
		}

		await collectFiles(this.taskgridDir, 0);
		return contexts;
	}

	async getFilesFromPaths(paths: string[]): Promise<FileContext[]> {
		const contexts: FileContext[] = [];

		for (const path of paths) {
			if (contexts.length >= 10) break;
			
			if (!this.validatePath(path)) {
				continue;
			}

			const context = await this.getFileContext(path);
			contexts.push(context);
		}

		return contexts;
	}

	formatContextForLLM(contexts: FileContext[]): string {
		if (contexts.length === 0) {
			return 'No files available in context.';
		}

		const sections: string[] = [];

		for (const ctx of contexts) {
			const relativePath = ctx.path.replace(this.taskgridDir, '').replace(/^\//, '');
			
			if (ctx.exists && ctx.content) {
				sections.push(`File: ${relativePath}\n\`\`\`\n${ctx.content}\n\`\`\``);
			} else {
				sections.push(`File: ${relativePath} (does not exist)`);
			}
		}

		return `Available Files:\n\n${sections.join('\n\n')}`;
	}
}

export const fileSystemService = new FileSystemService();
