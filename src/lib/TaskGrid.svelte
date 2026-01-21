<script>
  let { tasks, onAdd, onDeleteDemoData } = $props();

  function getIconForTaskType(type) {
    const iconMap = {
      'default': 'check_box_outline_blank',
      'urgent': 'warning',
      'in_progress': 'edit',
      'bug': 'bug_report',
      'scheduled': 'schedule',
      'secure': 'lock',
      'finance': 'attach_money',
      'completed': 'check_circle',
      'contact': 'contacts',
      'folder': 'folder',
      'search': 'person_search',
      'document': 'description',
      'idea': 'lightbulb',
      'revert': 'undo',
      'trending': 'trending_down',
      'save': 'save'
    };
    return iconMap[type] || 'check_box_outline_blank';
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Space Mono', monospace;
    background: #ffffff;
    color: #000000;
    transition: background-color 0.3s, color 0.3s;
  }

  :global(.dark) body {
    background: #121212;
    color: #e5e5e5;
  }

  :global(.dark ::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(.dark ::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(.dark ::-webkit-scrollbar-thumb) {
    background: #444;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #ccc;
  }

  .bg-grid-line-light {
    background: #000000;
  }

  :global(.dark) .bg-grid-line-light {
    background: #333333;
  }

  .bg-background-light {
    background: #ffffff;
  }

  :global(.dark) .bg-background-light {
    background: #121212;
  }

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

  .task-card, .add-card {
    background: #ffffff;
  }

  :global(.dark) .task-card,
  :global(.dark) .add-card {
    background: #121212;
  }

  .task-card {
    aspect-ratio: 1 / 1;
  }

  .add-card {
    border: none;
    text-align: left;
    aspect-ratio: 1 / 1;
  }

  .delete-demo-btn {
    position: fixed;
    bottom: 30px;
    right: 10px;
    z-index: 50;
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    padding: 8px 12px;
    background: #000000;
    color: #ffffff;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: all 0.15s ease;
  }

  :global(.dark) .delete-demo-btn {
    background: #ffffff;
    color: #000000;
  }

  .delete-demo-btn:hover {
    transform: translateY(1px) translateX(1px);
  }
</style>

<svelte:head>
  <script>
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (event.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  </script>
</svelte:head>

<div class="fixed top-6 left-6 z-50">
  <button class="bg-background-light dark:bg-background-dark border border-black dark:border-gray-400 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all duration-150">
    <span class="material-icons text-xl">menu</span>
  </button>
</div>

<main class="w-full min-h-screen p-1 bg-grid-line-light dark:bg-grid-line-dark transition-colors duration-300">
  <div class="brutalist-grid bg-grid-line-light dark:bg-grid-line-dark transition-colors duration-300">
    <button
      class="add-card aspect-square p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors group relative overflow-hidden"
      onclick={onAdd}
    >
      <span class="material-icons text-3xl group-hover:scale-110 transition-transform duration-200 text-gray-400 group-hover:text-black dark:group-hover:text-white">add</span>
      <span class="mt-1 text-[0.5rem] font-bold uppercase tracking-widest border-b border-black dark:border-white pb-0.5">New Entry</span>
    </button>

    {#each tasks as task, index (task.id)}
      <div class="task-card aspect-square p-2 text-[0.65rem] leading-tight flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors group cursor-pointer overflow-hidden">
        <div class="flex justify-between w-full opacity-30 group-hover:opacity-100 transition-opacity">
          <span>{(index + 1).toString().padStart(2, '0')}</span>
          <span class="material-icons text-[10px]">{getIconForTaskType(task.type)}</span>
        </div>
        <p class="line-clamp-3">{task.title}</p>
      </div>
    {/each}
  </div>

  <div class="fixed bottom-0 left-0 w-full bg-black dark:bg-white text-white dark:text-black text-xs p-1 font-mono uppercase tracking-widest flex justify-between z-40">
    <span>System Status: Online</span>
    <span>Grid: High Density</span>
    <span>V 2.2.0</span>
  </div>

  {#if tasks.length > 0 && tasks.every(t => t.isDemo)}
    <button class="delete-demo-btn" onclick={onDeleteDemoData}>
      delete demo data
    </button>
  {/if}
</main>
