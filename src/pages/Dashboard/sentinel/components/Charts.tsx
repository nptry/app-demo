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
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Colors updated for "Green/Industrial Tech" theme (#323e37 bg context)
export const COLORS = [
  '#4ade80',
  '#2dd4bf',
  '#fbbf24',
  '#f87171',
  '#60a5fa',
  '#a78bfa',
];
export const GRID_COLOR = '#4a5f54';
const TEXT_COLOR = '#94a3b8';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c2622] border border-[#4ade80]/30 p-3 rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] z-50">
        <p className="text-slate-200 font-semibold mb-1 font-tech text-xs">
          {label || payload[0].name}
        </p>
        {payload.map((entry: any, index: number) => {
          const key = entry.dataKey ?? entry.name ?? `payload-${index}`;
          return (
            <p
              key={key}
              style={{ color: entry.color }}
              className="text-sm font-mono"
            >
              {entry.name}: {entry.value}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const SimpleLineChart = ({
  data,
  dataKey,
  xKey,
  color = '#4ade80',
  name,
}: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={data}
      margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} opacity={0.3} />
      <XAxis
        dataKey={xKey}
        stroke={TEXT_COLOR}
        tick={{ fontSize: 10 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
      />
      <YAxis
        stroke={TEXT_COLOR}
        tick={{ fontSize: 10 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={2}
        dot={{ r: 0, strokeWidth: 0, fill: color }}
        activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }}
        name={name}
        isAnimationActive={true}
        animationDuration={2000}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const SimpleBarChart = ({ data, xKey, series }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={GRID_COLOR}
        vertical={false}
        opacity={0.3}
      />
      <XAxis
        dataKey={xKey}
        stroke={TEXT_COLOR}
        tick={{ fontSize: 10 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
      />
      <YAxis
        stroke={TEXT_COLOR}
        tick={{ fontSize: 10 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
      />
      <Tooltip content={<CustomTooltip />} />
      {series.map((s: any, i: number) => (
        <Bar
          key={s.key}
          dataKey={s.key}
          name={s.name}
          fill={COLORS[i % COLORS.length]}
          radius={[2, 2, 0, 0]}
          maxBarSize={40}
          animationDuration={1500}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export const SimplePieChart = ({
  data,
  nameKey,
  dataKey,
  animate = false,
}: any) => {
  return (
    <div className={`w-full h-full ${animate ? 'animate-spin-slow' : ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={4}
            dataKey={dataKey}
            nameKey={nameKey}
            stroke="none"
          >
            {data.map((entry: any, index: number) => {
              const cellKey = entry?.[nameKey] ?? `cell-${index}`;
              return (
                <Cell key={cellKey} fill={COLORS[index % COLORS.length]} />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AreaTrendChart = ({
  data,
  xKey,
  dataKey,
  color = '#2dd4bf',
  name,
}: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart
      data={data}
      margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
    >
      <defs>
        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} opacity={0.3} />
      <XAxis
        dataKey={xKey}
        stroke={TEXT_COLOR}
        tick={{ fontSize: 10 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
      />
      <YAxis
        stroke={TEXT_COLOR}
        tick={{ fontSize: 10 }}
        tickLine={false}
        axisLine={{ stroke: GRID_COLOR }}
      />
      <Tooltip content={<CustomTooltip />} />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        fillOpacity={1}
        fill={`url(#color${dataKey})`}
        name={name}
        animationDuration={2500}
        animationEasing="ease-out"
      />
    </AreaChart>
  </ResponsiveContainer>
);

export const SimpleRadarChart = ({ data, dataKey, nameKey }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
      <PolarGrid stroke={GRID_COLOR} opacity={0.5} />
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
        isAnimationActive={true}
      />
      <Tooltip content={<CustomTooltip />} />
    </RadarChart>
  </ResponsiveContainer>
);

export const SimpleRadialBarChart = ({ data, dataKey, nameKey }: any) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadialBarChart
      cx="40%"
      cy="50%"
      innerRadius="30%"
      outerRadius="100%"
      barSize={12}
      data={data}
    >
      <PolarGrid gridType="circle" stroke={GRID_COLOR} opacity={0.2} />
      <RadialBar
        background={{ fill: '#323e37', opacity: 0.5 }}
        dataKey={dataKey}
        cornerRadius={10}
      />
      <Legend
        iconSize={8}
        layout="vertical"
        verticalAlign="middle"
        align="right"
        wrapperStyle={{
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          color: '#94a3b8',
          width: '35%',
        }}
        payload={data.map((item: any) => ({
          id: item[nameKey],
          type: 'square',
          value: `${item[nameKey]}`,
          color: item.fill,
        }))}
      />
      <Tooltip content={<CustomTooltip />} />
    </RadialBarChart>
  </ResponsiveContainer>
);
