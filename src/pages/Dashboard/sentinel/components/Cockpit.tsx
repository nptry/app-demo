import { MapPin, Server, Users } from 'lucide-react';
import React from 'react';
import {
  deviceData,
  facilityData,
  humanTrafficTrend,
  personnelData,
  ticketData,
  trafficTrend,
} from '../data';
import { AreaTrendChart, SimpleLineChart, SimplePieChart } from './Charts';

// --- Tech UI Components ---

const TechBorderContainer = ({
  children,
  title,
  className = '',
  height = 'h-full',
}: any) => (
  <div
    className={`relative bg-[#0b1121]/80 backdrop-blur-md border border-[#1e293b] ${className} ${height} flex flex-col group overflow-hidden rounded-sm`}
  >
    {/* Tech Corners */}
    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-cyan-400"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-cyan-400"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-cyan-400"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-cyan-400"></div>

    {/* Title Bar */}
    <div className="relative px-4 py-2 flex items-center border-b border-slate-800/60 bg-gradient-to-r from-cyan-900/20 to-transparent">
      <div className="w-1 h-3 bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
      <h3 className="text-cyan-100 font-tech tracking-wider text-sm uppercase font-bold text-shadow-sm">
        {title}
      </h3>
      <div className="ml-auto flex space-x-1">
        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 min-h-0 relative p-3">{children}</div>
  </div>
);

// --- Modules ---

