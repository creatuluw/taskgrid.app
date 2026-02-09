---
name: how-to-use-taskgrid
description: Guide for using TaskGrid.app, a secure desktop application that provides a sandboxed file system environment for AI-assisted development. This skill covers the app's security model, file operations, OpenRouter AI integration, and best practices for AI-powered development workflows.
license: Complete terms in LICENSE.txt
---

# How to Use TaskGrid.app

TaskGrid.app is a secure desktop application that provides a sandboxed file system environment for AI-assisted development workflows. It combines a secure workspace with AI integration through OpenRouter, enabling safe and productive AI-powered coding and project management.

## Quick Start

### Installation & Setup

1. **Install TaskGrid.app**
   - Download the latest release from the official repository
   - Install the application on your system (Windows, macOS, or Linux)
   - Launch TaskGrid.app - it starts maximized with a dark theme

2. **Create Your First Project**
   - Select or create a working directory for your project
   - TaskGrid automatically creates a `.taskgrid/` folder in your chosen directory
   - This folder serves as your secure sandbox - all file operations are restricted here

3. **Configure OpenRouter (Optional but Recommended)**
   - Click the OpenRouter configuration button
   - Enter your OpenRouter API key from [openrouter.ai/keys](https://openrouter.ai/keys)
   - Click "Refresh Models" to fetch available AI models
   - Select your preferred model (e.g., `anthropic/claude-3.5-sonnet`, `openai/gpt-4`)
   - Save the configuration

### Basic Workflow

1. **Navigate Files**: Use the file tree component to browse your `.taskgrid` directory
2. **Read Files**: Click on files to read their contents safely
3. **Write Files**: Create and modify files within the sandbox
4. **Use AI**: Leverage configured OpenRouter models for assistance

## Core Concepts

### Security Sandbox Model

TaskGrid implements a strict security model:

- **Restricted File Access**: All file operations are confined to `.taskgrid/` subdirectories within your chosen working directory
- **Path Traversal Protection**: Prevents access to files outside the sandbox (no `../`, symlinks to parent directories, etc.)
- **Safe Operations**: Read, write, delete, and directory creation all validate paths before execution
- **Working Directory Isolation**: Each project maintains its own isolated `.taskgrid/` workspace

**Why this matters**: This prevents AI agents or automated scripts from accidentally accessing or modifying system files, user documents, or other sensitive data outside the project scope.

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

## Basic Usage

### File Navigation

1. **Expand/Collapse Directories**: Click folder icons in the file tree
2. **Select Files**: Click file names to read their contents
3. **Visual Indicators**:
   - 📁 **Closed folder**: Directory with collapsed children
   - 📂 **Open folder**: Directory with expanded children
   - 📄 **File**: Regular file

### File Operations

#### Reading Files

- Click on any file in the file tree to read its contents
- Files are read safely within the sandbox boundaries
- File contents are displayed in the main application window

#### Writing Files

- Create new files within the `.taskgrid/` directory structure
- Edit existing files with full read/write permissions
- Changes are immediately saved to the file system

#### Directory Management

- Create nested directory structures within `.taskgrid/`
- Delete files and directories as needed
- All operations are validated for security

### Configuration Management

#### OpenRouter Configuration

Location: `.taskgrid/config/openrouter.json`

```json
{
  "openrouter": {
    "apiKey": "your-api-key-here",
    "model": "model-id",
    "modelName": "Human Readable Model Name"
  }
}
```

**Configuration Steps**:
1. Access the OpenRouter configuration panel
2. Enter your API key (stored locally, never sent to external servers)
3. Fetch available models by clicking "Refresh Models"
4. Select your preferred model from the dropdown
5. Save the configuration

## AI Integration

### Setting Up OpenRouter

1. **Get an API Key**
   - Visit [openrouter.ai](https://openrouter.ai)
   - Create an account and generate an API key
   - Keep your key secure - it's stored locally on your machine

2. **Choose a Model**
   - Popular choices: `anthropic/claude-3.5-sonnet`, `openai/gpt-4`, `meta-llama/llama-3.1-70b`
   - Consider cost, speed, and capability trade-offs
   - Test different models to find what works for your workflow

3. **Integrate AI in Workflows**
   - Use configured models for code generation
   - Get assistance with debugging and optimization
   - Leverage AI for documentation and explanation

### AI-Powered Development Patterns

#### Pattern 1: Code Generation

```markdown
1. Create a new file in .taskgrid/projects/
2. Prompt the AI: "Create a Python script for data analysis"
3. Review generated code in the file tree
4. Modify and refine as needed
```

#### Pattern 2: Code Review

```markdown
1. Open existing files in the file tree
2. Request AI review: "Analyze this code for security issues"
3. Implement suggested improvements
4. Save changes to sandbox
```

#### Pattern 3: Debugging Assistance

```markdown
1. Read error messages or problematic code
2. Provide context to AI: "This function fails with error X"
3. Receive debugging suggestions
4. Test fixes within the safe sandbox
```

## Advanced Features

### Project Organization

**Multiple Workspaces**:
- Each working directory creates an isolated `.taskgrid/` sandbox
- Switch between projects by selecting different working directories
- Projects maintain separate configurations and skills

**Skill Integration**:
- Place skill definitions in `.taskgrid/skills/`
- Skills extend TaskGrid's capabilities with domain-specific knowledge
- Reference the `skill-creator.md` for creating custom skills

### Secure Development Workflows

**Isolated Testing**:
- Test code in sandbox before deploying to production
- Experiment with new libraries or APIs safely
- Develop and debug without affecting system files

**AI Agent Safety**:
- Run AI agents with limited file system access
- Prevent unintended modifications to critical files
- Maintain audit trails of all file operations

### Automation Integration

**Script Execution**:
- Create automation scripts within `.taskgrid/`
- Execute repetitive tasks safely
- Automate build, test, and deployment workflows

**CI/CD Integration**:
- Use TaskGrid as part of larger development pipelines
- Maintain consistent environments across teams
- Combine with version control for reproducible builds

## Best Practices

### Security Practices

1. **Never Store Secrets Outside Sandbox**
   - Keep API keys, credentials in `.taskgrid/config/`
   - Avoid hardcoding sensitive data in project files
   - Use environment variables when possible

2. **Validate Before Executing**
   - Review AI-generated code before running
   - Test in sandbox first, then promote to production
   - Understand what file operations will occur

3. **Regular Backups**
   - Backup your `.taskgrid/` directories regularly
   - Version control important project files
   - Document configuration changes

### Organization Practices

1. **Structure Projects Logically**
   ```
   .taskgrid/
   ├── config/          # Configuration files
   ├── projects/        # Active projects
   │   ├── project-a/
   │   └── project-b/
   ├── skills/          # Custom skills
   └── temp/            # Temporary files
   ```

2. **Use Descriptive Filenames**
   - `data-analysis-script.py` vs `script1.py`
   - Maintain consistency across projects
   - Include dates for versioned files

3. **Document Workflows**
   - Create README files for complex projects
   - Document AI model choices and reasoning
   - Track dependencies and requirements

### Productivity Tips

1. **Optimize Model Selection**
   - Use faster models for simple tasks (e.g., code generation)
   - Use more capable models for complex reasoning
   - Balance speed vs. quality based on task importance

2. **Batch Similar Operations**
   - Group similar file operations together
   - Process multiple files in a single AI request
   - Minimize context switching

3. **Leverage Skills**
   - Create reusable skills for common tasks
   - Share skills across team members
   - Continuously refine and improve skills

### AI Collaboration Guidelines

1. **Provide Clear Context**
   - Explain your goals and constraints upfront
   - Include relevant code snippets and error messages
   - Specify output format requirements

2. **Iterate and Refine**
   - Start with simple prompts, then add complexity
   - Ask AI to explain its reasoning
   - Request alternative approaches when needed

3. **Validate AI Suggestions**
   - Test all code in sandbox first
   - Verify security implications
   - Consider performance and maintainability

## Troubleshooting

### Common Issues

#### Issue: "Access denied: Path is outside .taskgrid folder"

**Cause**: Attempting to access files outside the sandbox

**Solution**:
- Ensure all file operations are within `.taskgrid/` directory
- Check for path traversal attempts (`../`)
- Verify working directory is set correctly

#### Issue: "Failed to fetch models"

**Cause**: Invalid API key or network issues

**Solution**:
- Verify OpenRouter API key is correct
- Check internet connection
- Confirm OpenRouter service status
- Try refreshing models again

#### Issue: Files not appearing in file tree

**Cause**: Files created outside sandbox or UI not updated

**Solution**:
- Verify files exist in `.taskgrid/` directory
- Refresh file tree view
- Check file permissions

#### Issue: Configuration not saving

**Cause**: File system permissions or disk space

**Solution**:
- Verify write permissions to `.taskgrid/config/`
- Check available disk space
- Ensure directory exists before writing

### Debug Mode

To enable detailed logging for troubleshooting:

1. Open TaskGrid.app with debug flags (if supported)
2. Check console output for error messages
3. Review `.taskgrid/` directory for unexpected files
4. Contact support with error details and reproduction steps

### Getting Help

- **Documentation**: Check this skill and `skill-creator.md` for detailed guidance
- **Community**: Visit the TaskGrid.app repository for issues and discussions
- **Support**: Report bugs or request features through official channels

## Next Steps

1. **Explore the Skills System**: Read `skill-creator.md` to learn how to create custom skills
2. **Review Task Clarification**: Check `task-clarification.md` for requirements gathering workflows
3. **Build Your First Project**: Create a simple project using the secure sandbox
4. **Integrate AI Models**: Configure OpenRouter and start leveraging AI assistance
5. **Join the Community**: Share your experiences and learn from other users

TaskGrid.app is designed to provide a secure, productive environment for AI-assisted development. Start with the Quick Start section, then explore advanced features as you become comfortable with the platform. The security model ensures you can experiment and innovate without risking your system files or sensitive data.