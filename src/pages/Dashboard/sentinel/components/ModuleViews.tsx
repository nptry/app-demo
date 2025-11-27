import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
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
  facilityData,
  personnelData,
  ticketData,
  trafficTrend,
  userStats,
} from '../data';
import {
  AreaTrendChart,
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
  SimpleRadarChart,
} from './Charts';

// --- UI Components ---

const TechContainer = ({
  children,
  title,
  className = '',
  height = 'h-full',
  icon: Icon,
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
    <div className="relative px-4 py-2 flex items-center border-b border-slate-800/60 bg-gradient-to-r from-cyan-900/20 to-transparent flex-shrink-0 z-20">
      <div className="w-1 h-3 bg-cyan-400 mr-2 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
      {Icon && <Icon size={14} className="mr-2 text-cyan-400" />}
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

const DataSummaryBox = ({ title, value, unit, color = 'text-white' }: any) => (
  <div className="bg-slate-800/40 p-3 rounded border border-slate-700/50 mb-2 backdrop-blur-sm flex justify-between items-center hover:bg-slate-800/60 transition-colors">
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

  // Focus when selectedId changes
  useEffect(() => {
    if (selectedId) {
      const item = items.find((i) => i.id === selectedId);
      if (item && containerRef.current) {
        // Focus logic: Center the item and zoom in
        // item.x/y are percentages (0-100)
        const containerW = containerRef.current.clientWidth;
        const containerH = containerRef.current.clientHeight;

        const targetX = -((item.x / 100) * containerW * 3) + containerW / 2;
        const targetY = -((item.y / 100) * containerH * 3) + containerH / 2;

        setTransform({ k: 3, x: targetX, y: targetY });
      }
    }
  }, [selectedId, items]);

  const handleWheel = (e: React.WheelEvent) => {
    // e.preventDefault(); // React synthetic events generally don't support preventDefault for passive listeners like wheel
    const scaleAmount = -e.deltaY * 0.001;
    let newScale = transform.k + scaleAmount;
    newScale = Math.max(0.5, Math.min(newScale, 5)); // Limit zoom
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
      className="relative w-full h-full bg-[#050b14] overflow-hidden group cursor-move select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

      {/* Map Content Layer */}
      <div
        className="w-full h-full absolute top-0 left-0 transition-transform duration-100 ease-linear origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        }}
      >
        {/* Simulated Map Vector */}
        <svg
          className="absolute inset-0 w-full h-full stroke-slate-700/30 fill-none pointer-events-none vector-map-bg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-labelledby="interactive-map-bg-title"
        >
          <title id="interactive-map-bg-title">示意背景网格</title>
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
          // Determine color
          let colorClass = 'bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]';
          if (
            item.status.includes('离线') ||
            item.status.includes('停用') ||
            item.status.includes('禁用')
          )
            colorClass = 'bg-slate-500 shadow-slate-500/50';
          if (item.status.includes('故障') || item.status.includes('维护'))
            colorClass = 'bg-yellow-500 shadow-yellow-500/50';

          return (
            <div
              key={item.id}
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }} // Prevent drag start when clicking item
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
                    className={`absolute -inset-2 rounded-full border border-cyan-500/30 animate-ping`}
                  ></div>
                )}
              </div>

              {/* Tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900/95 border border-cyan-500/40 p-2 rounded backdrop-blur-md text-[8px] z-50 pointer-events-none transition-all duration-200 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              >
                <div className="font-bold text-cyan-400 mb-1 border-b border-cyan-500/20 pb-1">
                  {item.name}
                </div>
                <div className="grid grid-cols-2 gap-y-0.5 text-slate-300 leading-tight">
                  <span>状态:</span>
                  <span
                    className={
                      item.status.includes('正常') ||
                      item.status.includes('在线')
                        ? 'text-green-400'
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
          className="p-2 bg-slate-800/90 rounded text-cyan-400 border border-slate-700 hover:bg-cyan-900/50 hover:text-white transition-colors"
          onClick={() =>
            setTransform((p) => ({ ...p, k: Math.min(p.k + 0.5, 5) }))
          }
        >
          <ZoomIn size={16} />
        </button>
        <button
          type="button"
          className="p-2 bg-slate-800/90 rounded text-cyan-400 border border-slate-700 hover:bg-cyan-900/50 hover:text-white transition-colors"
          onClick={() =>
            setTransform((p) => ({ ...p, k: Math.max(p.k - 0.5, 0.5) }))
          }
        >
          <ZoomOut size={16} />
        </button>
        <button
          type="button"
          className="p-2 bg-slate-800/90 rounded text-cyan-400 border border-slate-700 hover:bg-cyan-900/50 hover:text-white transition-colors"
          onClick={resetMap}
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Hint */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/40 text-[10px] text-slate-500 rounded border border-white/5 pointer-events-none">
        滚轮缩放 / 拖拽平移
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
            ? 'bg-cyan-900/20 border-l-cyan-400 border-t border-r border-b border-t-cyan-900/50 border-r-cyan-900/50 border-b-cyan-900/50'
            : 'bg-slate-800/20 border-l-transparent border-t border-r border-b border-slate-800/0 hover:bg-slate-800/60 hover:border-l-slate-500'
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
    <div className="h-full p-4 flex gap-4">
      {/* Left Panel */}
      <div className="w-1/4 flex flex-col space-y-4">
        <TechContainer title="设备数据汇总" height="h-auto">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <DataSummaryBox
              title="设备总数"
              value={deviceData.length}
              unit="台"
            />
            <DataSummaryBox
              title="在线率"
              value={onlineRate}
              unit="%"
              color="text-green-400"
            />
          </div>
        </TechContainer>

        <TechContainer title="设备列表" height="flex-1">
          <ItemList
            items={deviceData}
            selectedId={selectedId}
            onSelect={setSelectedId}
            renderItem={(d: any) => (
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm font-medium ${selectedId === d.id ? 'text-cyan-300' : 'text-slate-300 group-hover:text-white'}`}
                >
                  {d.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${d.status === '在线' ? 'bg-green-500/20 text-green-400' : d.status === '故障' ? 'bg-red-500/20 text-red-400' : 'bg-slate-600/50 text-slate-400'}`}
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
          title="设备分布地图"
          height="h-full"
          className="border-cyan-500/30"
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

// --- 2. Facility View ---
export const FacilityPage = () => {
  const [selectedId, setSelectedId] = useState('');
  const statusCounts = {
    normal: facilityData.filter((f) => f.status === '正常').length,
    maint: facilityData.filter((f) => f.status === '维护').length,
    stop: facilityData.filter((f) => f.status === '停用').length,
  };
  const pieData = Object.entries(
    facilityData.reduce((a: any, c) => {
      a[c.type] = (a[c.type] || 0) + 1;
      return a;
    }, {}),
  ).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="h-full p-4 flex gap-4">
      {/* Left Panel */}
      <div className="w-1/4 flex flex-col space-y-4">
        <TechContainer title="设施概况" height="h-1/2">
          <div className="flex justify-between mb-2">
            <div className="flex-1 mr-2">
              <DataSummaryBox
                title="设施总数"
                value={facilityData.length}
                unit="个"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-green-900/20 border border-green-500/30 p-2 rounded text-center">
              <div className="text-[10px] text-green-300/70">正常</div>
              <div className="text-lg font-tech text-green-400">
                {statusCounts.normal}
              </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-2 rounded text-center">
              <div className="text-[10px] text-yellow-300/70">维护</div>
              <div className="text-lg font-tech text-yellow-400">
                {statusCounts.maint}
              </div>
            </div>
            <div className="bg-slate-800/40 border border-slate-600/30 p-2 rounded text-center">
              <div className="text-[10px] text-slate-400">停用</div>
              <div className="text-lg font-tech text-slate-300">
                {statusCounts.stop}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[160px] relative">
            <h4 className="text-[10px] text-slate-500 mb-1 absolute top-0 left-0">
              类型分布
            </h4>
            <SimplePieChart data={pieData} dataKey="value" nameKey="name" />
          </div>
        </TechContainer>

        <TechContainer title="设施列表" height="h-1/2">
          <ItemList
            items={facilityData}
            selectedId={selectedId}
            onSelect={setSelectedId}
            renderItem={(d: any) => (
              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${selectedId === d.id ? 'text-cyan-300' : 'text-slate-300'}`}
                >
                  {d.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-500">{d.type}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${d.status === '正常' ? 'bg-green-500' : d.status === '维护' ? 'bg-yellow-500' : 'bg-slate-500'}`}
                  ></span>
                </div>
              </div>
            )}
          />
        </TechContainer>
      </div>

      {/* Right Map */}
      <div className="flex-1">
        <TechContainer title="设施分布图" height="h-full">
          <InteractiveMap
            items={facilityData}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TechContainer>
      </div>
    </div>
  );
};

// --- 3. Fault Page ---
export const FaultManagementView = () => {
  const statusData = [
    {
      name: '已解决',
      value: ticketData.filter((t) => t.status === '已解决').length,
    },
    {
      name: '处理中',
      value: ticketData.filter((t) => t.status === '处理中').length,
    },
    {
      name: '待派单',
      value: ticketData.filter((t) => t.status === '待派单').length,
    },
  ];
  const typeData = Object.entries(
    ticketData.reduce((acc: any, curr) => {
      acc[curr.faultType] = (acc[curr.faultType] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));
  const radarData = typeData.map((d) => ({
    subject: d.name,
    A: d.value,
    fullMark: 20,
  }));

  return (
    <div className="h-full p-4 grid grid-cols-12 grid-rows-12 gap-4">
      {/* Top Stats */}
      <div className="col-span-12 row-span-2 grid grid-cols-4 gap-4">
        <TechContainer
          title="工单总数"
          height="h-full"
          className="bg-blue-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-white">
              {ticketData.length}
            </div>
            <ClipboardList size={32} className="text-blue-500/50" />
          </div>
        </TechContainer>
        <TechContainer
          title="故障解决率"
          height="h-full"
          className="bg-green-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-green-400">
              {((statusData[0].value / ticketData.length) * 100).toFixed(1)}%
            </div>
            <CheckCircle size={32} className="text-green-500/50" />
          </div>
        </TechContainer>
        <TechContainer title="待派单" height="h-full" className="bg-red-900/10">
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-red-400">
              {statusData[2].value}
            </div>
            <AlertTriangle size={32} className="text-red-500/50" />
          </div>
        </TechContainer>
        <TechContainer
          title="今日新增"
          height="h-full"
          className="bg-yellow-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-yellow-400">
              12
            </div>
            <ShieldAlert size={32} className="text-yellow-500/50" />
          </div>
        </TechContainer>
      </div>

      {/* Middle Charts */}
      <div className="col-span-4 row-span-5">
        <TechContainer title="工单处理状态" height="h-full">
          <SimplePieChart data={statusData} dataKey="value" nameKey="name" />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        <TechContainer title="故障类型分布 (雷达图)" height="h-full">
          <SimpleRadarChart data={radarData} dataKey="A" nameKey="subject" />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        <TechContainer title="故障等级分布" height="h-full">
          <SimpleBarChart
            data={[
              { name: '紧急', v: 10 },
              { name: '重要', v: 25 },
              { name: '一般', v: 45 },
            ]}
            xKey="name"
            series={[{ key: 'v', name: '数量' }]}
          />
        </TechContainer>
      </div>

      {/* Bottom Charts */}
      <div className="col-span-8 row-span-5">
        <TechContainer title="故障发生趋势" height="h-full">
          <SimpleLineChart
            data={[
              { d: '周一', v: 5 },
              { d: '周二', v: 8 },
              { d: '周三', v: 4 },
              { d: '周四', v: 10 },
              { d: '周五', v: 7 },
              { d: '周六', v: 12 },
              { d: '周日', v: 9 },
            ]}
            xKey="d"
            dataKey="v"
            name="故障数"
            color="#ef4444"
          />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        <TechContainer title="故障高发设备 TOP 5" height="h-full">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {ticketData.slice(0, 10).map((t, i) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 bg-slate-800/30 rounded mb-1.5 border border-slate-700/30"
              >
                <span className="text-sm text-slate-300 flex items-center">
                  <span
                    className={`w-5 h-5 rounded text-xs flex items-center justify-center mr-2 font-bold ${i < 3 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}
                  >
                    {i + 1}
                  </span>
                  {t.deviceName}
                </span>
                <span className="text-xs font-mono text-red-400">
                  {Math.floor(Math.random() * 10) + 2}次
                </span>
              </div>
            ))}
          </div>
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
    <div className="h-full p-4 flex gap-4">
      {/* Left */}
      <div className="w-1/5 flex flex-col space-y-4">
        <TechContainer title="卡口概览" height="h-1/3">
          <DataSummaryBox
            title="卡口总数"
            value={checkpointData.length}
            unit="个"
          />
          <div className="flex space-x-2 mt-2">
            <div className="flex-1 bg-blue-900/20 border border-blue-500/30 p-2 rounded text-center">
              <div className="text-[10px] text-blue-300">启用</div>
              <div className="text-lg font-bold text-blue-400">
                {enabledCount}
              </div>
            </div>
            <div className="flex-1 bg-slate-800/40 border border-slate-600/30 p-2 rounded text-center">
              <div className="text-[10px] text-slate-400">停用</div>
              <div className="text-lg font-bold text-slate-500">
                {checkpointData.length - enabledCount}
              </div>
            </div>
          </div>
        </TechContainer>
        <TechContainer title="卡口列表" height="flex-1">
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
        <TechContainer title="卡口分布图" height="h-full">
          <InteractiveMap
            items={checkpointData}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </TechContainer>
      </div>

      {/* Right Stats */}
      <div className="w-1/4 flex flex-col space-y-4">
        <TechContainer title="预警类型分布" height="h-1/3">
          <SimplePieChart
            data={[
              { name: '车牌识别', value: 1200 },
              { name: '红灯违法', value: 128 },
              { name: '逆行监控', value: 45 },
              { name: '违规停车', value: 169 },
            ]}
            dataKey="value"
            nameKey="name"
          />
        </TechContainer>
        <TechContainer title="红灯违法趋势" height="h-1/3">
          <SimpleLineChart
            data={trafficTrend}
            xKey="name"
            dataKey="redLight"
            name="红灯"
            color="#ef4444"
          />
        </TechContainer>
        <TechContainer title="违规停车趋势" height="flex-1">
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
    <div className="h-full p-4 flex gap-4">
      {/* Left */}
      <div className="w-1/5 flex flex-col space-y-4">
        <TechContainer title="区域概况" height="h-auto">
          <DataSummaryBox
            title="场所总数"
            value={crowdAreas.length}
            unit="个"
          />
          <DataSummaryBox
            title="覆盖总面积"
            value={(totalArea / 10000).toFixed(1)}
            unit="万㎡"
            color="text-green-400"
          />
        </TechContainer>
        <TechContainer title="重点场所列表" height="flex-1">
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
                  className={`text-[10px] px-1 rounded ${d.status === '启用' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-600/30 text-slate-500'}`}
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
        <TechContainer title="人流热力图" height="h-full">
          <InteractiveMap
            items={crowdAreas}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showHeatmap={true}
          />
        </TechContainer>
      </div>

      {/* Right Alerts */}
      <div className="w-1/4 flex flex-col space-y-4">
        <TechContainer title="实时密度预警" height="h-full">
          <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded mb-4">
            <div>
              <div className="text-xs text-red-300">当前预警数</div>
              <div className="text-3xl font-bold text-red-500 font-tech">5</div>
            </div>
            <AlertTriangle className="text-red-500 animate-pulse" size={32} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {[
              '10:41',
              '10:42',
              '10:43',
              '10:44',
              '10:45',
              '10:46',
              '10:47',
            ].map((time) => (
              <div
                key={`density-${time}`}
                className="p-3 bg-slate-800/30 border border-slate-700/50 rounded mb-2 hover:border-red-500/30 hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-red-300">
                    商业广场-B区
                  </span>
                  <span className="text-[10px] text-slate-500">{time}</span>
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
    <div className="h-full p-4 grid grid-cols-12 grid-rows-12 gap-4">
      {/* Stats Row */}
      <div className="col-span-3 row-span-2">
        <TechContainer
          title="重点人员总数"
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
        <TechContainer
          title="监控预警总数"
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
        <TechContainer
          title="失控人员"
          height="h-full"
          className="bg-orange-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-orange-500">
              {statusData[1].value}
            </div>
            <AlertTriangle size={28} className="text-orange-400" />
          </div>
        </TechContainer>
      </div>
      <div className="col-span-3 row-span-2">
        <TechContainer
          title="今日新增"
          height="h-full"
          className="bg-cyan-900/10"
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="text-3xl font-tech font-bold text-cyan-500">3</div>
            <Users size={28} className="text-cyan-400" />
          </div>
        </TechContainer>
      </div>

      {/* Chart Row 1 */}
      <div className="col-span-4 row-span-5">
        <TechContainer title="人员类型分布" height="h-full">
          <SimplePieChart data={typeData} dataKey="value" nameKey="name" />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        <TechContainer title="人员状态分布" height="h-full">
          <SimpleBarChart
            data={statusData}
            xKey="name"
            series={[{ key: 'value', name: '人数' }]}
          />
        </TechContainer>
      </div>
      <div className="col-span-4 row-span-5">
        <TechContainer title="预警特征分析" height="h-full">
          <SimpleRadarChart data={radarData} dataKey="A" nameKey="subject" />
        </TechContainer>
      </div>

      {/* Chart Row 2 */}
      <div className="col-span-8 row-span-5">
        <TechContainer title="预警趋势 (24小时)" height="h-full">
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
        <TechContainer title="预警处理状态" height="h-full">
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

// --- 7. User View ---
export const UserManagementView = () => {
  return (
    <div className="h-full p-4 grid grid-cols-12 grid-rows-12 gap-4">
      {/* Stats */}
      <div className="col-span-3 row-span-3">
        <TechContainer title="平台概况" height="h-full">
          <div className="space-y-3 pt-2">
            <DataSummaryBox
              title="权限总数"
              value={userStats.permissions.total}
              unit="项"
              color="text-purple-400"
            />
            <DataSummaryBox
              title="角色总数"
              value={userStats.roles.total}
              unit="个"
              color="text-blue-400"
            />
            <DataSummaryBox
              title="账号总数"
              value={userStats.accounts.total}
              unit="个"
              color="text-cyan-400"
            />
          </div>
        </TechContainer>
      </div>

      <div className="col-span-3 row-span-3">
        <TechContainer title="权限类型" height="h-full">
          <SimplePieChart
            data={[
              { name: '使用', value: userStats.permissions.usage },
              { name: '管理', value: userStats.permissions.management },
            ]}
            nameKey="name"
            dataKey="value"
          />
        </TechContainer>
      </div>
      <div className="col-span-3 row-span-3">
        <TechContainer title="角色状态" height="h-full">
          <SimpleBarChart
            data={[
              { name: '启用', v: userStats.roles.active },
              { name: '禁用', v: userStats.roles.disabled },
            ]}
            xKey="name"
            series={[{ key: 'v', name: '角色' }]}
          />
        </TechContainer>
      </div>
      <div className="col-span-3 row-span-3">
        <TechContainer title="部门覆盖率" height="h-full">
          <SimpleRadarChart
            data={[
              { subject: '安保', A: 90, fullMark: 100 },
              { subject: '运维', A: 85, fullMark: 100 },
              { subject: '行政', A: 60, fullMark: 100 },
              { subject: '交通', A: 95, fullMark: 100 },
            ]}
            dataKey="A"
            nameKey="subject"
          />
        </TechContainer>
      </div>

      {/* Bottom Trend */}
      <div className="col-span-12 row-span-9">
        <TechContainer title="系统操作日志趋势" height="h-full">
          <AreaTrendChart
            data={userStats.logs.trend.map((v, i) => ({
              name: `Day ${i + 1}`,
              val: v,
            }))}
            xKey="name"
            dataKey="val"
            name="日志量"
            color="#22d3ee"
          />
        </TechContainer>
      </div>
    </div>
  );
};
