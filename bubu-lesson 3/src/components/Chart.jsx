import { useId } from 'react';

/**
 * A small SVG line chart sized to its data, not to a fixed pixel grid.
 *
 * Deliberately hand-drawn rather than pulled from a charting library: it needs
 * to inherit the lesson's theme tokens (so it reads in dark mode), it needs to
 * label the values the lines actually reach, and it ships in a bundle that runs
 * inside a student app that already has enough dependencies.
 */
export default function Chart({
  series = [],
  xLabel,
  yFormat = (v) => String(Math.round(v)),
  xFormat = (v) => String(v),
  height = 190,
  width = 520,
  ariaLabel,
}) {
  const clipId = useId();
  const pad = { top: 14, right: 12, bottom: 28, left: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const all = series.flatMap((s) => s.points);
  if (!all.length) return null;

  const xMin = Math.min(...all.map((p) => p.x));
  const xMax = Math.max(...all.map((p) => p.x));
  const yMin = Math.min(0, ...all.map((p) => p.y));
  const yMax = Math.max(...all.map((p) => p.y));
  const ySpan = yMax - yMin || 1;
  const xSpan = xMax - xMin || 1;

  const sx = (x) => pad.left + ((x - xMin) / xSpan) * plotW;
  const sy = (y) => pad.top + plotH - ((y - yMin) / ySpan) * plotH;

  // Four gridlines that land on values the data actually reaches.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + t * ySpan);
  const xTicks = [0, 0.5, 1].map((t) => xMin + t * xSpan);

  const path = (points) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');

  const area = (points) =>
    `${path(points)} L${sx(points.at(-1).x).toFixed(1)},${sy(yMin).toFixed(1)} L${sx(points[0].x).toFixed(1)},${sy(yMin).toFixed(1)} Z`;

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel || 'Chart'}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={pad.left} y={pad.top} width={plotW} height={plotH} />
        </clipPath>
      </defs>

      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={sy(t)}
            y2={sy(t)}
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
          <text
            x={pad.left - 8}
            y={sy(t) + 3.5}
            textAnchor="end"
            fontSize="10"
            fill="currentColor"
            fillOpacity="0.62"
            fontFamily="var(--font-mono)"
          >
            {yFormat(t)}
          </text>
        </g>
      ))}

      {xTicks.map((t) => (
        <text
          key={t}
          x={sx(t)}
          y={height - 9}
          textAnchor={t === xMin ? 'start' : t === xMax ? 'end' : 'middle'}
          fontSize="10"
          fill="currentColor"
          fillOpacity="0.62"
          fontFamily="var(--font-mono)"
        >
          {xFormat(t)}
        </text>
      ))}

      {xLabel && (
        <text
          x={pad.left + plotW / 2}
          y={height - 9}
          textAnchor="middle"
          fontSize="10"
          fill="currentColor"
          fillOpacity="0.45"
          className="visually-hidden"
        >
          {xLabel}
        </text>
      )}

      <g clipPath={`url(#${clipId})`}>
        {series.map((s) =>
          s.fill ? (
            <path key={`${s.key}-fill`} d={area(s.points)} fill={s.color} fillOpacity="0.14" stroke="none" />
          ) : null
        )}
        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width || 2}
            strokeDasharray={s.dashed ? '4 4' : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {series.map((s) => (
          <circle key={`${s.key}-end`} cx={sx(s.points.at(-1).x)} cy={sy(s.points.at(-1).y)} r="3.5" fill={s.color} />
        ))}
      </g>
    </svg>
  );
}

export function ChartLegend({ series }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
      {series.map((s) => (
        <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span
            aria-hidden="true"
            style={{
              width: 14,
              height: 3,
              borderRadius: 2,
              background: s.color,
              display: 'inline-block',
              opacity: s.dashed ? 0.7 : 1,
            }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}
