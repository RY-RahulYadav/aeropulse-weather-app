import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function ChartContent({ type, data, series, yAxisLabel }) {
  const commonProps = {
    data,
    margin: { top: 10, right: 12, left: 0, bottom: 0 },
  };

  if (type === 'bar') {
    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.28)" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={34} />
        <Tooltip />
        <Legend />
        {series.map((item) => (
          <Bar key={item.key} dataKey={item.key} name={item.name} fill={item.color} radius={[8, 8, 2, 2]} />
        ))}
      </BarChart>
    );
  }

  return (
    <LineChart {...commonProps}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.28)" />
      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} width={34} />
      <Tooltip />
      <Legend />
      {series.map((item) => (
        <Line
          key={item.key}
          dataKey={item.key}
          name={item.name}
          type="monotone"
          strokeWidth={2}
          stroke={item.color}
          dot={false}
          activeDot={{ r: 4 }}
        />
      ))}
    </LineChart>
  );
}

export default function ChartPanel({ title, subtitle, data, series, type = 'line', yAxisLabel = '', points = 24 }) {
  const pxPerPoint = type === 'bar' ? 34 : 30;
  const chartWidth = Math.min(Math.max(points * pxPerPoint, 320), 4800);

  return (
    <section className="glass min-w-0 overflow-hidden rounded-3xl p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-300">{subtitle} {yAxisLabel ? `(${yAxisLabel})` : ''}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Scroll + zoom enabled
        </span>
      </div>
      <div className="w-full overflow-x-auto overflow-y-hidden pb-1">
        <div style={{ width: `${chartWidth}px` }} className="h-[220px] min-w-full sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContent type={type} data={data} series={series} yAxisLabel={yAxisLabel} />
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
