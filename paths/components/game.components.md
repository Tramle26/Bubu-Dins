<!-- componentName: bubu-home -->

# Bubu home

The scene is ordinary HTML and CSS. The small `x-bubu-*` Plugin components read
the signed-in learner's real PathMX completion; they do not save a second copy.
Keep each `componentName` comment: it registers the HTML tag.
The reference street painting includes decorative Bubu and the BANK and CAFÉ
building signs; links and progress stay in HTML.

```html
<section class="bubu-home" data-pmx-prose="off">
  <div class="home-scene" aria-label="Bubu on a sunny town street">
    <div class="home-hero">
      <h1>Ready for your<br />next adventure?</h1>
      <p class="home-motto"><span>Learn</span><span>Plan</span><span>Grow</span></p>
      <a class="primary-action" href="/learn.page">Let’s explore <span aria-hidden="true"><x-bubu-icon name="arrow-right" /></span></a>
      <p class="home-shortcuts">
        <a href="/dr-boss.page" data-pmx-source-open="overlay"><x-bubu-icon name="message-circle-more" /> Dr. Bos</a>
        <a href="/project-workspace.page"><x-bubu-icon name="folder" /> Workspace</a>
      </p>
    </div>
    <x-bubu-continue />
  </div>
</section>
```

---

<!-- componentName: bubu-coach -->

# Bubu encouragement

An authored line of encouragement, not an AI chatbot. Replace the slotted text.
Use a transparent sprite with a fixed canvas so changing poses won't move the text.

```html
<aside class="coach-card">
  <img src="/assets/boo-boo.png" alt="Bubu" width="1024" height="1024" />
  <div><strong>Bubu</strong><p><slot /></p></div>
</aside>
```


---

<!-- componentName: bubu-bank-scene -->

# Bubu at the bank

Adapted from the supplied Claude artifact; scenario state is temporary and separate from Completion.

```html
<section class="bank-simulation" data-pmx-prose="off">

<div class="shell">
<x-bubu-bank-controller />
  <header class="topbar">
    <span class="brand">bubu<span class="leaf" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12C2 6 6 2 12 2c0 6-4 10-10 10Z" fill="currentColor"/></svg>
    </span></span>
    <nav class="nav" aria-label="Sections">
      <a href="/learn.page">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Learn
      </a>
      <a href="/storyworld.page" aria-current="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m1 6 7-3 8 3 7-3v15l-7 3-8-3-7 3z"/><path d="M8 3v15M16 6v15"/></svg>
        Storyworld
      </a>
      <a href="/project-workspace.page">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        Workspace
      </a>
      <a href="/dr-boss.page" data-pmx-source-open="overlay">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="3"/><circle cx="5" cy="17" r="2.4"/><circle cx="19" cy="17" r="2.4"/><path d="M9.6 11.2 6.8 14.8M14.4 11.2l2.8 3.6"/></svg>
        Dr.Bos
      </a>
    </nav>
    <div class="topbar__right">
      <div class="bellwrap">
        <button class="bell" id="bell" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Notifications">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M13.7 19a2 2 0 0 1-3.4 0"/></svg>
          <span class="bell__badge" id="bell-badge" hidden>0</span>
        </button>
        <div class="notifs" id="notifs" hidden role="dialog" aria-label="Notifications">
          <div class="notifs__head">
            <strong>Notifications</strong>
            <button type="button" class="notifs__close" id="notifs-close" aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </div>
          <div class="notifs__list" id="notifs-list"></div>
        </div>
      </div>
      <x-bubu-coins />
      <span class="me"><img src="/assets/bank-reference-fd3cf84d69.jpg" alt=""> Hi there!</span>
    </div>
  </header>

  <p class="bank-disclosure">Fictional banking practice · $850 scenario cash, separate from learning credit · Choices and conversation reset on reload. No real accounts or payments. <a class="nessie-link" href="/world/bank-portfolio.page" data-pmx-source-open="overlay">Open Capital One sandbox data →</a></p>
<div class="stage">
    <section class="scene" id="scene" aria-label="The bank">
      <img class="scene__img" src="/assets/bank-reference-17e407910c.jpg" alt="Bubu sitting at a desk in a bright bank branch with Tram, a bank associate, who is turned toward a laptop.">
      <span class="scene__veil" aria-hidden="true"></span>
      <span class="nameplate"><img src="/assets/bank-reference-e4a3bb9f22.jpg" alt=""><span>Tram<small>New Accounts</small></span></span>
      <div class="scene__caption">
        <span class="scene__where" id="scene-where">Greenville Community Bank · Tuesday, 10:15am</span>
        <span class="scene__beat" id="scene-beat">Bubu has never opened an account before.</span>
        <span class="scene__sub" id="scene-sub">Ask Tram anything. She will not move on until you have asked at least two questions — that is the point of sitting down with a person.</span>
      </div>
    </section>

    <section class="dash" id="dash" hidden aria-label="Your portfolio">
      <div>
        <h3>Your portfolio</h3>
        <p class="dash__note" id="dash-note">Nothing opened yet. These are temporary fictional scenario records. Open Capital One sandbox data for live records.</p>
      </div>
      <dl class="stat-row" id="dash-stats"></dl>
      <div id="dash-accounts" class="choices"></div>
      <div>
        <h3 style="font-size:1rem;margin-bottom:6px">Practice activity this visit</h3>
        <pre class="wire" id="dash-wire"><div>Nothing yet.</div></pre>
      </div>
    </section>

    <section class="panel" aria-label="Conversation">
      <div class="panel__head">
        <div class="steps">
          <span class="steps__label" id="steps-label">Scenario 1 of 3</span>
          <span class="steps__dots" id="steps-dots"></span>
        </div>
        <div class="pf">
          <span class="pf__ico" aria-hidden="true">💰</span>
          <span>
            <span class="pf__name">Practice portfolio</span>
            <span class="pf__track"><span class="pf__fill" id="pf-fill" style="width:0%"></span></span>
          </span>
          <span class="pf__count" id="pf-count">0 / 5</span>
        </div>
      </div>

      <div class="log" id="log" role="log" aria-label="Conversation with Tram" aria-live="polite" aria-atomic="false"></div>

      <div class="dock" id="dock"></div>

      <div class="statusline">
        <span class="pill pill--mock" id="bank-pill">Practice bank</span>
      </div>
    </section>
  </div>

  <nav class="tabs" aria-label="View">
    <button type="button" data-tab="dashboard">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
      Dashboard
    </button>
    <button type="button" data-tab="scene" aria-current="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z"/></svg>
      Scene
    </button>
    <button type="button" data-tab="restart">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5"/></svg>
      Start over
    </button>
  </nav>
</div>


</section>
```
