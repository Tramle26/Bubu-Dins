import { useState } from 'react';
import Activity, { Feedback } from './Activity.jsx';
import { useActivity } from '../../hooks/useLessonProgress.jsx';

/* ========================================================================== */
/* Sort — click an item, click a bucket. Drag also works, but click-to-place   */
/* is the primary interaction: it is keyboard reachable and works on a phone,  */
/* which drag-and-drop alone never does.                                       */
/* ========================================================================== */

export function SortActivity({ block }) {
  const { record, answered, correct } = useActivity(block.id);
  const [placed, setPlaced] = useState({}); // itemId -> bucketKey
  const [held, setHeld] = useState(null);
  const [checked, setChecked] = useState(false);
  const [overBucket, setOverBucket] = useState(null);

  const pool = block.items.filter((i) => !placed[i.id]);
  const allPlaced = pool.length === 0;

  const place = (itemId, bucketKey) => {
    if (checked) return;
    setPlaced((p) => ({ ...p, [itemId]: bucketKey }));
    setHeld(null);
  };

  const onBucketClick = (bucketKey) => {
    if (held) place(held, bucketKey);
  };

  const check = () => {
    const wrong = block.items.filter((i) => placed[i.id] !== i.answer);
    setChecked(true);
    record(wrong.length === 0);
  };

  const retry = () => {
    setPlaced({});
    setChecked(false);
    setHeld(null);
  };

  const verdictFor = (item) => (!checked ? null : placed[item.id] === item.answer ? 'correct' : 'incorrect');
  const wrongCount = block.items.filter((i) => placed[i.id] !== i.answer).length;

  return (
    <Activity block={block}>
      <div className="sort">
        <div>
          <p className="activity__note" style={{ marginBottom: 8 }}>
            {held ? 'Now choose a column.' : 'Choose an item, then choose the column it belongs in.'}
          </p>
          <div className="sort__pool">
            {pool.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                draggable
                onDragStart={(e) => {
                  setHeld(item.id);
                  e.dataTransfer.setData('text/plain', item.id);
                }}
                onClick={() => setHeld(held === item.id ? null : item.id)}
                data-selected={held === item.id}
                aria-pressed={held === item.id}
              >
                {item.label}
              </button>
            ))}
            {pool.length === 0 && (
              <span style={{ color: 'var(--ink-3)', fontSize: '0.85rem' }}>Everything is placed.</span>
            )}
          </div>
        </div>

        <div className="sort__buckets">
          {block.buckets.map((bucket) => {
            const items = block.items.filter((i) => placed[i.id] === bucket.key);
            return (
              <div
                key={bucket.key}
                className="bucket"
                data-over={overBucket === bucket.key}
                onClick={() => onBucketClick(bucket.key)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverBucket(bucket.key);
                }}
                onDragLeave={() => setOverBucket(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOverBucket(null);
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) place(id, bucket.key);
                }}
              >
                <div className="bucket__title">{bucket.label}</div>
                {bucket.hint && <div className="bucket__hint">{bucket.hint}</div>}
                <div className="bucket__items">
                  {items.map((item) => (
                    <div key={item.id}>
                      <button
                        type="button"
                        className="chip"
                        data-verdict={verdictFor(item)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!checked) setPlaced((p) => ({ ...p, [item.id]: undefined }));
                        }}
                        disabled={checked}
                        style={{ width: '100%' }}
                      >
                        {item.label}
                      </button>
                      {checked && verdictFor(item) === 'incorrect' && <div className="why">{item.why}</div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="activity__actions">
        {!checked ? (
          <button type="button" className="btn" onClick={check} disabled={!allPlaced}>
            Check
          </button>
        ) : (
          !correct && (
            <button type="button" className="btn btn--ghost" onClick={retry}>
              Try again
            </button>
          )
        )}
        {!checked && !allPlaced && (
          <span style={{ fontSize: '0.83rem', color: 'var(--ink-3)' }}>
            {pool.length} left to place
          </span>
        )}
      </div>

      {checked && (
        <Feedback
          tone={wrongCount === 0 ? 'correct' : 'incorrect'}
          head={wrongCount === 0 ? 'All correct' : `${wrongCount} misplaced`}
          html={wrongCount === 0 ? block.closing || '' : 'The explanations under the misplaced items say why.'}
        />
      )}
      {answered && correct && checked && block.closing && wrongCount > 0 && (
        <Feedback tone="neutral" html={block.closing} />
      )}
    </Activity>
  );
}

/* ========================================================================== */
/* Order — move rows up and down. Buttons, not drag: an ordering task has to   */
/* be operable with a keyboard or it excludes students who need one.           */
/* ========================================================================== */

export function OrderActivity({ block }) {
  const { record, correct } = useActivity(block.id);
  const [items, setItems] = useState(block.items);
  const [checked, setChecked] = useState(false);

  const move = (index, delta) => {
    if (checked) return;
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const check = () => {
    setChecked(true);
    record(items.every((item, i) => item.id === block.answer[i]));
  };

  const retry = () => {
    setChecked(false);
    setItems(block.items);
  };

  return (
    <Activity block={block}>
      <ol className="order" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, i) => (
          <li
            key={item.id}
            className="order__row"
            data-verdict={checked ? (block.answer[i] === item.id ? 'correct' : 'incorrect') : null}
          >
            <span className="order__n">{i + 1}</span>
            <span>
              <span className="order__label">{item.label}</span>
              {item.sub && <span className="order__sub"> — {item.sub}</span>}
            </span>
            <span className="order__moves">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0 || checked} aria-label={`Move ${item.label} up`}>
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1 || checked}
                aria-label={`Move ${item.label} down`}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>

      <div className="activity__actions">
        {!checked ? (
          <button type="button" className="btn" onClick={check}>
            Check
          </button>
        ) : (
          !correct && (
            <button type="button" className="btn btn--ghost" onClick={retry}>
              Try again
            </button>
          )
        )}
      </div>

      {checked && (
        <Feedback
          tone={correct ? 'correct' : 'incorrect'}
          head={correct ? 'That is the order' : 'Not yet'}
          html={correct ? block.solution : 'The rows in red are not where they belong. Think about what breaks if you skip each one.'}
        />
      )}
    </Activity>
  );
}

/* ========================================================================== */
/* Match — a select per row. Plain, fast, and screen-reader native.            */
/* ========================================================================== */

export function MatchActivity({ block }) {
  const { record, correct } = useActivity(block.id);
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(false);

  const complete = block.left.every((l) => picks[l.id]);

  const check = () => {
    setChecked(true);
    record(block.left.every((l) => picks[l.id] === l.id));
  };

  return (
    <Activity block={block}>
      <div className="match">
        {block.left.map((l) => (
          <div key={l.id} className="match__row" data-verdict={checked ? (picks[l.id] === l.id ? 'correct' : 'incorrect') : null}>
            <label className="match__left" htmlFor={`${block.id}-${l.id}`}>
              {l.label}
            </label>
            <select
              id={`${block.id}-${l.id}`}
              value={picks[l.id] || ''}
              disabled={checked && correct}
              onChange={(e) => {
                setPicks((p) => ({ ...p, [l.id]: e.target.value }));
                setChecked(false);
              }}
            >
              <option value="">Choose…</option>
              {block.right.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="activity__actions">
        <button type="button" className="btn" onClick={check} disabled={!complete || (checked && correct)}>
          Check
        </button>
      </div>

      {checked && (
        <Feedback
          tone={correct ? 'correct' : 'incorrect'}
          head={correct ? 'All matched' : 'Some of these are swapped'}
          html={
            correct
              ? 'Three accounts, three jobs. Using one for another account’s job is where most of the trouble starts.'
              : 'Ask what each account is <em>built</em> to do, not what it is possible to do with it.'
          }
        />
      )}
    </Activity>
  );
}

/* ========================================================================== */
/* Multiple choice — per-option feedback, because a wrong answer is usually a  */
/* specific misconception and deserves a specific reply.                       */
/* ========================================================================== */

export function MultipleChoice({ block }) {
  const { record, correct } = useActivity(block.id);
  const [picked, setPicked] = useState(null);

  const choose = (option) => {
    if (picked && correct) return;
    setPicked(option.id);
    record(Boolean(option.correct));
  };

  const pickedOption = block.options.find((o) => o.id === picked);

  return (
    <Activity block={block}>
      <div className="mcq" role="group" aria-labelledby={`${block.id}-label`}>
        {block.options.map((option, i) => {
          const isPicked = picked === option.id;
          const verdict = !picked
            ? null
            : isPicked
              ? option.correct
                ? 'correct'
                : 'incorrect'
              : option.correct && !pickedOption?.correct
                ? 'missed'
                : null;
          return (
            <button
              key={option.id}
              type="button"
              className="option"
              data-verdict={verdict}
              onClick={() => choose(option)}
              disabled={Boolean(picked) && correct}
            >
              <span className="option__key">{String.fromCharCode(65 + i)}</span>
              <span>
                <span dangerouslySetInnerHTML={{ __html: option.label }} />
                {isPicked && option.feedback && (
                  <span className="option__feedback" dangerouslySetInnerHTML={{ __html: option.feedback }} />
                )}
                {verdict === 'missed' && option.feedback && (
                  <span className="option__feedback" dangerouslySetInnerHTML={{ __html: option.feedback }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {picked && !correct && (
        <div className="activity__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setPicked(null)}>
            Clear and rethink
          </button>
        </div>
      )}

      {picked && correct && block.closing && <Feedback tone="neutral" html={block.closing} />}
    </Activity>
  );
}

/* ========================================================================== */
/* Numeric entry — with named distractors, so a predictable wrong answer gets  */
/* the explanation that actually addresses it.                                 */
/* ========================================================================== */

export function NumericEntry({ block }) {
  const { record, correct } = useActivity(block.id);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const parsed = Number(String(value).replace(/[$,\s]/g, ''));
  const valid = value !== '' && Number.isFinite(parsed);
  const isRight = valid && Math.abs(parsed - block.answer) <= (block.tolerance ?? 0);
  const distractor = valid && !isRight
    ? block.distractors?.find((d) => Math.abs(parsed - d.value) <= Math.max(1, Math.abs(d.value) * 0.01))
    : null;

  const check = () => {
    setChecked(true);
    record(isRight);
  };

  return (
    <Activity block={block}>
      <div className="numeric">
        <div className="numeric__field">
          {block.prefix && <span className="numeric__prefix" aria-hidden="true">{block.prefix}</span>}
          <input
            id={`${block.id}-input`}
            type="text"
            inputMode="decimal"
            value={value}
            disabled={checked && correct}
            placeholder="0"
            aria-label="Your answer"
            data-affix={block.prefix ? (block.suffix ? 'both' : 'prefix') : block.suffix ? 'suffix' : 'none'}
            onChange={(e) => {
              setValue(e.target.value);
              setChecked(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && valid) check();
            }}
          />
          {block.suffix && <span className="numeric__suffix" aria-hidden="true">{block.suffix}</span>}
        </div>
      </div>

      <div className="activity__actions">
        <button type="button" className="btn" onClick={check} disabled={!valid || (checked && correct)}>
          Check
        </button>
        {!correct && block.hint && (
          <button type="button" className="btn btn--ghost btn--small" onClick={() => setShowHint((s) => !s)}>
            {showHint ? 'Hide hint' : 'Hint'}
          </button>
        )}
      </div>

      {showHint && !correct && <Feedback tone="neutral" head="Hint" html={block.hint} />}

      {checked && (
        <Feedback
          tone={isRight ? 'correct' : 'incorrect'}
          head={isRight ? 'Correct' : distractor ? 'A common wrong turn' : 'Not quite'}
          html={
            isRight
              ? block.solution
              : distractor
                ? distractor.feedback
                : 'Check which numbers belong in each column before you subtract.'
          }
        />
      )}
    </Activity>
  );
}
