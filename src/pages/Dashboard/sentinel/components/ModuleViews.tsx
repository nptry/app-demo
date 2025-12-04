import {
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  checkpointData,
  crowdAreas,
  deviceData,
  personnelData,
  trafficTrend,
} from '../data';
import {
  AreaTrendChart,
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
  SimpleRadarChart,
} from './Charts';

// --- UI Components (Theme: #323e37 / Emerald) ---

const TechContainer = ({
  children,
  title,
  className = '',
  height = 'h-full',
  icon: Icon,
}: any) => (
  <div
    className={`relative bg-[#323e37]/40 backdrop-blur-md border border-[#4a5f54] ${className} ${height} flex flex-col group overflow-hidden rounded-sm transition-all hover:border-[#4ade80]/50 hover:bg-[#323e37]/60`}
  >
    {/* Tech Corners - Emerald */}
    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>

    {/* Title Bar */}
    <div className="relative px-4 py-2 flex items-center border-b border-[#4a5f54] bg-gradient-to-r from-[#1c2622] to-transparent flex-shrink-0 z-20">
      <div className="w-1 h-3 bg-[#4ade80] mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
      {Icon && <Icon size={14} className="mr-2 text-[#4ade80]" />}
      <h3 className="text-emerald-100 font-tech tracking-wider text-sm uppercase font-bold text-shadow-sm italic">
        {title}
      </h3>
      <div className="ml-auto flex space-x-1">
        <div className="w-1 h-1 bg-[#4a5f54] rounded-full"></div>
        <div className="w-1 h-1 bg-[#4a5f54] rounded-full"></div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 min-h-0 relative p-3 text-slate-200">{children}</div>
  </div>
);

const DataSummaryBox = ({ title, value, unit, color = 'text-white' }: any) => (
  <div className="bg-[#1c2622]/40 p-3 rounded border border-[#4a5f54]/50 mb-2 backdrop-blur-sm flex justify-between items-center hover:bg-[#323e37]/60 transition-colors">
    <div className="text-slate-400 text-xs font-medium">{title}</div>
    <div className={`text-xl font-tech font-bold ${color}`}>
      {value}{' '}
      <span className="text-xs text-slate-500 font-sans ml-1">{unit}</span>
    </div>
  </div>
);

// --- Interactive Map Component (Zoomable) ---
interface MapItem {
  id: string;
  x: number;
  y: number;
  status: string;
  type?: string;
  name: string;
  [key: string]: any;
}

