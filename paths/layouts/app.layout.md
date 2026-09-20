[@styles]: ../styles/global.css

<div class="bubu-app">
  <header class="bubu-nav" data-pmx-sticky-header>
    <a class="bubu-wordmark" href="/" aria-label="Bubu home"><span>bubu</span><i aria-hidden="true"></i></a>
    <nav aria-label="Primary navigation">
      <a href="/learn.page"><x-bubu-icon name="book-open" /> Learn</a>
      <a href="/storyworld.page"><x-bubu-icon name="map" /> Storyworld</a>
      <a href="/project-workspace.page"><x-bubu-icon name="folder" /> Workspace</a>
      <a class="nav-more" href="/collection.page"><x-bubu-icon name="boxes" /> My collection</a>
      <a class="nav-more" href="/dr-boss.page" data-pmx-source-open="overlay">Dr.Bos</a>
    </nav>
    <div class="bubu-account">
      <x-bubu-coins />
      <div class="bubu-user">
        <a href="/dashboard.page" class="bubu-user-face" aria-label="Open user dashboard"><img class="bubu-user-avatar" src="/assets/boo-boo.png" alt="" width="1024" height="1024" /></a>
        <x-bubu-dashboard-profile />
        <x-auth-session />
        <x-bubu-icon name="chevron-down" />
      </div>
    </div>
  </header>
  <main id="main-content"><x-source-content /></main>
  <footer class="game-team-footer"><a href="/work.path">Team Work · build guides →</a></footer>
</div>
<x-source-overlay />
