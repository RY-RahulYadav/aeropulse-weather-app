import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

const toneMap = {
  info: 'from-cyan-400/20 to-indigo-400/20',
  warm: 'from-amber-400/25 to-orange-400/20',
  cool: 'from-sky-400/25 to-cyan-400/20',
  neutral: 'from-slate-400/15 to-slate-500/10',
};

export default function MetricCard({
  icon: Icon,
  title,
  value,
  unit = '',
  note = '',
  trend = 'up',
  tone = 'neutral',
}) {
  const TrendIcon = trend === 'down' ? TrendingDown : TrendingUp;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className={`glass relative overflow-hidden rounded-3xl p-4`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneMap[tone] ?? toneMap.neutral}`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {value}
            {unit ? <span className="ml-1 text-base text-slate-500 dark:text-slate-300">{unit}</span> : null}
          </p>
          {note ? <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{note}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="icon-chip">{Icon ? <Icon className="h-4 w-4" /> : null}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm dark:bg-slate-800/80 dark:text-slate-200">
            <TrendIcon className="h-3 w-3" />
            Trend
          </span>
        </div>
      </div>
    </motion.article>
  );
}
