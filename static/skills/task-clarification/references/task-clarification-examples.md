# Task Clarification Examples

## Example 1: Simple Request

**User:** "Add a reset password feature to the login flow"

**Agent:** "Got it. Let me confirm my understanding: you want to add a 'Forgot Password' link on the login page that sends users a reset email, and a page where they can set a new password using a token from the email. Is that correct?"

**User:** "Yes"

**Agent:** "This task requires frontend form handling and backend email service integration. Does the team have these capabilities available?"

**User:** "Yes, we have frontend developers and backend engineers familiar with email services."

**Agent:** [Proceeds to Step 2: Spec Store]

---

## Example 2: Medium Request

**User:** "We need a notification system that can send emails and push notifications"

**Agent:** "Question 1/3: Should notifications be sent immediately or can they be queued and sent in batches?"

**User:** "Immediately for critical alerts, batched for others"

**Agent:** "Question 2/3: Do you need users to be able to manage their notification preferences (what types, frequency, channels)?"

**User:** "Yes, they should be able to opt-in/out of different notification types"

**Agent:** "Question 3/3: Should we track delivery status (sent, delivered, opened, clicked)?"

**User:** "Just delivered status is fine"

**Agent:** "This requires backend queue management, email service API integration, and potentially SMS API integration. Is the team familiar with these technologies?"

**User:** "We have experience with email APIs but not SMS. Can we focus on email only for now?"

**Agent:** "Absolutely. That's noted as a constraint. I'll prepare the requirements summary."

**Agent:** [Prepares requirements summary and asks for confirmation]

---

## Example 3: Complex Request

**User:** "Build a real-time analytics dashboard"

**Agent:** "Question 1/5: What data sources will the dashboard connect to, and how frequently is data updated?"

**User:** "We have a PostgreSQL database and some event logs. Data is continuously generated"

**Agent:** "Question 2/5: How many users will be viewing the dashboard simultaneously, and what's the expected data volume per day?"

**User:** "Around 50 concurrent users, maybe 1 million events per day"

**Agent:** "Question 3/5: What kind of visualizations do you need (line charts, bar charts, heatmaps, tables, etc.)?"

**User:** "We'll need line charts for trends, a few bar charts, and some key metrics displayed as cards"

**Agent:** "Question 4/5: Do you need historical data viewing with time ranges (last hour, last day, last week), or just real-time current state?"

**User:** "Both real-time and historical with customizable time ranges"

**Agent:** "Question 5/5: Are there specific performance requirements for data loading and dashboard responsiveness?"

**User:** "Data should load within 2 seconds, dashboard should update every 5 seconds"

**Agent:** "This requires real-time data streaming expertise (WebSockets or similar), frontend data visualization library knowledge (Chart.js, D3, etc.), and potentially database optimization skills. Does the team have these capabilities?"

**User:** "We have frontend developers familiar with Chart.js, but real-time data streaming would be new. Can you provide guidance?"

**Agent:** "Noted. I'll include real-time streaming as a skill gap to address, and suggest approaches. Preparing requirements summary now."

**Agent:** [Prepares detailed requirements summary and asks for confirmation]

---

## Question Pattern Examples

### Good Questioning
❌ **Bad:**
```
Here are my questions:
1. What should the search filter by?
2. Should it support partial matches?
3. How should results be sorted?
```

✅ **Good:**
```
Question 1/2: What fields should the search filter by (name, email, tags, etc.)?
```
[Wait for answer]
```
Question 2/2: Should search support partial matches and fuzzy matching?
```

### Targeted vs Vague Questions

❌ **Bad (Too Vague):**
- "What features do you want?"
- "How should it work?"
- "Any requirements?"

✅ **Good (Specific):**
- "Should the search support pagination or infinite scroll?"
- "Do you want search results highlighted when they match?"
- "Should search handle typos and provide suggestions?"

### User Experience vs Technical Details

❌ **Bad (Technical Implementation):**
- "Should we use React or Vue?"
- "What database schema do you want?"
- "Should we use REST or GraphQL?"

✅ **Good (User Experience):**
- "What user experience should we provide for slow searches?"
- "How often do you expect the data to change?"
- "Do you need real-time updates to search results?"

### Skills Assessment Examples

❌ **Bad:**
- "Do we need a backend developer?"
- "Should we hire someone?"

✅ **Good:**
- "This task requires knowledge of database optimization and query performance tuning. Is there team member with these skills?"
- "The implementation would benefit from experience with real-time data processing. Do we have that expertise available?"
- "This requires integrating with the Stripe API for payment processing. Is there someone familiar with payment gateway integrations?"