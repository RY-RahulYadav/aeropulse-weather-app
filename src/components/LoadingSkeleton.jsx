export default function LoadingSkeleton() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="glass h-28 animate-pulse rounded-3xl bg-slate-200/60 dark:bg-slate-700/40" />
      ))}
    </section>
  );
}
