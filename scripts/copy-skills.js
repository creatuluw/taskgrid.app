import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const sourceDir = '.agents/skills';
const targetDir = 'src-tauri/resources/.agents/skills';

if (!existsSync(sourceDir)) {
	console.log('Source .agents/skills directory not found');
	process.exit(0);
}

if (!existsSync(targetDir)) {
	mkdirSync(targetDir, { recursive: true });
}

const fs = await import('fs/promises');

async function copyDirectory(source, target) {
	const entries = await fs.readdir(source, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(source, entry.name);
		const destPath = join(target, entry.name);

		if (entry.isDirectory()) {
			await fs.mkdir(destPath, { recursive: true });
			await copyDirectory(srcPath, destPath);
		} else {
			await fs.copyFile(srcPath, destPath);
		}
	}
}

await copyDirectory(sourceDir, targetDir);
console.log('Skills copied to Tauri resources');
