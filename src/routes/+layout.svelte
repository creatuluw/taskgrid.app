<script>
  import '../app.css';
</script>

<slot />

<style>
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

  :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #ccc;
  }

  :global(.dark ::-webkit-scrollbar-thumb) {
    background: #444;
  }
</style>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
</svelte:head>
