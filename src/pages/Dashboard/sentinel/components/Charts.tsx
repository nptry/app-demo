import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Colors consistent with the Cyberpunk/Deep Blue theme
const COLORS = [
  '#22d3ee',
  '#3b82f6',
  '#818cf8',
  '#f472b6',
  '#ef4444',
  '#10b981',
  '#fbbf24',
];
const GRID_COLOR = '#1e293b';
const TEXT_COLOR = '#94a3b8';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl bg-opacity-90 backdrop-blur z-50">
        <p className="text-slate-200 font-semibold mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p
            key={entry.name || entry.dataKey}
            style={{ color: entry.color }}
            className="text-sm"
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SimpleLineChart = ({
  data,
  dataKey,
  xKey,
  color = '#22d3ee',
  name,
}: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
      <XAxis dataKey={xKey} stroke={TEXT_COLOR} tick={{ fontSize: 10 }} />
      <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 10 }} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        dot={{ r: 3 }}
        activeDot={{ r: 5 }}
        name={name}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const SimpleBarChart = ({ data, xKey, series }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={GRID_COLOR}
        vertical={false}
      />
      <XAxis dataKey={xKey} stroke={TEXT_COLOR} tick={{ fontSize: 10 }} />
      <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 10 }} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      {series.map((s: any, i: number) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          name={s.name}
          fill={COLORS[i % COLORS.length]}
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export const SimplePieChart = ({ data, nameKey, dataKey }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={70}
        paddingAngle={5}
        dataKey={dataKey}
        nameKey={nameKey}
      >
        {data.map((_entry: any, index: number) => (
          <Cell
            key={_entry.name || `cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend verticalAlign="bottom" height={36} iconType="circle" />
    </PieChart>
  </ResponsiveContainer>
);

export const AreaTrendChart = ({
  data,
  xKey,
  dataKey,
  color = '#818cf8',
  name,
}: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <defs>
        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.8} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
      <XAxis dataKey={xKey} stroke={TEXT_COLOR} tick={{ fontSize: 10 }} />
      <YAxis stroke={TEXT_COLOR} tick={{ fontSize: 10 }} />
      <Tooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        fillOpacity={1}
        fill={`url(#color${dataKey})`}
        name={name}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const SimpleRadarChart = ({ data, dataKey, nameKey }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
      <PolarGrid stroke={GRID_COLOR} />
      <PolarAngleAxis
        dataKey={nameKey}
        tick={{ fill: TEXT_COLOR, fontSize: 10 }}
      />
      <PolarRadiusAxis
        angle={30}
        domain={[0, 'auto']}
        tick={false}
        axisLine={false}
      />
      <Radar
        name="Data"
        dataKey={dataKey}
        stroke={COLORS[0]}
        fill={COLORS[0]}
        fillOpacity={0.4}
      />
      <Tooltip content={<CustomTooltip />} />
    </RadarChart>
  </ResponsiveContainer>
);
