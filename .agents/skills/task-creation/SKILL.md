---
name: task-creation
description: Create comprehensive, well-structured task specifications with complete requirements, acceptance criteria, and deliverables. Use when user needs to define tasks, break down work into specifications, create task documentation, or needs help structuring work with clear requirements, dependencies, and success metrics. Ideal for planning development tasks, project planning, or organizing work before execution.
---

# Task Creation

## Goals

Create comprehensive task specifications that enable:
- **Complete clarity**: All necessary information gathered and documented upfront
- **Consistent format**: Standardized structure following template-task.md for reproducibility
- **Actionable specifications**: Clear requirements, acceptance criteria, and deliverables
- **Dependency awareness**: Explicit dependencies and prerequisites identified
- **Success definition**: Clear metrics and criteria for task completion

## Permissions

**Required:**
- File system read/write access to project directories
- Ability to read template-task.md for format reference
- Write access to create task specification files

**Scope:**
- Can read project files and documentation to gather context
- Can create task specification files (.md or other formats)
- Cannot modify production files or system configurations
- Cannot execute code or make changes without explicit user approval

## Tool Usage

**Required Tools:**
- `read_file` - Examine template-task.md and project context
- `edit_file` - Create task specification files
- `list_directory` - Explore project structure and resources

**Command Patterns:**
```bash
# Read template for format reference
read_file references/template-task.md

# Read project context
read_file README.md
read_file package.json
read_file project-config.yml

# Create task specification
edit_file -path <task-spec.md> -mode create

# Explore project structure
list_directory ./src/
list_directory ./
```

**Tool Call Sequence:**
1. Read template-task.md to understand required format
2. Explore project structure and documentation for context
3. Gather requirements through user interaction
4. Create task specification following template format
5. Validate completeness against template requirements

## Triggers

Use this skill when the user:
- Requests to "create a task specification", "define a task", or "specify work"
- Mentions "task breakdown", "work documentation", or "specification"
- Asks to "plan development", "define requirements", or "document work"
- Wants to "structure work", "create project specs", or "define acceptance criteria"
- References "task creation", "specification writing", or "work planning"
- Needs help organizing complex work into clear, actionable specifications

## Acceptance Criteria

1. **Completeness**: Task specification contains all sections from template-task.md with no missing or placeholder content

2. **Clarity**: Each section provides specific, actionable information that can be understood without additional context

3. **Measurability**: Acceptance criteria are specific, testable, and can be objectively verified

4. **Dependency Accuracy**: All dependencies are identified with current status and clear relationship to the task

5. **Deliverable Specificity**: Deliverables are clearly defined with expected format and content

6. **Success Definition**: Success metrics include quantitative measures or clear qualitative criteria

## Core Instructions

### Step 1: Understand the Work Requirements

Engage with the user to gather complete understanding of the task:
- **Ask one question at a time** to build comprehensive picture
- **Focus on**: objectives, scope, constraints, success criteria, technical context
- **Explore project context**: Read relevant documentation, existing code, configuration files
- **Identify stakeholders**: Who will use, review, or depend on this work?
- **Determine priorities**: Must-haves vs. nice-to-haves

**If requirements are unclear or incomplete:**
- Use the **task-clarification** skill to gather comprehensive requirements through targeted questioning
- Task-clarification will assess complexity, identify required skills, and generate a requirements summary
- This ensures you have all necessary information before proceeding to create the task specification

**Essential questions to explore:**
- "What is the primary objective or goal of this task?"
- "What specific problem are we solving or value are we delivering?"
- "Who will be the users or stakeholders for this work?"
- "Are there technical constraints or limitations I should know about?"
- "What does successful completion look like? How will we measure it?"
- "What files, systems, or components will be involved?"
- "Are there dependencies on other tasks, people, or resources?"
- "What are the timeline constraints or deadlines?"
- "What risks or edge cases should we consider?"

### Step 2: Gather Technical Context

Read relevant project files to understand technical environment:
- **Project structure**: Explore directories, identify relevant files
- **Documentation**: Read README, docs, configuration files
- **Code patterns**: Examine similar work or existing implementations
- **Dependencies**: Check package.json, requirements.txt, or similar
- **Environment**: Understand development, testing, and production contexts

**Context gathering checklist:**
- [ ] Project overview and architecture documentation
- [ ] Relevant code files and their structure
- [ ] Dependencies and version requirements
- [ ] Configuration files and environment settings
- [ ] Existing patterns or conventions to follow
- [ ] Testing frameworks and build tools
- [ ] Deployment or integration requirements

