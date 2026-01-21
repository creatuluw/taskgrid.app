<script>
  import { onMount } from 'svelte';
  
  let tasks = $state([]);
  let showModal = $state(false);
  let loading = $state(true);
  let isDark = $state(false);
  let availableTags = $state([]);
  
  let newTaskTitle = '';
  let newTaskDescription = '';
  let newTaskType = 'task';
  
  const taskTypes = [
    { value: 'task', icon: '📝', label: 'Task' },
    { value: 'bug', icon: '🐛', label: 'Bug' },
    { value: 'feature', icon: '✨', label: 'Feature' },
    { value: 'refactor', icon: '🔄', label: 'Refactor' },
    { value: 'test', icon: '🧪', label: 'Test' },
    { value: 'deploy', icon: '🚀', label: 'Deploy' },
    { value: 'review', icon: '👁', label: 'Review' },
    { value: 'docs', icon: '📚', label: 'Documentation' },
    { value: 'database', icon: '🗄️', label: 'Database' },
    { value: 'optimization', icon: '⚡', label: 'Optimization' },
    { value: 'design', icon: '🎨', label: 'Design' },
    { value: 'security', icon: '🔒', label: 'Security' },
    { value: 'devops', icon: '⚙️', label: 'DevOps' }
  ];
  
  function getIconForType(type) {
    const taskType = taskTypes.find(t => t.value === type);
    return taskType ? taskType.icon : '📝';
  }
  
  function toggleDarkMode() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
      document.body.style.color = '#e5e5e5';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }
  
  async function loadTasks() {
    try {
      loading = true;
      const response = await fetch('/api/tasks');
      const data = await response.json();
      tasks = data.tasks || [];
      availableTags = data.tags || [];
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      loading = false;
    }
  }
  
  function handleAddTask(event) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTaskTitle,
        description: newTaskDescription,
        type: newTaskType
      })
    })
    .then(response => {
      if (response.ok) {
        return loadTasks().then(() => {
          handleCloseModal();
          resetModal();
        });
      }
    })
    .catch(error => {
      console.error('Error adding task:', error);
    });
  }
  
  async function handleDeleteTask(id) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }
  
  function handleOpenModal() {
    showModal = true;
  }
  
  function handleCloseModal() {
    showModal = false;
  }
  
  function resetModal() {
    newTaskTitle = '';
    newTaskDescription = '';
    newTaskType = 'task';
  }
  
  onMount(() => {
    loadTasks();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDark = true;
      toggleDarkMode();
    }
  });
</script>

<div class="fixed top-6 left-6 z-50">
  <button 
    onclick={toggleDarkMode}
    class="bg-background-light border border-primary p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all duration-150"
    title="Toggle dark mode"
  >
    {isDark ? '☀️' : '🌙'}
  </button>
</div>

<main class="w-full min-h-screen p-1 bg-grid-line-light dark:bg-grid-line-dark transition-colors duration-300">
  <div class="brutalist-grid bg-grid-line-light dark:bg-grid-line-dark">
    {#if loading}
      <div class="col-span-full flex items-center justify-center p-8">
        <p class="text-xs">Loading tasks...</p>
      </div>
    {:else}
      {#each tasks as task, index (task.id)}
        <div 
          class="bg-background-light dark:bg-background-dark aspect-square p-1.5 text-[0.55rem] leading-tight flex flex-col justify-start hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group cursor-pointer overflow-hidden"
          oncontextmenu={(e) => { e.preventDefault(); handleDeleteTask(task.id); }}
        >
          <div class="flex items-center gap-1 mb-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
            <span class="text-[0.5rem]">{(index + 1).toString().padStart(2, '0')}</span>
            <span class="text-lg">{getIconForType(task.type)}</span>
          </div>
          <p class="font-bold line-clamp-4">{task.title}</p>
        </div>
      {/each}
      
      <button
        class="bg-background-light dark:bg-background-dark aspect-square p-1.5 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors group relative overflow-hidden"
        onclick={handleOpenModal}
      >
        <span class="text-3xl text-gray-400 group-hover:text-primary dark:group-hover:text-white transition-colors">➕</span>
        <span class="mt-1 text-[0.45rem] font-bold uppercase tracking-widest border-b border-primary dark:border-white pb-0.5">New Entry</span>
      </button>
    {/if}
  </div>
  
  <div class="fixed bottom-0 left-0 w-full bg-primary dark:bg-white text-white dark:text-black text-xs p-1 font-mono uppercase tracking-widest flex justify-between z-40">
    <span>System Status: Online</span>
    <span>Grid: High Density</span>
    <span>V 2.3.0</span>
  </div>
</main>

{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick={handleCloseModal}>
    <div 
      class="bg-background-light dark:bg-background-dark p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_0px_rgba(255,255,255,0.5)] w-full max-w-md mx-4"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-base font-bold uppercase tracking-wider">New Task</h2>
        <button onclick={handleCloseModal} class="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-xl">
          ✕
        </button>
      </div>
      
      <form onsubmit={handleAddTask}>
        <div class="mb-4">
          <label class="block text-xs font-bold uppercase tracking-wider mb-1">Title</label>
          <input 
            type="text" 
            bind:value={newTaskTitle}
            class="w-full p-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:outline-none"
            placeholder="Enter task title..."
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-xs font-bold uppercase tracking-wider mb-1">Type</label>
          <select 
            bind:value={newTaskType}
            class="w-full p-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:outline-none"
          >
            {#each taskTypes as type}
              <option value={type.value}>{type.icon} {type.label}</option>
            {/each}
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-xs font-bold uppercase tracking-wider mb-1">Description</label>
          <textarea 
            bind:value={newTaskDescription}
            class="w-full p-2 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white focus:outline-none h-24"
            placeholder="Enter task description..."
          ></textarea>
        </div>
        
        <button 
          type="submit"
          class="w-full p-2 bg-primary text-white dark:bg-white dark:text-black font-bold uppercase tracking-wider border-2 border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Create Task
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  .brutalist-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }
  
  @media (min-width: 640px) {
    .brutalist-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (min-width: 768px) {
    .brutalist-grid {
      grid-template-columns: repeat(8, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .brutalist-grid {
      grid-template-columns: repeat(12, 1fr);
    }
  }
</style>
