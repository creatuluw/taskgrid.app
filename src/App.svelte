<script>
  import { onMount } from 'svelte';
  import TaskGrid from './lib/TaskGrid.svelte';
  import TaskModal from './lib/TaskModal.svelte';
  import { getTasks, createTask, deleteDemoData } from './db.js';

  let tasks = $state([]);
  let showModal = $state(false);

  onMount(() => {
    loadTasks();
  });

  function loadTasks() {
    const storedTasks = getTasks();
    if (storedTasks.length === 0) {
      tasks = generateDemoTasks();
      saveDemoTasks(tasks);
    } else {
      tasks = storedTasks;
    }
  }

  function generateDemoTasks() {
    const taskTypes = ['urgent', 'in_progress', 'bug', 'scheduled', 'secure', 'finance', 'completed', 'contact', 'folder', 'search', 'document', 'idea', 'revert', 'trending', 'save'];
    const demoTasks = [
      { id: 'demo-1', title: 'Update Q4 financial projections', type: 'finance', isDemo: true },
      { id: 'demo-2', title: 'Finalize brand guidelines', type: 'document', isDemo: true },
      { id: 'demo-3', title: 'Email marketing team regarding feedback', type: 'contact', isDemo: true },
      { id: 'demo-4', title: 'Review server logs for Q3 errors', type: 'urgent', isDemo: true },
      { id: 'demo-5', title: 'Schedule kick-off with design agency', type: 'scheduled', isDemo: true },
      { id: 'demo-6', title: 'Approve pending PTO requests', type: 'completed', isDemo: true },
      { id: 'demo-7', title: 'Draft copy for landing page v2', type: 'in_progress', isDemo: true },
      { id: 'demo-8', title: 'Fix CSS overflow bug on mobile', type: 'bug', isDemo: true },
      { id: 'demo-9', title: 'Conduct user interviews (Batch 3)', type: 'search', isDemo: true },
      { id: 'demo-10', title: 'Renew domain subscriptions', type: 'scheduled', isDemo: true },
      { id: 'demo-11', title: 'Archive legacy project repositories', type: 'folder', isDemo: true },
      { id: 'demo-12', title: 'Prepare slide deck for board meeting', type: 'document', isDemo: true },
      { id: 'demo-13', title: 'Audit internal security protocols', type: 'secure', isDemo: true },
      { id: 'demo-14', title: 'Optimize database queries for dashboard', type: 'in_progress', isDemo: true },
      { id: 'demo-15', title: 'Order office supplies: ergonomic chairs', type: 'finance', isDemo: true },
      { id: 'demo-16', title: 'Update README documentation for API', type: 'document', isDemo: true },
      { id: 'demo-17', title: 'Sync with product owner on roadmap', type: 'contact', isDemo: true },
      { id: 'demo-18', title: 'Brainstorm Q1 campaign concepts', type: 'idea', isDemo: true },
      { id: 'demo-19', title: 'Revert deployment #4092', type: 'revert', isDemo: true },
      { id: 'demo-20', title: 'Check analytics for conversion drop', type: 'trending', isDemo: true },
      { id: 'demo-21', title: 'Send invoice to Client X', type: 'finance', isDemo: true },
      { id: 'demo-22', title: 'Refactor authentication module', type: 'secure', isDemo: true },
      { id: 'demo-23', title: 'QA test release candidate 2.1', type: 'bug', isDemo: true },
      { id: 'demo-24', title: 'Backup staging environment', type: 'save', isDemo: true },
      { id: 'demo-25', title: 'Research competitor pricing models', type: 'idea', isDemo: true },
      { id: 'demo-26', title: 'Update team contact directory', type: 'contact', isDemo: true },
      { id: 'demo-27', title: 'Clean up Jira backlog', type: 'folder', isDemo: true },
      { id: 'demo-28', title: 'Organize drive folders', type: 'folder', isDemo: true },
      { id: 'demo-29', title: 'Review intern applications', type: 'search', isDemo: true },
      { id: 'demo-30', title: 'Update mobile app design system', type: 'in_progress', isDemo: true },
      { id: 'demo-31', title: 'Conduct A/B testing on checkout flow', type: 'idea', isDemo: true },
      { id: 'demo-32', title: 'Implement dark mode toggle', type: 'in_progress', isDemo: true },
      { id: 'demo-33', title: 'Optimize images for web performance', type: 'bug', isDemo: true },
      { id: 'demo-34', title: 'Review quarterly budget allocation', type: 'finance', isDemo: true },
      { id: 'demo-35', title: 'Schedule team sync meeting', type: 'scheduled', isDemo: true },
      { id: 'demo-36', title: 'Draft Q1 marketing strategy', type: 'document', isDemo: true },
      { id: 'demo-37', title: 'Fix cross-browser compatibility issues', type: 'bug', isDemo: true },
      { id: 'demo-38', title: 'Update privacy policy documentation', type: 'secure', isDemo: true },
      { id: 'demo-39', title: 'Archive old project files', type: 'folder', isDemo: true },
      { id: 'demo-40', title: 'Reach out to potential partners', type: 'contact', isDemo: true },
      { id: 'demo-41', title: 'Monitor server uptime metrics', type: 'urgent', isDemo: true },
      { id: 'demo-42', title: 'Implement user feedback features', type: 'idea', isDemo: true },
      { id: 'demo-43', title: 'Test payment gateway integration', type: 'bug', isDemo: true },
      { id: 'demo-44', title: 'Update social media assets', type: 'document', isDemo: true },
      { id: 'demo-45', title: 'Review customer support tickets', type: 'search', isDemo: true },
      { id: 'demo-46', title: 'Optimize CSS animations', type: 'in_progress', isDemo: true },
      { id: 'demo-47', title: 'Prepare monthly analytics report', type: 'finance', isDemo: true },
      { id: 'demo-48', title: 'Schedule performance review meetings', type: 'scheduled', isDemo: true },
      { id: 'demo-49', title: 'Update API documentation', type: 'document', isDemo: true },
      { id: 'demo-50', title: 'Finalize year-end budget', type: 'finance', isDemo: true }
    ];

    demoTasks.forEach((task, index) => {
      task.id = `demo-${index + 1}`;
      task.created_at = new Date().toISOString();
      task.updated_at = new Date().toISOString();
      task.status = 'pending';
    });

    return demoTasks;
  }

  function saveDemoTasks(tasksToSave) {
    const STORAGE_KEY = 'task_manager_tasks';
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
  }

  function handleOpenModal() {
    showModal = true;
  }

  function handleCloseModal() {
    showModal = false;
  }

  function handleSaveTask(taskData) {
    createTask(taskData.title, taskData.description, taskData.type || 'default');
    loadTasks();
    handleCloseModal();
  }

  function handleDeleteDemoData() {
    if (confirm('Delete all demo data? This cannot be undone.')) {
      deleteDemoData();
      tasks = [];
    }
  }
</script>

<div class="app">
  <TaskGrid
    {tasks}
    onAdd={handleOpenModal}
    onDeleteDemoData={handleDeleteDemoData}
  />

  {#if showModal}
    <TaskModal
      onSave={handleSaveTask}
      onClose={handleCloseModal}
    />
  {/if}
</div>

<style>
</style>