### Step 3: Define Requirements and Specifications

Translate understanding into clear, structured requirements:
- **Primary requirements**: Core functionality that must be implemented
- **Secondary requirements**: Enhancements or additional features
- **Technical specifications**: Specific implementation details, APIs, frameworks
- **Constraints**: Technical, time, resource, or scope limitations

**If requirements are ambiguous or missing critical details:**
- Return to **task-clarification** skill to ask targeted follow-up questions
- Focus on clarifying specific gaps: edge cases, performance requirements, integration needs
- Update requirements summary from task-clarification with new insights

**Requirements definition guidelines:**
- **Specific**: Use concrete language, avoid vague terms
- **Measurable**: Include metrics or quantifiable criteria where possible
- **Achievable**: Ensure requirements are technically feasible
- **Relevant**: Each requirement should directly support the objective
- **Testable**: Each requirement should be verifiable

**Example requirement structure:**
```
Primary: Implement user authentication with JWT tokens
- Support login and logout functionality
- Use bcrypt for password hashing
- Token expiration: 24 hours
```

### Step 4: Create Task Specification

Create task specification following the exact format in template-task.md:

```markdown
# Task Specification Template

## Title
[Clear, descriptive title of the task]

## Context
[Brief background explaining what we're doing and why]

## Requirements

### Primary Requirements
[Core functional requirements]

### Secondary Requirements
[Additional features or enhancements]

### Technical Specifications
[Specific technical details, file paths, APIs]

### Constraints
[Limitations and restrictions]

## Acceptance Criteria
[Specific, testable criteria for completion]

## Dependencies
[Prerequisites and blockers]

## Resources Needed
[Files, tools, permissions, external resources]

## Deliverables
[All outputs and artifacts]

## Success Metrics
[Measurable indicators of success]

## Notes
[Additional context and considerations]
```

**Writing guidelines for each section:**

**Title**: Use action-oriented, descriptive naming
- "Implement user authentication system" (good)
- "Auth task" (too vague)

**Context**: Provide 2-4 sentences of background
- What problem are we solving?
- Why is this work important?
- Who benefits from this work?

**Requirements**: Break down into specific categories
- Primary: Must-have functionality
- Secondary: Nice-to-have features
- Technical: Implementation details, frameworks, APIs
- Constraints: Time, resources, technical limitations

**Acceptance Criteria**: Create 3-7 specific criteria
- Start with verbs: "Implement", "Verify", "Ensure"
- Make each testable: "Login works with valid credentials" vs. "Good UX"
- Include edge cases: "Handle invalid input gracefully"

**Dependencies**: List all prerequisites
- Mark status: completed, in progress, blocked
- Be specific: "Database schema migration (completed)"

**Resources Needed**: Categorize by type
- Files/directories: Specific paths
- Tools/technologies: Frameworks, libraries
- Permissions: Access rights needed
- External resources: APIs, documentation

**Deliverables**: List all tangible outputs
- Code changes (files modified/created)
- Documentation (updates or new docs)
- Tests (test files or test coverage)
- Configuration changes

**Success Metrics**: Define measurable outcomes
- Quantitative: "Response time < 200ms", "100% test coverage"
- Qualitative: "User reports satisfaction > 4/5"

**Notes**: Capture important details
- Assumptions made
- Risks or concerns
- Future considerations
- Known issues or edge cases

### Step 5: Validate Completeness

Review task specification against template requirements:

**Validation checklist:**
- [ ] All sections from template are present
- [ ] No placeholder text remains
- [ ] Each section has specific, actionable content
- [ ] Requirements are clear and unambiguous
- [ ] Acceptance criteria are testable
- [ ] Dependencies are accurately identified with status
- [ ] Deliverables match requirements
- [ ] Success metrics are measurable
- [ ] Technical context is accurate
- [ ] Format matches template-task.md exactly

### Step 6: Review with User

Present specification for feedback:
- **Summarize**: Provide 2-3 sentence overview
- **Highlight key aspects**: Primary requirements, success metrics, timeline
- **Request feedback**: "Does this capture your requirements completely?"
- **Iterate**: Adjust based on user feedback before finalizing

**Review format:**
```
I've created a task specification for [task title]:

**Overview**: [2-3 sentence summary]

**Key Requirements**: [list primary requirements]

**Success Criteria**: [list key acceptance criteria]

**Deliverables**: [list main deliverables]

Does this accurately capture what you need? [yes/no/adjust]
```

## Decision Management

### Granularity

