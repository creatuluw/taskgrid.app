---
name: task-clarification
description: Gather and clarify requirements through targeted questioning to ensure complete understanding before implementation
license: Complete terms in LICENSE.txt
author: TaskGrid Team
created: 2025-01-18
updated: 2025-01-18
tags: [requirements, clarification, questioning, TE9.DEV]
use_case: Use when executing Step 1 of the TE9.DEV workflow to clarify requirements before implementation
category: workflow
---

# Task Clarification - Requirements Gathering

## Quick Start

### Purpose
Gather and clarify requirements through targeted questioning to ensure complete understanding before implementation. Use this for Step 1 of the TE9.DEV workflow.

### Determine Complexity
Quickly assess complexity and number of questions:

- **Simple (0-1 question)**: Clear request, single feature, no integrations
- **Medium (2-3 questions)**: Multiple features, some integration, multiple flows
- **Complex (4-5 questions)**: Large feature, multiple systems, performance/security critical

### Question Guidelines
1. **Ask ONE BY ONE** with numbering (e.g., "Question 1/3: ...")
2. **Be targeted and specific** - avoid vague questions like "What features do you want?"
3. **Focus on user experience**, not technical implementation
4. **Always assess required skills** after gathering functional requirements

### Required Skills Assessment
After clarifying requirements, identify needed skills:
- Frontend: React/Vue/Svelte, CSS, state management
- Backend: Node.js/Python, APIs, authentication, databases
- DevOps: Docker/Kubernetes, CI/CD, cloud services
- Data: SQL/NoSQL, data modeling, ETL
- Integration: Third-party APIs, webhooks, OAuth/JWT
- Specialized: Real-time systems, security, performance optimization

Ask: "This task requires [specific skills]. Are these available to the team?"

### Generate Requirements Summary
Use the template at `references/requirements-summary-template.md` to document:
- Original request
- Complexity level
- Functional and non-functional requirements
- Required skills and team availability
- Constraints and assumptions
- Out of scope items
- Acceptance criteria

### Verify Before Proceeding
- [ ] Complexity level determined
- [ ] Questions asked one-by-one (max 5)
- [ ] Required skills identified and team availability assessed
- [ ] Requirements summary prepared
- [ ] User confirmation received

Proceed to **Step 2: Spec Store** after confirmation.

---

## Advanced Features

### Complexity Assessment Details

#### Simple Characteristics
- Single feature or bug fix
- No integrations or dependencies
- Familiar domain
- Example: "Add a search bar to homepage"

#### Medium Characteristics
- Multiple features or components
- Some integration requirements
- Multiple user flows
- Example: "Implement user authentication with Google and GitHub"

#### Complex Characteristics
- Large feature spanning multiple systems
- Significant architectural changes
- Multiple external service integrations
- Performance or security critical
- Example: "Build real-time collaboration with document editing"

### Targeted Questioning Patterns

#### For Web Development
- Responsive behavior (mobile/tablet/desktop)?
- Accessibility requirements (WCAG level)?
- Browser support scope?
- Dark mode support?

#### For API Development
- Authentication requirements (API keys, OAuth, JWT)?
- Rate limiting needs?
- Error response format requirements?
- API versioning strategy?

#### For Data Processing
- Data source format and structure?
- Expected output format?
- Processing volume and frequency?
- Error handling requirements?

#### For External Integrations
- Specific services to integrate with?
- Authentication mechanism for each?
- Data synchronization requirements?
- Fallback strategies for service outages?

### Red Flags - Stop and Ask

1. **Contradictory requirements**: "Fast but lightweight" (what trade-off?)
2. **Technically infeasible**: "Parse unstructured PDF perfectly"
3. **Unclear scope**: "Build a platform like Facebook" (which parts?)
4. **Missing context**: "Implement the feature" (which feature?)
5. **Ambiguous success criteria**: "Make it better" (in what way?)

### Best Practices

✅ **Do**:
- Focus on what users experience
- Ask about constraints (time, budget, existing tech)
- Identify edge cases explicitly
- Document assumptions clearly
- Get confirmation before proceeding

❌ **Don't**:
- Ask about technical implementation choices
- Ask all questions at once
- Make assumptions about skills availability
- Ignore contradictions or ambiguities
- Proceed without user confirmation

## References

- **Template**: `references/requirements-summary-template.md`
- **Examples**: `references/task-clarification-examples.md`
