import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { Sunrise, Sunset, Sun } from 'lucide-react';

function getProgress(sunriseIso, sunsetIso) {
  const now = dayjs();
  const sunrise = dayjs(sunriseIso);
  const sunset = dayjs(sunsetIso);

  if (!sunrise.isValid() || !sunset.isValid()) {
    return 0;
  }

  if (now.isBefore(sunrise)) {
    return 0;
  }

  if (now.isAfter(sunset)) {
    return 100;
  }

  return ((now.diff(sunrise) / sunset.diff(sunrise)) * 100).toFixed(1);
}

export default function SunCycleTimeline({ sunrise, sunset }) {
  const progress = getProgress(sunrise, sunset);

  return (
    <section className="glass rounded-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl text-slate-900 dark:text-white">Sun Cycle</h3>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-200/20 dark:text-amber-200">
          <Sun className="h-3.5 w-3.5" />
          Day Progress {progress}%
        </span>
      </div>

      <div className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-300" style={{ width: `${progress}%` }} />
        <motion.div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-amber-400 shadow"
          animate={{ left: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ marginLeft: '-10px' }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1"><Sunrise className="h-3.5 w-3.5" />{dayjs(sunrise).format('HH:mm')}</span>
        <span className="inline-flex items-center gap-1"><Sunset className="h-3.5 w-3.5" />{dayjs(sunset).format('HH:mm')}</span>
      </div>
    </section>
  );
}