**When to create multiple specifications:**
- Task spans multiple distinct phases or components
- Different teams or individuals will work on different parts
- Timeline allows for phased delivery
- Risk can be reduced by separating concerns

**When to combine into one specification:**
- Work is tightly integrated and difficult to separate
- Single individual or team will complete entire task
- Combined specification provides better context
- Dependencies make separation impractical

### Detail Level

**High detail when:**
- Work is complex or technically challenging
- Multiple people need clear understanding
- Task has critical success factors
- Risk is high if misunderstood

**Moderate detail when:**
- Work follows established patterns
- Team is familiar with domain
- Requirements are straightforward

**Minimal detail when:**
- Task is simple and well-understood
- Work follows standard procedures
- User prefers high-level guidance

### When to Use Task-Clarification

**Use task-clarification when:**
- Requirements are vague or incomplete (e.g., "build a platform like Facebook")
- Multiple features or integrations are mentioned without clear scope
- Success criteria are undefined or ambiguous (e.g., "make it better")
- Technical constraints or skills availability are unclear
- Complexity level cannot be determined from initial description
- Edge cases or special requirements need clarification

**Task-clarification provides:**
- Complexity assessment (simple, medium, complex)
- Required skills identification and team availability check
- Functional and non-functional requirements
- Constraints, assumptions, and out-of-scope items
- Clear acceptance criteria

**Integration with task-creation:**
1. Start with task-clarification for requirements gathering
2. Use task-clarification output to populate task specification sections
3. Return to task-clarification if gaps emerge during specification
4. Final specification validates against task-clarification summary

### Requirements Priority

**Must-haves**: Requirements without which task is considered failed
- Core functionality
- Critical quality attributes
- Regulatory or compliance needs

**Should-haves**: Important but not critical requirements
- Important features
- Performance targets (if not critical)
- User experience enhancements

**Nice-to-haves**: Enhancements that add value but aren't essential
- Future-proofing features
- Additional documentation
- Enhanced error messages

## Human Interaction

### When to Request Clarification

**Use task-clarification skill when:**
- Initial requirements are vague or incomplete
- Need systematic questioning to gather comprehensive requirements
- Complexity and required skills need formal assessment
- Multiple features or integrations need clear scoping

**Direct questioning (without task-clarification) when:**
- Specific, single-point clarification is needed
- Requirements are mostly clear but need minor adjustment
- Technical approach needs decision between known options
- User preferences for implementation details

**Request format:**
```
I need clarification on [aspect]:

[Specific question or concern]

Could you provide more details on [what's needed]?
```

### When to Offer Options

**Recommended when:**
- Multiple technical approaches are viable
- Different priority levels are possible
- Timeline and scope can be adjusted
- Resource allocation can vary

**Request format:**
```
For [requirement], I see a few options:

Option A: [description]
- Pros: [benefits]
- Cons: [drawbacks]

Option B: [description]
- Pros: [benefits]
- Cons: [drawbacks]

Which approach would you prefer?
```

### When to Validate Understanding

**Required when:**
- Requirements are complex or involve many stakeholders
- Task has critical dependencies
- Failure risk is high
- User is uncertain about scope

**Validation format:**
```
Based on our discussion, here's my understanding:

**Objective**: [what we're accomplishing]
**Scope**: [what's included/excluded]
**Key Requirements**: [list]
**Success Criteria**: [list]

Is this accurate? [yes/no/adjust]
```

## Limits

### What This Skill Does Not Cover

- **Task execution**: This skill creates specifications, not executes tasks
- **Project management**: Does not manage timelines, resources, or team coordination
- **Code generation**: Does not write implementation code (may provide examples)
- **Test execution**: Does not run tests or verify functionality
- **Deployment**: Does not handle deployment or infrastructure

### Anti-Use Cases

Do NOT use this skill for:
- Simple to-do lists without detailed requirements
- One-off commands or quick fixes
- Conversations without intent to document
- Tasks requiring immediate execution without specification
- Work that doesn't benefit from detailed planning

### Resource Requirements

- **Template access**: Must have access to template-task.md
- **Project context**: Ability to read project files and documentation
- **User availability**: Requires user input for requirements and validation
- **File system access**: Must be able to create specification files

## References

- **Template format**: See [template-task.md](references/template-task.md) for exact specification structure
- **Task clarification**: Use [task-clarification](../task-clarification/SKILL.md) skill when requirements are unclear or incomplete to gather comprehensive requirements through targeted questioning
- **Best practices**: Follow progressive disclosure principle - include only essential information in SKILL.md
- **Validation**: Always verify completeness against template requirements before finalizing
