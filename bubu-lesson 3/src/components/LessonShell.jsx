import { useEffect, useRef, useState } from 'react';
import Block from './Blocks.jsx';
import { lessonMeta, sections } from '../content/portfolioLesson.js';
import { useProgress } from '../hooks/useLessonProgress.jsx';
import { REFERENCE_RATES as R } from '../lib/financeEngine.js';

function ProgressRail({ active, onJump }) {
  const { bySection, completed, total } = useProgress();
  return (
    <nav className="rail" aria-label="Lesson sections">
      <div className="rail__head">Sections</div>
      {sections.map((s) => {
        const p = bySection[s.id] || { total: 0, done: 0 };
        const done = p.total > 0 && p.done === p.total;
        return (
          <button
            key={s.id}
            type="button"
            className="rail__item"
            data-done={done}
            aria-current={active === s.id}
            onClick={() => onJump(s.id)}
          >
            <span className="rail__tick" aria-hidden="true">
              {done ? '✓' : s.number}
            </span>
            <span className="rail__label">
              {s.title}
              {p.total > 0 && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ink-3)', fontWeight: 400 }}>
                  {p.done}/{p.total}
                </span>
              )}
            </span>
          </button>
        );
      })}
      <div className="rail__progress">
        <div className="rail__bar">
          <span style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
        </div>
        <div className="rail__count">
          {completed} of {total} activities
        </div>
      </div>
    </nav>
  );
}

export default function LessonShell() {
  const [active, setActive] = useState(sections[0].id);
  const refs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const jump = (id) => {
    refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <div className="app">
      <header className="masthead">
        <div>
          <div className="masthead__eyebrow">
            <span>{lessonMeta.tier}</span>
            <span className="dot">/</span>
            <span>{lessonMeta.unit}</span>
          </div>
          <h1>{lessonMeta.title}</h1>
          <p>{lessonMeta.subtitle}</p>
        </div>
        <div className="masthead__meta">
          <span>{lessonMeta.minutes} min · {sections.length} sections</span>
          <span>Rates current as of {R.asOf}</span>
        </div>
      </header>

      <ProgressRail active={active} onJump={jump} />

      <main className="lesson">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="section"
            ref={(el) => {
              refs.current[section.id] = el;
            }}
            aria-labelledby={`${section.id}-title`}
          >
            <div className="section__head">
              <span className="section__num">{String(section.number).padStart(2, '0')}</span>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
            </div>
            <p className="section__objective">{section.objective}</p>
            {section.blocks.map((block, i) => (
              <Block key={block.id || `${section.id}-${i}`} block={block} />
            ))}
          </section>
        ))}

        <footer className="closing">
          <h3>Before you take this anywhere</h3>
          <p>{lessonMeta.disclaimer}</p>
          <p>
            The needs-versus-wants framing, the bank-fee material, the credit-card statement
            vocabulary, the closed-card utilization trap and the snowball/avalanche comparison are
            drawn from {lessonMeta.source.author}, <em>{lessonMeta.source.title}</em> (
            {lessonMeta.source.publisher}). Ideas are paraphrased and attributed; the figures below
            are current, not the book’s.
          </p>
          <p>
            Figures in this lesson are current as of {R.asOf}: undergraduate Direct loans at{' '}
            {(R.federalUndergradLoanAPR * 100).toFixed(2)}%, the national average savings rate at{' '}
            {(R.nationalAverageSavingsAPY * 100).toFixed(2)}%, and the average APR on card balances
            carrying interest at {(R.averageCarriedCardAPR * 100).toFixed(2)}%. They live in one place —{' '}
            <code>REFERENCE_RATES</code> in <code>financeEngine.js</code> — so updating them updates every
            sentence and every activity at once.
          </p>
          <p>
            Banking data comes from Capital One’s Nessie sandbox. Nothing here touches a real account, and
            no real money moves.
          </p>
        </footer>
      </main>
    </div>
  );
}