// Left 1: Resource Overview
const ResourceOverview = () => {
  const totalDevices = deviceData.length;
  const totalFacilities = facilityData.length;

  return (
    <div className="h-full flex flex-col justify-center space-y-3">
      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
        <div className="flex items-center">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3 border border-blue-500/30">
            <Server className="text-blue-400" size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-xs">感知设备总数</div>
            <div className="text-xl font-tech font-bold text-white">
              {totalDevices}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-700/50">
        <div className="flex items-center">
          <div className="p-2 bg-purple-500/10 rounded-lg mr-3 border border-purple-500/30">
            <MapPin className="text-purple-400" size={20} />
          </div>
          <div>
            <div className="text-slate-400 text-xs">基础设施总数</div>
            <div className="text-xl font-tech font-bold text-white">
              {totalFacilities}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Left 2: Online Rate
const OnlineRateStats = () => {
  const onlineCount = deviceData.filter((d) => d.status === '在线').length;
  const total = deviceData.length;
  const onlineRate = Math.floor((onlineCount / total) * 100);

  const pieData = [
    { name: '在线', value: onlineRate },
    { name: '离线/故障', value: 100 - onlineRate },
  ];

  return (
    <div className="h-full flex items-center relative">
      <div className="w-1/2 h-full relative z-10">
        <SimplePieChart data={pieData} nameKey="name" dataKey="value" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-xl font-bold text-white font-tech">
            {onlineRate}%
          </div>
        </div>
      </div>
      <div className="w-1/2 pl-2 space-y-2">
        <div className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-1">
          <span className="text-slate-400">在线</span>
          <span className="text-cyan-400 font-mono">{onlineCount}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-b border-slate-700/50 pb-1">
          <span className="text-slate-400">离线</span>
          <span className="text-red-400 font-mono">{total - onlineCount}</span>
        </div>
      </div>
    </div>
  );
};

// Left 3: Fault Scrolling List
const FaultList = () => {
  const urgentTickets = ticketData
    .filter((t) => t.status !== '已解决')
    .slice(0, 10);

  return (
    <div className="h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-[#0b1121] to-transparent z-10"></div>
      <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {urgentTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center p-2 bg-slate-800/30 border border-slate-700/30 rounded hover:bg-slate-700/30 transition-colors"
          >
            <div
              className={`w-1 h-6 mr-2 rounded-full ${ticket.level === '紧急' ? 'bg-red-500' : 'bg-yellow-500'}`}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <span className="text-xs text-slate-300 truncate font-medium">
                  {ticket.deviceName}
                </span>
                <span className="text-[10px] text-slate-500">
                  {ticket.createTime.split(' ')[1]}
                </span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-slate-400">
                  {ticket.faultType}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Center 1: Map
const CentralMap = () => {
  return (
    <div className="relative w-full h-full bg-[#020617] rounded overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] perspective-grid"></div>
      <div className="absolute inset-4 border border-cyan-500/10 rounded-lg"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] border border-blue-500/20 rounded-full blur-3xl bg-blue-900/10"></div>

      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          className="w-[80%] h-[80%] stroke-cyan-500 fill-none stroke-[0.5]"
          role="img"
          aria-labelledby="central-map-bg-title"
        >
          <title id="central-map-bg-title">电子地图装饰背景</title>
          <path d="M40,100 Q60,40 100,20 T160,100 T100,180 T40,100" />
          <path
            d="M50,110 Q70,50 100,30 T150,110 T100,170 T50,110"
            className="stroke-blue-600"
          />
        </svg>
      </div>

      {deviceData.slice(0, 15).map((device) => (
        <div
          key={device.id}
          className="absolute w-2 h-2 group-hover:scale-125 transition-transform duration-300 cursor-pointer"
          style={{
            left: `${10 + device.x * 0.8}%`,
            top: `${10 + device.y * 0.8}%`,
          }}
        >
          <div
            className={`absolute -inset-1 rounded-full animate-ping opacity-40 ${device.status === '在线' ? 'bg-cyan-400' : 'bg-red-500'}`}
          ></div>
          <div
            className={`w-full h-full rounded-full border-1 border-white shadow-[0_0_5px_currentColor] ${device.status === '在线' ? 'bg-cyan-500 text-cyan-400' : 'bg-red-600 text-red-500'}`}
          ></div>
        </div>
      ))}
    </div>
  );
};

// Center 2: Personnel Alerts
const PersonnelAlerts = () => {
  const alerts = personnelData
    .filter((p) => p.status === '失控' || p.type === '黑名单人员')
    .slice(0, 3);
  return (
    <div className="h-full flex flex-col space-y-2">
      {alerts.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between p-2 bg-slate-800/30 border border-red-500/20 rounded"
        >
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center mr-2">
              <Users size={12} className="text-slate-300" />
            </div>
            <div>
              <div className="text-xs text-slate-200 font-bold">{p.name}</div>
              <div className="text-[10px] text-red-400">{p.type}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-300">{p.location}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Right 1: Human Flow
const HumanFlow = () => {
  const totalHuman = humanTrafficTrend.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-end justify-between mb-1 px-1">
        <div className="text-slate-400 text-xs">
          今日人次:{' '}
          <span className="text-cyan-400 font-bold">
            {totalHuman.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <AreaTrendChart
          data={humanTrafficTrend}
          xKey="name"
          dataKey="count"
          color="#22d3ee"
          name="人流量"
        />
      </div>
    </div>
  );
};

// Right 2: Traffic Flow
const TrafficFlow = () => {
  const totalTraffic = trafficTrend.reduce(
    (acc, curr) => acc + (curr.total || 500),
    0,
  );
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-end justify-between mb-1 px-1">
        <div className="text-slate-400 text-xs">
          今日车次:{' '}
          <span className="text-blue-400 font-bold">
            {totalTraffic.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <SimpleLineChart
          data={trafficTrend}
          xKey="name"
          dataKey="total"
          color="#3b82f6"
          name="车流量"
        />
      </div>
    </div>
  );
};

// Right 3: Traffic Violations
const TrafficViolations = () => {
  const violations = [
    { type: '红灯违法', loc: '中山路', time: '10:42' },
    { type: '违规停车', loc: '商业街', time: '10:38' },
    { type: '逆行监控', loc: '科技园', time: '10:35' },
    { type: '红灯违法', loc: '中山路', time: '10:15' },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-2 pr-1">
      {violations.map((v) => (
        <div
          key={`${v.type}-${v.loc}-${v.time}`}
          className="flex justify-between items-center p-2 bg-slate-800/30 border border-slate-700/50 rounded"
        >
          <div>
            <span
              className={`text-[10px] px-1 py-0.5 rounded text-white mr-2 ${v.type === '红灯违法' ? 'bg-red-500' : 'bg-yellow-500'}`}
            >
              {v.type}
            </span>
            <span className="text-xs text-slate-300">{v.loc}</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">{v.time}</div>
        </div>
      ))}
    </div>
  );
};

export const Cockpit = () => {
  return (
    <div className="flex flex-col h-full p-4 bg-[#020617] overflow-hidden relative">
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 z-10">
        {/* --- Left Column (3/12) --- */}
        <div className="col-span-3 flex flex-col space-y-4">
          <TechBorderContainer title="系统资源总览" height="h-1/5">
            <ResourceOverview />
          </TechBorderContainer>
          <TechBorderContainer title="设备在线率监控" height="h-1/4">
            <OnlineRateStats />
          </TechBorderContainer>
          <TechBorderContainer title="实时故障告警" height="flex-1">
            <FaultList />
          </TechBorderContainer>
        </div>

        {/* --- Center Column (6/12) --- */}
        <div className="col-span-6 flex flex-col space-y-4">
          <TechBorderContainer
            title="全域电子地图监测"
            height="flex-1"
            className="border-cyan-500/50 shadow-[0_0_30px_rgba(8,145,178,0.1)]"
          >
            <CentralMap />
          </TechBorderContainer>
          <TechBorderContainer title="重点人员实时预警" height="h-1/4">
            <PersonnelAlerts />
          </TechBorderContainer>
        </div>

        {/* --- Right Column (3/12) --- */}
        <div className="col-span-3 flex flex-col space-y-4">
          <TechBorderContainer title="今日人流量监测" height="h-1/4">
            <HumanFlow />
          </TechBorderContainer>
          <TechBorderContainer title="今日车流量监测" height="h-1/4">
            <TrafficFlow />
          </TechBorderContainer>
          <TechBorderContainer title="最新交通违规抓拍" height="flex-1">
            <TrafficViolations />
          </TechBorderContainer>
        </div>
      </div>
    </div>
  );
};
