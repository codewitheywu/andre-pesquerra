import Section from "@/components/ui/Section";
import TextLink from "@/components/ui/TextLink";
import { siteContent } from "@/data/content";
import { formatDay, type ContributionCalendar } from "@/lib/contributions";

const CELL = 9;
const STEP = 11;
const MONTH_ROW = 20;
const LEVELS = [0, 1, 2, 3, 4] as const;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function Calendar({ calendar }: { calendar: ContributionCalendar }) {
  const width = calendar.weeks.length * STEP - (STEP - CELL);
  const height = MONTH_ROW + 7 * STEP - (STEP - CELL);
  const { busiest } = calendar;

  const caption =
    calendar.total === 0
      ? "No public contributions in the last year"
      : `${plural(calendar.total, "contribution")} in the last year` +
        (busiest ? ` · most on ${formatDay(busiest.date)} (${busiest.count})` : "");
  // The graph itself is one image to assistive tech; this is its text.
  const summary =
    calendar.total === 0
      ? `${caption}.`
      : `${plural(calendar.total, "contribution")} across ${plural(calendar.activeDays, "day")} in the last year.` +
        (busiest ? ` Busiest day: ${formatDay(busiest.date)}, with ${busiest.count}.` : "");

  return (
    <figure>
      {/* rtl makes narrow screens open scrolled to the newest weeks. */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Contribution calendar, scrollable"
        className="overflow-x-auto pb-2 [direction:rtl]"
      >
        <div className="w-max min-w-full [direction:ltr]">
          <svg
            role="img"
            aria-label={summary}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            // Fills the column on desktop; narrower screens scroll instead of shrinking it.
            style={{ minWidth: width }}
            className="block h-auto w-full"
          >
            {calendar.months.map((month) => (
              <text
                key={`${month.label}-${month.week}`}
                x={month.week * STEP}
                y={13}
                className="fill-muted font-mono text-meta lowercase"
              >
                {month.label}
              </text>
            ))}
            {calendar.weeks.map((week, column) =>
              week.map(
                (day, row) =>
                  day && (
                    <rect
                      key={day.date}
                      x={column * STEP}
                      y={MONTH_ROW + row * STEP}
                      width={CELL}
                      height={CELL}
                      rx={2}
                      className={`heat-cell heat-${day.level}`}
                    >
                      <title>{`${plural(day.count, "contribution")} on ${formatDay(day.date)}`}</title>
                    </rect>
                  )
              )
            )}
          </svg>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-meta text-muted">
        <span aria-hidden="true">{caption}</span>
        <span className="inline-flex items-center gap-1.5" aria-hidden="true">
          less
          <svg width={LEVELS.length * STEP - 2} height={CELL} className="block">
            {LEVELS.map((level) => (
              <rect
                key={level}
                x={level * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                className={`heat-${level}`}
              />
            ))}
          </svg>
          more
        </span>
      </figcaption>
    </figure>
  );
}

export default function GitHubActivity({ calendar }: { calendar: ContributionCalendar | null }) {
  return (
    <Section
      id="github"
      title="GitHub"
      action={{ label: `@${siteContent.githubUser}`, href: siteContent.github }}
    >
      {calendar ? (
        <Calendar calendar={calendar} />
      ) : (
        <p className="text-body text-ink-2">
          The activity graph is unavailable right now. My code is on{" "}
          <span className="whitespace-nowrap"><TextLink href={siteContent.github}>GitHub</TextLink>.</span>
        </p>
      )}
    </Section>
  );
}
