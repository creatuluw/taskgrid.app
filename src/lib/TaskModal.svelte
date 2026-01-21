<script>
  let { editingTask = null, onSave, onClose } = $props();

  let title = $state('');
  let description = $state('');
  let taskType = $state('default');

  const taskTypes = [
    { value: 'default', label: 'Default', icon: 'check_box_outline_blank' },
    { value: 'urgent', label: 'Urgent', icon: 'warning' },
    { value: 'in_progress', label: 'In Progress', icon: 'edit' },
    { value: 'bug', label: 'Bug', icon: 'bug_report' },
    { value: 'scheduled', label: 'Scheduled', icon: 'schedule' },
    { value: 'secure', label: 'Secure', icon: 'lock' },
    { value: 'finance', label: 'Finance', icon: 'attach_money' },
    { value: 'completed', label: 'Completed', icon: 'check_circle' },
    { value: 'contact', label: 'Contact', icon: 'contacts' },
    { value: 'folder', label: 'Folder', icon: 'folder' },
    { value: 'search', label: 'Search', icon: 'person_search' },
    { value: 'document', label: 'Document', icon: 'description' },
    { value: 'idea', label: 'Idea', icon: 'lightbulb' },
    { value: 'revert', label: 'Revert', icon: 'undo' },
    { value: 'trending', label: 'Trending', icon: 'trending_down' },
    { value: 'save', label: 'Save', icon: 'save' }
  ];

  $effect(() => {
    if (editingTask) {
      title = editingTask.title;
      description = editingTask.description;
      taskType = editingTask.type || 'default';
    } else {
      title = '';
      description = '';
      taskType = 'default';
    }
  });

  function handleSubmit() {
    if (!title.trim()) return;
    onSave({ title, description, type: taskType });
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="modal-backdrop" onclick={onClose}>
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <h2>{editingTask ? 'Edit Task' : 'New Entry'}</h2>

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          type="text"
          bind:value={title}
          placeholder="Task title..."
          autofocus
        />
      </div>

      <div class="form-group">
        <label for="type">Type</label>
        <select id="type" bind:value={taskType}>
          {#each taskTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          bind:value={description}
          placeholder="Task description..."
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick={onClose}>
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {editingTask ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: white;
    color: black;
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
  }

  :global(.dark) .modal {
    background: #121212;
    color: #e5e5e5;
    box-shadow: 8px 8px 0px 0px rgba(255, 255, 255, 0.5);
  }

  h2 {
    font-family: 'Space Mono', monospace;
    font-size: 1.5rem;
    margin: 0 0 1.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    font-family: 'Space Mono', monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid black;
    background: white;
    color: black;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
    border-radius: 0;
  }

  :global(.dark) input,
  :global(.dark) textarea,
  :global(.dark) select {
    border-color: #e5e5e5;
    background: #1a1a1a;
    color: #e5e5e5;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.2);
  }

  :global(.dark) input:focus,
  :global(.dark) textarea:focus,
  :global(.dark) select:focus {
    box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.2);
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.75rem 1.5rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 700;
    border: 2px solid black;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: 0;
  }

  :global(.dark) button {
    border-color: #e5e5e5;
  }

  .btn-primary {
    background: black;
    color: white;
    box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
  }

  :global(.dark) .btn-primary {
    background: #e5e5e5;
    color: black;
    box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.5);
  }

  .btn-primary:hover {
    transform: translateY(1px) translateX(1px);
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
  }

  :global(.dark) .btn-primary:hover {
    box-shadow: 2px 2px 0px 0px rgba(255, 255, 255, 0.5);
  }

  .btn-secondary {
    background: white;
    color: black;
    box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
  }

  :global(.dark) .btn-secondary {
    background: #1a1a1a;
    color: #e5e5e5;
    box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.5);
  }

  .btn-secondary:hover {
    transform: translateY(1px) translateX(1px);
    box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
  }

  :global(.dark) .btn-secondary:hover {
    box-shadow: 2px 2px 0px 0px rgba(255, 255, 255, 0.5);
  }
</style>
