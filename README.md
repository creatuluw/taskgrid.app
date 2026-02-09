# TaskGrid.app

A secure desktop application that provides a sandboxed file system environment for AI-assisted development workflows. TaskGrid combines a secure workspace with AI integration through OpenRouter, enabling safe and productive AI-powered coding and project management.

## Features

- **Secure Sandbox Environment**: All file operations are confined to a `.taskgrid/` directory, preventing access to system files and sensitive data
- **AI Integration**: Seamless integration with OpenRouter API for accessing state-of-the-art AI models (Claude, GPT-4, Llama, and more)
- **Modern UI**: Built with SvelteKit and Tauri for a responsive, cross-platform desktop application
- **Safe Development**: Test code, run scripts, and experiment without risking your system files
- **Skills System**: Extend TaskGrid's capabilities with custom skills for domain-specific workflows

## Quick Start

### Installation

1. Download the latest release from the official repository
2. Install the application on your system (Windows, macOS, or Linux)
3. Launch TaskGrid.app - it starts maximized with a dark theme

### Create Your First Project

1. Select or create a working directory for your project
2. TaskGrid automatically creates a `.taskgrid/` folder in your chosen directory
3. This folder serves as your secure sandbox - all file operations are restricted here

### Configure OpenRouter (Recommended)

1. Click the OpenRouter configuration button
2. Enter your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
3. Click "Refresh Models" to fetch available AI models
4. Select your preferred model (e.g., `anthropic/claude-3.5-sonnet`, `openai/gpt-4`)
5. Save the configuration

## Core Concepts

### Security Sandbox Model

TaskGrid implements a strict security model to protect your system:

- **Restricted File Access**: All file operations are confined to `.taskgrid/` subdirectories
- **Path Traversal Protection**: Prevents access to files outside the sandbox (no `../`, symlinks to parent directories, etc.)
- **Safe Operations**: Read, write, delete, and directory creation all validate paths before execution
- **Working Directory Isolation**: Each project maintains its own isolated `.taskgrid/` workspace

This prevents AI agents or automated scripts from accidentally accessing or modifying system files, user documents, or other sensitive data outside the project scope.

### Architecture

- **Frontend**: SvelteKit web application with modern UI components
- **Backend**: Rust-based Tauri application handling file system operations
- **Communication**: Tauri's IPC (Inter-Process Communication) bridge
- **Configuration**: JSON-based config stored in `.taskgrid/config/`
- **AI Integration**: OpenRouter API for model access

### Directory Structure

```
your-project/
├── .taskgrid/              # TaskGrid sandbox (auto-created)
│   ├── config/            # Application configuration
│   │   └── openrouter.json
│   ├── projects/          # Your project files
│   └── skills/            # Optional skill definitions
└── [other project files]  # Not accessible to TaskGrid
```

## Usage

### File Navigation

- **Expand/Collapse Directories**: Click folder icons in the file tree
- **Select Files**: Click file names to read their contents
- **Visual Indicators**:
  - 📁 **Closed folder**: Directory with collapsed children
  - 📂 **Open folder**: Directory with expanded children
  - 📄 **File**: Regular file

### File Operations

- **Reading Files**: Click on any file in the file tree to read its contents safely
- **Writing Files**: Create new files or edit existing files within the `.taskgrid/` directory
- **Directory Management**: Create nested directory structures and delete files/directories as needed

### Configuration Management

OpenRouter configuration is stored at `.taskgrid/config/openrouter.json`:

```json
{
  "openrouter": {
    "apiKey": "your-api-key-here",
    "model": "model-id",
    "modelName": "Human Readable Model Name"
  }
}
```

## AI Integration

### Setting Up OpenRouter

1. **Get an API Key**: Visit [openrouter.ai](https://openrouter.ai), create an account and generate an API key
2. **Choose a Model**: Popular choices include `anthropic/claude-3.5-sonnet`, `openai/gpt-4`, `meta-llama/llama-3.1-70b`
3. **Integrate AI**: Use configured models for code generation, debugging, documentation, and more

### AI-Powered Development Patterns

**Code Generation**:
1. Create a new file in `.taskgrid/projects/`
2. Prompt the AI: "Create a Python script for data analysis"
3. Review generated code in the file tree
4. Modify and refine as needed

**Code Review**:
1. Open existing files in the file tree
2. Request AI review: "Analyze this code for security issues"
3. Implement suggested improvements
4. Save changes to sandbox

**Debugging Assistance**:
1. Read error messages or problematic code
2. Provide context to AI: "This function fails with error X"
3. Receive debugging suggestions
4. Test fixes within the safe sandbox

## Advanced Features

### Multiple Workspaces

- Each working directory creates an isolated `.taskgrid/` sandbox
- Switch between projects by selecting different working directories
- Projects maintain separate configurations and skills

### Skill Integration

- Place skill definitions in `.taskgrid/skills/`
- Skills extend TaskGrid's capabilities with domain-specific knowledge
- Reference the skill documentation for creating custom skills

### Secure Development Workflows

- **Isolated Testing**: Test code in sandbox before deploying to production
- **AI Agent Safety**: Run AI agents with limited file system access
- **Automation**: Create automation scripts within `.taskgrid/` for repetitive tasks

## Best Practices

### Security

1. **Never Store Secrets Outside Sandbox**: Keep API keys and credentials in `.taskgrid/config/`
2. **Validate Before Executing**: Review AI-generated code before running
3. **Regular Backups**: Backup your `.taskgrid/` directories regularly

### Organization

1. **Structure Projects Logically**:
   ```
   .taskgrid/
   ├── config/          # Configuration files
   ├── projects/        # Active projects
   ├── skills/          # Custom skills
   └── temp/            # Temporary files
   ```

2. **Use Descriptive Filenames**: `data-analysis-script.py` vs `script1.py`
3. **Document Workflows**: Create README files for complex projects

### Productivity

1. **Optimize Model Selection**: Use faster models for simple tasks, more capable models for complex reasoning
2. **Batch Similar Operations**: Group similar file operations together
3. **Leverage Skills**: Create reusable skills for common tasks

### AI Collaboration

1. **Provide Clear Context**: Explain goals and constraints upfront, include relevant code snippets
2. **Iterate and Refine**: Start with simple prompts, then add complexity
3. **Validate AI Suggestions**: Test all code in sandbox first

## Troubleshooting

### Common Issues

**"Access denied: Path is outside .taskgrid folder"**
- Ensure all file operations are within `.taskgrid/` directory
- Check for path traversal attempts (`../`)
- Verify working directory is set correctly

**"Failed to fetch models"**
- Verify OpenRouter API key is correct
- Check internet connection
- Confirm OpenRouter service status

**Files not appearing in file tree**
- Verify files exist in `.taskgrid/` directory
- Refresh file tree view
- Check file permissions

**Configuration not saving**
- Verify write permissions to `.taskgrid/config/`
- Check available disk space
- Ensure directory exists before writing

## Development

TaskGrid is built with:

- **Frontend**: SvelteKit, Svelte, Tailwind CSS
- **Backend**: Tauri (Rust)
- **Build Tools**: Vite, esbuild
- **Package Manager**: npm

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

See LICENSE.txt for complete terms.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

- **Documentation**: Check the skills documentation for detailed guidance
- **Community**: Visit the TaskGrid.app repository for issues and discussions
- **Issues**: Report bugs or request features through official channels

---

TaskGrid.app is designed to provide a secure, productive environment for AI-assisted development. Start with the Quick Start section, then explore advanced features as you become comfortable with the platform. The security model ensures you can experiment and innovate without risking your system files or sensitive data.