import { activityLabels } from '../../content/portfolioLesson.js';
import { useActivity } from '../../hooks/useLessonProgress.jsx';

/**
 * The labelled frame every activity sits in — the zyBook convention, where
 * "Participation Activity 3.2" is a real address a student and an instructor
 * can both refer to. The numbering is derived from section order in
 * portfolioLesson.js, so inserting an activity renumbers the rest for free.
 */
export default function Activity({ block, children, statusOverride }) {
  const meta = activityLabels[block.id] || { label: 'Activity' };
  const { answered, correct } = useActivity(block.id);

  const state = statusOverride ?? (answered ? (correct ? 'correct' : 'incorrect') : null);
  const statusText =
    statusOverride === 'explore'
      ? 'Explore freely'
      : state === 'correct'
        ? 'Complete'
        : state === 'incorrect'
          ? 'Try again'
          : null;

  return (
    <section
      className={`activity ${block.tier === 'challenge' ? 'activity--challenge' : ''}`}
      aria-labelledby={`${block.id}-label`}
    >
      <header className="activity__bar">
        <span id={`${block.id}-label`}>{meta.label}</span>
        {statusText && (
          <span className="activity__status" data-state={state === 'explore' ? null : state}>
            {statusText}
          </span>
        )}
      </header>
      <div className="activity__body">
        {block.prompt && (
          <div className="activity__prompt" dangerouslySetInnerHTML={{ __html: `<p>${block.prompt}</p>` }} />
        )}
        {block.body && <p className="activity__note" dangerouslySetInnerHTML={{ __html: block.body }} />}
        {children}
      </div>
    </section>
  );
}

export function Feedback({ tone = 'neutral', head, children, html }) {
  return (
    <div className={`feedback feedback--${tone}`} role="status">
      {head && <span className="feedback__head">{head}</span>}
      {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : children}
    </div>
  );
}