const InteractiveMap = ({
  items,
  selectedId,
  onSelect,
  showHeatmap = false,
}: {
  items: MapItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  showHeatmap?: boolean;
}) => {
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (selectedId) {
      const item = items.find((i) => i.id === selectedId);
      if (item && containerRef.current) {
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;
        const targetX = -((item.x / 100) * containerW * 3) + containerW / 2;
        const targetY = -((item.y / 100) * containerH * 3) + containerH / 2;
        setTransform({ k: 3, x: targetX, y: targetY });
      }
    }
  }, [selectedId, items]);

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    let newScale = transform.k + scaleAmount;
    newScale = Math.max(0.5, Math.min(newScale, 5));
    setTransform((prev) => ({ ...prev, k: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startPos.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const resetMap = () => {
    setTransform({ k: 1, x: 0, y: 0 });
    onSelect('');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#0b1210] overflow-hidden group cursor-move select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

      {/* Map Content Layer */}
      <div
        className="w-full h-full absolute top-0 left-0 transition-transform duration-100 ease-linear origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        }}
      >
        {/* Simulated Map Vector */}
        <svg
          className="absolute inset-0 w-full h-full stroke-[#4ade80]/20 fill-none pointer-events-none vector-map-bg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
        >
          <title>监测区域分布图</title>
          <path d="M0,50 Q25,25 50,50 T100,50" strokeWidth="0.2" />
          <path d="M50,0 Q75,50 50,100" strokeWidth="0.2" />
          <circle
            cx="50"
            cy="50"
            r="30"
            strokeDasharray="1 1"
            strokeWidth="0.2"
          />
          <rect x="20" y="20" width="10" height="10" strokeWidth="0.2" />
          <rect x="70" y="60" width="15" height="20" strokeWidth="0.2" />
        </svg>

        {/* Items */}
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          let colorClass = 'bg-[#4ade80] shadow-[0_0_10px_#4ade80]';
          if (
            item.status.includes('离线') ||
            item.status.includes('停用') ||
            item.status.includes('禁用')
          )
            colorClass = 'bg-slate-500 shadow-slate-500/50';
          if (item.status.includes('故障') || item.status.includes('维护'))
            colorClass = 'bg-amber-500 shadow-amber-500/50';

          return (
            <div
              key={item.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:z-20`}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {/* Heatmap Area */}
              {showHeatmap && (
                <div className="absolute -inset-12 bg-red-500/10 blur-xl rounded-full pointer-events-none"></div>
              )}

              {/* Marker */}
              <div
                className={`relative transition-all duration-300 ${isSelected ? 'scale-150' : 'hover:scale-125'}`}
              >
                <div
                  className={`w-2 h-2 rounded-full border border-white/80 ${colorClass}`}
                ></div>
                {/* Pulse Ring */}
                {(item.status === '在线' ||
                  item.status === '正常' ||
                  item.status === '启用') && (
                  <div
                    className={`absolute -inset-2 rounded-full border border-[#4ade80]/30 animate-ping`}
                  ></div>
                )}
              </div>

              {/* Tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-[#1c2622]/95 border border-[#4ade80]/40 p-2 rounded backdrop-blur-md text-[8px] z-50 pointer-events-none transition-all duration-200 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              >
                <div className="font-bold text-[#4ade80] mb-1 border-b border-[#4ade80]/20 pb-1">
                  {item.name}
                </div>
                <div className="grid grid-cols-2 gap-y-0.5 text-slate-300 leading-tight">
                  <span>状态:</span>
                  <span
                    className={
                      item.status.includes('正常') ||
                      item.status.includes('在线')
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }
                  >
                    {item.status}
                  </span>
                  {item.type && (
                    <span className="col-span-2 text-slate-500">
                      {item.type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-30">
        <button
          type="button"
          className="p-2 bg-[#1c2622]/90 rounded text-[#4ade80] border border-[#4a5f54] hover:bg-[#323e37] hover:text-white transition-colors"
          onClick={() =>
            setTransform((p) => ({ ...p, k: Math.min(p.k + 0.5, 5) }))
          }
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          className="p-2 bg-[#1c2622]/90 rounded text-[#4ade80] border border-[#4a5f54] hover:bg-[#323e37] hover:text-white transition-colors"
          onClick={() =>
            setTransform((p) => ({ ...p, k: Math.max(p.k - 0.5, 0.5) }))
          }
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          className="p-2 bg-[#1c2622]/90 rounded text-[#4ade80] border border-[#4a5f54] hover:bg-[#323e37] hover:text-white transition-colors"
          onClick={resetMap}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

// --- List Component ---
const ItemList = ({ items, onSelect, selectedId, renderItem }: any) => (
  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 mt-2">
    {items.map((item: any) => (
      <div
        key={item.id}
        onClick={() => onSelect(item.id)}
        className={`p-2.5 rounded-sm cursor-pointer border-l-2 transition-all group ${
          selectedId === item.id
            ? 'bg-[#4ade80]/10 border-l-[#4ade80] border-t border-r border-b border-[#4ade80]/20'
            : 'bg-[#1c2622]/40 border-l-transparent border-t border-r border-b border-transparent hover:bg-[#1c2622]/80 hover:border-l-[#4a5f54]'
        }`}
      >
        {renderItem(item)}
      </div>
    ))}
  </div>
);

// --- 1. Device View ---
export const DeviceFacilityView = () => {
  const [selectedId, setSelectedId] = useState('');
  const onlineCount = deviceData.filter((d) => d.status === '在线').length;
  const onlineRate = ((onlineCount / deviceData.length) * 100).toFixed(1);

  return (
    <div className="h-full p-3 flex gap-3">
      {/* Left Panel */}
      <div className="w-1/4 flex flex-col gap-3">
        {/* 设备数据汇总 */}
        <TechContainer title="Data Summary" height="h-auto">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DataSummaryBox title="Total" value={deviceData.length} unit="台" />
            <DataSummaryBox
              title="Online Rate"
              value={onlineRate}
              unit="%"
              color="text-[#4ade80]"
            />
          </div>
        </TechContainer>

        <TechContainer title="Device List" height="flex-1">
          <ItemList
            items={deviceData}
            selectedId={selectedId}
            onSelect={setSelectedId}
            renderItem={(d: any) => (
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm font-medium ${selectedId === d.id ? 'text-[#4ade80]' : 'text-slate-300 group-hover:text-white'}`}
                >
                  {d.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${d.status === '在线' ? 'bg-emerald-500/20 text-emerald-400' : d.status === '故障' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-slate-400'}`}
                >
                  {d.status}
                </span>
              </div>
            )}
          />
        </TechContainer>
      </div>

      {/* Right Map */}
      <div className="flex-1">
        <TechContainer
          title="Device Distribution"
          height="h-full"
          className="border-[#4ade80]/30"
        >
          <InteractiveMap
            items={deviceData}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TechContainer>
      </div>
    </div>
  );
};

// --- 4. Traffic View ---
export const TrafficMountView = () => {
  const [selectedId, setSelectedId] = useState('');
  const enabledCount = checkpointData.filter((c) => c.status === '启用').length;

  return (
    <div className="h-full p-3 flex gap-3">
      {/* Left */}
      <div className="w-1/5 flex flex-col gap-3">
        <TechContainer title="Overview" height="h-1/3">
          {/* 卡口总数 */}
          <DataSummaryBox
            title="Total"
            value={checkpointData.length}
            unit="个"
          />
          <div className="flex space-x-2 mt-2">
            <div className="flex-1 bg-blue-900/20 border border-blue-500/30 p-2 rounded text-center">
              <div className="text-[10px] text-blue-300">Enable</div>
              <div className="text-lg font-bold text-blue-400">
                {enabledCount}
              </div>
            </div>
            <div className="flex-1 bg-[#1c2622]/40 border border-[#4a5f54]/30 p-2 rounded text-center">
              <div className="text-[10px] text-slate-400">Disable</div>
              <div className="text-lg font-bold text-slate-500">
                {checkpointData.length - enabledCount}
              </div>
            </div>
          </div>
        </TechContainer>
        <TechContainer title="Checkpoint List" height="flex-1">
          <ItemList
            items={checkpointData}
            selectedId={selectedId}
            onSelect={setSelectedId}
            renderItem={(d: any) => (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">
                  {d.name}
                </span>
                <span
                  className={`text-[10px] ${d.status === '启用' ? 'text-blue-400' : 'text-slate-500'}`}
                >
                  {d.status}
                </span>
              </div>
            )}
          />
        </TechContainer>
      </div>

      {/* Center Map */}
      <div className="flex-1">
        <TechContainer title="Traffic Checkpoints" height="h-full">
          <InteractiveMap
            items={checkpointData}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TechContainer>
      </div>

      {/* Right Stats */}
      <div className="w-1/4 flex flex-col gap-3">
        {/* 违规类型分布 */}
        <TechContainer title="Violation Type Distribution" height="h-[35%]">
          <SimplePieChart
            data={[
              { name: '车牌识别', value: 1200 },
              { name: '红灯违法', value: 128 },
              { name: '逆行监控', value: 45 },
              { name: '违规停车', value: 169 },
            ]}
            dataKey="value"
            nameKey="name"
            animate
          />
        </TechContainer>
        {/* 红灯违法趋势 */}
        <TechContainer title="Red Light Running" height="h-[30%]">
          <SimpleLineChart
            data={trafficTrend}
            xKey="name"
            dataKey="redLight"
            name="红灯"
            color="#ef4444"
          />
        </TechContainer>
        {/* 违规停车趋势 */}
        <TechContainer title="llegal Parking" height="flex-1">
          <AreaTrendChart
            data={trafficTrend}
            xKey="name"
            dataKey="illegalPark"
            name="违停"
            color="#fbbf24"
          />
        </TechContainer>
      </div>
    </div>
  );
};

// --- 5. Crowd View ---
export const CrowdAreaView = () => {
  const [selectedId, setSelectedId] = useState('');
  const totalArea = crowdAreas.reduce((acc, c) => acc + c.areaSize, 0);

  return (
    <div className="h-full p-3 flex gap-3">
      {/* Left */}
      <div className="w-1/5 flex flex-col gap-3">
        <TechContainer title="Area Overview" height="h-auto">
          <DataSummaryBox
            title="场所总数"
            value={crowdAreas.length}
            unit="个"
          />
          <DataSummaryBox
            title="覆盖总面积"
            value={(totalArea / 10000).toFixed(1)}
            unit="万㎡"
            color="text-[#4ade80]"
          />
        </TechContainer>
        <TechContainer title="Key Area List" height="flex-1">
          <ItemList
            items={crowdAreas}
            selectedId={selectedId}
            onSelect={setSelectedId}
            renderItem={(d: any) => (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">
                  {d.name}
                </span>
                <span
                  className={`text-[10px] px-1 rounded ${d.status === '启用' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/30 text-slate-500'}`}
                >
                  {d.status}
                </span>
              </div>
            )}
          />
        </TechContainer>
      </div>

      {/* Center Map */}
      <div className="flex-1">
        {/* 人流热力图 */}
        <TechContainer title="Pedestrian Flow Heatmap" height="h-full">
          <InteractiveMap
            items={crowdAreas}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showHeatmap={true}
          />
        </TechContainer>
      </div>

      {/* Right Alerts */}
      <div className="w-1/4 flex flex-col gap-3">
        {/* 实时密度预警 */}
        <TechContainer title="Real-Time Crowd Density Alarm" height="h-full">
          <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded mb-4 shrink-0">
            <div>
              <div className="text-xs text-red-300">当前预警数</div>
              <div className="text-3xl font-bold text-red-500 font-tech">5</div>
            </div>
            <AlertTriangle className="text-red-500 animate-pulse" size={32} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {Array.from({ length: 7 }, (_, idx) => ({
              id: `density-alert-${idx}`,
              time: `10:4${idx}`,
            })).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-[#1c2622]/40 border border-[#4a5f54]/50 rounded mb-2 hover:border-red-500/30 hover:bg-[#1c2622]/60 transition-colors group"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-red-300">
                    商业广场-B区
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {alert.time}
                  </span>
                </div>
                <div className="text-xs text-red-400 flex items-center">
                  <ShieldAlert size={12} className="mr-1" /> 人群密度过高
                  (3.2人/㎡)
                </div>
              </div>
            ))}
          </div>
        </TechContainer>
      </div>
    </div>
  );
};

// --- 6. Personnel View ---
export const KeyPersonnelView = () => {
  const statusData = [
    {
      name: '在控',
      value: personnelData.filter((p) => p.status === '在控').length,
    },
    {
      name: '失控',
      value: personnelData.filter((p) => p.status === '失控').length,
    },
    {
      name: '已解除',
      value: personnelData.filter((p) => p.status === '已解除').length,
    },
  ];
  const typeData = [
    {
      name: '重点关注',
      value: personnelData.filter((p) => p.type === '重点关注人员').length,
    },
    {
      name: '黑名单',
      value: personnelData.filter((p) => p.type === '黑名单人员').length,
    },
    {
      name: '限制进入',
      value: personnelData.filter((p) => p.type === '限制进入人员').length,
    },
  ];
  const radarData = [
    { subject: '活动频率', A: 120, fullMark: 150 },
    { subject: '预警次数', A: 98, fullMark: 150 },
    { subject: '轨迹异常', A: 86, fullMark: 150 },
    { subject: '同行密切', A: 99, fullMark: 150 },
    { subject: '夜间活动', A: 85, fullMark: 150 },
    { subject: '区域越界', A: 65, fullMark: 150 },
  ];

  return (
    <div className="h-full p-3 grid grid-cols-12 grid-rows-12 gap-3">
      {/* Stats Row */}
      <div className="col-span-3 row-span-2">
        {/* 重点人员总数 */}
        <TechContainer
          title="Total Key Personnel"
          height="h-full"
          className="bg-indigo-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-white">
              {personnelData.length}
            </div>
            <Users size={28} className="text-indigo-400" />
          </div>
        </TechContainer>
      </div>
      <div className="col-span-3 row-span-2">
        {/* 监控预警总数 */}
        <TechContainer
          title="Total Alarm Number"
          height="h-full"
          className="bg-red-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-red-500">142</div>
            <ShieldAlert size={28} className="text-red-400" />
          </div>
        </TechContainer>
      </div>
      <div className="col-span-3 row-span-2">
        {/* 失控人员 */}
        <TechContainer
          title="Out-of-Control Personnel"
          height="h-full"
          className="bg-amber-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-amber-500">
              {statusData[1].value}
            </div>
            <AlertTriangle size={28} className="text-amber-400" />
          </div>
        </TechContainer>
      </div>
      <div className="col-span-3 row-span-2">
        {/* 今日新增 */}
        <TechContainer
          title="Today's New Additions"
          height="h-full"
          className="bg-[#2dd4bf]/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-[#2dd4bf]">3</div>
            <Users size={28} className="text-[#2dd4bf]" />
          </div>
        </TechContainer>
      </div>

      {/* Chart Row 1 */}
      <div className="col-span-4 row-span-5">
        {/* 人员类型分布 */}
        <TechContainer title="Personnel Type Distribution" height="h-full">
          <SimplePieChart
            data={typeData}
            dataKey="value"
            nameKey="name"
            animate
          />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        {/* 人员状态分布 */}
        <TechContainer title="Personnel Status Distribution" height="h-full">
          <SimpleBarChart
            data={statusData}
            xKey="name"
            series={[{ key: 'value', name: '人数' }]}
          />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        {/* 预警特征分析 */}
        <TechContainer title="Alarm Feature Analysis" height="h-full">
          <SimpleRadarChart data={radarData} dataKey="A" nameKey="subject" />
        </TechContainer>
      </div>

      {/* Chart Row 2 */}
      <div className="col-span-8 row-span-5">
        {/* 预警趋势 (24小时) */}
        <TechContainer title="Trend" height="h-full">
          <SimpleLineChart
            data={trafficTrend}
            xKey="name"
            dataKey="total"
            name="预警数"
            color="#f472b6"
          />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        {/* 预警处理状态 */}
        <TechContainer title="Alarm Event Handling" height="h-full">
          <SimplePieChart
            data={[
              { name: '已处理', value: 80 },
              { name: '待处理', value: 20 },
            ]}
            dataKey="value"
            nameKey="name"
          />
        </TechContainer>
      </div>
    </div>
  );
};
