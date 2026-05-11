interface StatsCardProps {
  title: string;
  icon: string;
  value: string;
  subtext: string;
  subtextHighlight?: string;
  bgClass: string;
  textClass: string;
  highlightClass?: string;
}

export default function StatsCard({
  title,
  icon,
  value,
  subtext,
  subtextHighlight,
  bgClass,
  textClass,
  highlightClass,
}: StatsCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <span className="font-label text-sm text-on-surface-variant font-medium">
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center`}
        >
          <span className={`material-symbols-outlined ${textClass} text-sm`}>
            {icon}
          </span>
        </div>
      </div>
      <div>
        <div className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">
          {value}
        </div>
        <p className="font-body text-xs text-secondary mt-1">
          {subtextHighlight ? (
            <>
              {subtext.split(subtextHighlight)[0]}
              <strong className={highlightClass}>{subtextHighlight}</strong>
              {subtext.split(subtextHighlight)[1]}
            </>
          ) : (
            subtext
          )}
        </p>
      </div>
    </div>
  );
}
