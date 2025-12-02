import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  checkpointData,
  crowdAlertTrend,
  crowdAreas,
  deviceData,
  humanTrafficTrend,
  intrusionByArea,
  trafficTrend,
} from '../data';
import { AreaTrendChart, SimplePieChart, SimpleRadialBarChart } from './Charts';

// --- Tech UI Components ---

const TechBorderContainer = ({
  children,
  title,
  className = '',
  height = 'h-full',
}: any) => (
  <div
    className={`relative bg-[#323e37]/40 backdrop-blur-sm border border-[#4a5f54] ${className} ${height} flex flex-col group overflow-hidden rounded-sm transition-all hover:border-[#4ade80]/50 hover:bg-[#323e37]/60`}
  >
    {/* Tech Corners */}
    <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>
    <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>
    <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#4ade80] transition-all group-hover:w-4 group-hover:h-4"></div>

    {/* Title Bar */}
    <div className="relative px-3 py-1.5 flex items-center border-b border-[#4a5f54] bg-gradient-to-r from-[#1c2622] to-transparent shrink-0">
      <div className="w-1.5 h-1.5 bg-[#4ade80] mr-2 rotate-45"></div>
      <h3 className="text-emerald-100 font-tech tracking-widest text-sm uppercase font-bold text-shadow-sm italic truncate">
        {title}
      </h3>
      <div className="ml-auto flex items-center space-x-1">
        <div className="w-8 h-[1px] bg-[#4ade80]/30"></div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 min-h-0 relative p-3 text-slate-200 overflow-hidden">
      {children}
    </div>
  </div>
);

// --- Modules ---

// 1. Central Tech Map
const CentralMap = () => {
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });

  // Abstract City Map Outline Path
  const mapPath =
    'M150,100 L250,80 L350,90 L450,60 L550,80 L580,150 L520,220 L550,300 L480,350 L400,380 L300,360 L200,380 L100,350 L50,250 L80,180 Z';
  const riverPath = 'M200,380 Q300,300 350,200 T500,100';

  return (
    <div className="relative w-full h-full bg-[#0b1210] rounded overflow-hidden group border border-[#4a5f54]/30 flex items-center justify-center">
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(74,222,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.05)_1px,transparent_1px)] bg-[size:40px_40px] perspective-grid"></div>

      <div
        className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden"
        style={{ transform: `scale(${transform.k})` }}
      >
        <svg
          viewBox="0 0 600 450"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]"
          role="img"
        >
          <title>城市全域态势图</title>
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1c2622" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#323e37" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Map Outline */}
          <g className="animate-pulse-slow">
            <path
              d={mapPath}
              fill="url(#mapGradient)"
              stroke="#4ade80"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />
            {/* River/Road Artery */}
            <path
              d={riverPath}
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="2"
              strokeOpacity="0.3"
              strokeDasharray="5 5"
            />
          </g>

          {/* Scanning Radar Effect */}
          <circle
            cx="300"
            cy="225"
            r="100"
            stroke="#4ade80"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          >
            <animate
              attributeName="r"
              from="0"
              to="300"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.5"
              to="0"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Data Points */}
        <div className="absolute inset-0 pointer-events-none">
          {deviceData.slice(0, 30).map((device, i) => (
            <div
              key={device.id ?? `device-point-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]"
              style={{
                left: `${20 + device.x * 0.6}%`,
                top: `${20 + device.y * 0.6}%`,
                animation: `pulse ${2 + Math.random()}s infinite`,
              }}
            />
          ))}
          {/* Hotspots */}
          <div className="absolute top-[40%] left-[45%] w-20 h-20 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
          <div className="absolute top-[60%] left-[60%] w-16 h-16 bg-amber-500/20 blur-xl rounded-full animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-30 opacity-60 hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1.5 bg-[#1c2622] rounded text-[#4ade80] border border-[#4a5f54]"
          onClick={() =>
            setTransform((p) => ({ ...p, k: Math.min(p.k + 0.5, 3) }))
          }
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          className="p-1.5 bg-[#1c2622] rounded text-[#4ade80] border border-[#4a5f54]"
          onClick={() =>
            setTransform((p) => ({ ...p, k: Math.max(p.k - 0.5, 0.5) }))
          }
        >
          <ZoomOut size={14} />
        </button>
      </div>
    </div>
  );
};

// 2. Center Bottom - Camera Carousel
const cameraFeeds = [
  {
    id: 'CAM-01',
    location: '南门广场',
    resolution: '4K球机',
    traffic: '行人 238/5min',
    alert: '密度 82%',
    latency: '延迟 32ms',
    bitrate: '码率 12Mbps',
    temperature: '22℃',
    status: '在线',
    color: '#4ade80',
  },
  {
    id: 'CAM-02',
    location: '地铁站厅',
    resolution: '2K云台',
    traffic: '行人 185/5min',
    alert: '拥挤 65%',
    latency: '延迟 40ms',
    bitrate: '码率 10Mbps',
    temperature: '24℃',
    status: '在线',
    color: '#2dd4bf',
  },
  {
    id: 'CAM-03',
    location: '市民中心',
    resolution: 'AI固定枪机',
    traffic: '行人 92/5min',
    alert: '异常停留 3人',
    latency: '延迟 28ms',
    bitrate: '码率 9Mbps',
    temperature: '23℃',
    status: '在线',
    color: '#fbbf24',
  },
  {
    id: 'CAM-04',
    location: '景区入口',
    resolution: '4K球机',
    traffic: '行人 312/5min',
    alert: '密度 90%',
    latency: '延迟 35ms',
    bitrate: '码率 14Mbps',
    temperature: '25℃',
    status: '在线',
    color: '#f87171',
  },
  {
    id: 'CAM-05',
    location: '商业街东段',
    resolution: '云台枪机',
    traffic: '行人 210/5min',
    alert: '店外排队',
    latency: '延迟 30ms',
    bitrate: '码率 11Mbps',
    temperature: '26℃',
    status: '在线',
    color: '#60a5fa',
  },
  {
    id: 'CAM-06',
    location: '智慧停车场',
    resolution: '双光谱',
    traffic: '车流 125/5min',
    alert: '违停 1起',
    latency: '延迟 27ms',
    bitrate: '码率 8Mbps',
    temperature: '24℃',
    status: '在线',
    color: '#a78bfa',
  },
];

const CAMERA_SLIDE_SIZE = 3;
const cameraSlides = Array.from(
  { length: Math.ceil(cameraFeeds.length / CAMERA_SLIDE_SIZE) },
  (_, index) => {
    const cameras = cameraFeeds.slice(
      index * CAMERA_SLIDE_SIZE,
      index * CAMERA_SLIDE_SIZE + CAMERA_SLIDE_SIZE,
    );
    const slideId =
      cameras.map((cam) => cam.id).join('-') || `camera-slide-${index}`;
    const placeholders = Array.from(
      { length: Math.max(0, CAMERA_SLIDE_SIZE - cameras.length) },
      (_, fillerIdx) => `${slideId}-placeholder-${fillerIdx + 1}`,
    );

    return { id: slideId, cameras, placeholders };
  },
).filter((slide) => slide.cameras.length > 0);

const CameraCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = cameraSlides.length || 1;
  const onlineCameras = cameraFeeds.filter(
    (cam) => cam.status === '在线',
  ).length;

  useEffect(() => {
    if (totalSlides <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleSlideChange = (direction: 'prev' | 'next') => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) =>
      direction === 'next'
        ? (prev + 1) % totalSlides
        : (prev - 1 + totalSlides) % totalSlides,
    );
  };

  const getStatusColor = (status: string) => {
    if (status === '在线') return '#4ade80';
    if (status === '维护') return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <div className="flex items-center space-x-3">
          <span className="text-emerald-300 font-semibold">
            {onlineCameras} 路在线
          </span>
          <span className="text-slate-500">共 {cameraFeeds.length} 路接入</span>
        </div>
        {totalSlides > 1 && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-1 rounded border border-[#4a5f54] text-slate-300 hover:text-white hover:border-[#4ade80]/60 transition-colors"
              onClick={() => handleSlideChange('prev')}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="p-1 rounded border border-[#4a5f54] text-slate-300 hover:text-white hover:border-[#4ade80]/60 transition-colors"
              onClick={() => handleSlideChange('next')}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-0 overflow-hidden rounded border border-[#4a5f54]/40 bg-[#0d1412]/70">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
              width: `${totalSlides * 100}%`,
              transform: `translateX(-${(100 / totalSlides) * currentSlide}%)`,
            }}
          >
            {cameraSlides.map((slide) => (
              <div
                key={slide.id}
                className="w-full flex-shrink-0 flex gap-3 p-2"
                style={{ width: `${100 / totalSlides}%` }}
              >
                {slide.cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="flex-1 min-w-0 bg-[#111c17]/80 border border-[#4ade80]/20 rounded relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        backgroundImage: `radial-gradient(circle at 30% 20%, ${camera.color}33, transparent 65%)`,
                      }}
                    ></div>
                    <div className="relative z-10 flex flex-col h-full p-2 space-y-2">
                      <div className="relative h-24 w-full rounded bg-[#0b1210]/80 overflow-hidden">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${camera.color}55, rgba(7,15,13,0.9))`,
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_0%,transparent_40%)] opacity-40" />
                        <div className="absolute top-1 left-1 text-[10px] font-mono text-white bg-black/40 px-1 rounded">
                          {camera.id}
                        </div>
                        <div className="absolute bottom-1 left-1 flex items-center text-[10px] text-white space-x-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(camera.status),
                            }}
                          ></span>
                          <span>{camera.status}</span>
                        </div>
                        <div className="absolute bottom-1 right-1 text-[10px] text-white bg-black/40 px-1 rounded">
                          {camera.resolution}
                        </div>
                      </div>
                      <div className="flex-1 text-[11px] text-slate-300">
                        <div className="flex items-center justify-between font-semibold text-xs">
                          <span className="truncate">{camera.location}</span>
                          <span className="text-emerald-300">
                            {camera.alert}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{camera.traffic}</span>
                          <span>{camera.temperature}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{camera.bitrate}</span>
                          <span>{camera.latency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {slide.placeholders.map((placeholderId) => (
                  <div
                    key={placeholderId}
                    className="flex-1 min-w-0 opacity-0 pointer-events-none"
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {totalSlides > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
            {cameraSlides.map((slide, idx) => (
              <span
                key={`${slide.id}-indicator`}
                className={`w-6 h-0.5 rounded-full ${
                  idx === currentSlide ? 'bg-[#4ade80]' : 'bg-slate-600'
                }`}
              ></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Right Top - Human Flow
const HumanFlowMonitor = () => {
  const todayTotal = humanTrafficTrend.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <div className="text-xs text-slate-400 mb-0.5">今日人流总数</div>
          <div className="text-2xl font-tech font-bold text-[#4ade80] leading-none">
            {todayTotal.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center text-[#4ade80] text-xs">
          <TrendingUp size={12} className="mr-1" />
          <span>+12.5%</span>
        </div>
      </div>
      <div className="flex-1 w-full bg-[#1c2622]/30 border border-[#4a5f54]/30 rounded overflow-hidden">
        <AreaTrendChart
          data={humanTrafficTrend}
          xKey="name"
          dataKey="count"
          color="#4ade80"
          name="人流"
        />
      </div>
    </div>
  );
};

// 4. Right Middle - Vehicle Flow
const VehicleFlowMonitor = () => {
  const todayTotal = trafficTrend.reduce((acc, curr) => acc + curr.total, 0);
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <div className="text-xs text-slate-400 mb-0.5">今日车流总数</div>
          <div className="text-2xl font-tech font-bold text-[#2dd4bf] leading-none">
            {todayTotal.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center text-[#2dd4bf] text-xs">
          <TrendingUp size={12} className="mr-1" />
          <span>+8.2%</span>
        </div>
      </div>
      <div className="flex-1 w-full bg-[#1c2622]/30 border border-[#4a5f54]/30 rounded overflow-hidden">
        <AreaTrendChart
          data={trafficTrend}
          xKey="name"
          dataKey="total"
          color="#2dd4bf"
          name="车流"
        />
      </div>
    </div>
  );
};

// 5. Right Bottom - Violation Analysis
const ViolationAnalysis = () => {
  // Calculate totals from trafficTrend
  const redLight = trafficTrend.reduce((acc, c) => acc + c.redLight, 0);
  const wrongWay = trafficTrend.reduce((acc, c) => acc + c.wrongWay, 0);
  const illegalPark = trafficTrend.reduce((acc, c) => acc + c.illegalPark, 0);

  const data = [
    { name: '红灯违法', value: redLight },
    { name: '违规停车', value: illegalPark },
    { name: '逆行监控', value: wrongWay },
    { name: '其他违规', value: 20 }, // Mock
  ];

  return (
    <div className="h-full flex items-center">
      <div className="flex-1 h-full relative">
        <SimplePieChart data={data} dataKey="value" nameKey="name" animate />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-[10px] text-slate-500">违规占比</div>
            <AlertTriangle size={16} className="text-amber-400 mx-auto mt-1" />
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="w-1/3 text-[10px] space-y-1 text-slate-400">
        {data.map((item) => (
          <div key={item.name} className="flex justify-between items-center">
            <div className="flex items-center">
              <span
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{
                  backgroundColor:
                    {
                      红灯违法: '#4ade80',
                      违规停车: '#2dd4bf',
                      逆行监控: '#fbbf24',
                      其他违规: '#f87171',
                    }[item.name] ?? '#4ade80',
                }}
              ></span>
              <span className="truncate">{item.name}</span>
            </div>
            <span className="font-mono text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Cockpit = () => {
  return (
    <div className="h-full p-3 gap-3 flex flex-col md:flex-row overflow-hidden">
      {/* Left Column: Stats & Trends (Existing) */}
      <div className="w-full md:w-1/4 flex flex-col gap-3 h-full">
        {/* Top Stats */}
        <div className="h-[20%] flex gap-2">
          <TechBorderContainer title="重点区域" className="flex-1">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-3xl font-bold font-tech text-[#4ade80]">
                {crowdAreas.length}
              </div>
              <div className="text-[10px] text-slate-400">区域总数</div>
            </div>
          </TechBorderContainer>
          <TechBorderContainer title="交通卡口" className="flex-1">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-3xl font-bold font-tech text-[#2dd4bf]">
                {checkpointData.length}
              </div>
              <div className="text-[10px] text-slate-400">卡口总数</div>
            </div>
          </TechBorderContainer>
        </div>

        <TechBorderContainer title="人群密度告警" height="h-[40%]">
          <div className="flex justify-between items-end mb-2">
            <div className="text-2xl font-bold font-tech text-amber-400">
              {crowdAlertTrend.reduce((a, b) => a + b.value, 0)}
            </div>
            <div className="text-[10px] text-slate-400">今日累计</div>
          </div>
          <div className="flex-1 w-full bg-[#1c2622]/30 border border-[#4a5f54]/30 rounded overflow-hidden">
            <AreaTrendChart
              data={crowdAlertTrend}
              xKey="name"
              dataKey="value"
              color="#fbbf24"
              name="密度告警"
            />
          </div>
        </TechBorderContainer>

        <TechBorderContainer title="禁入区域闯入告警" height="h-[40%]">
          <div className="flex justify-between items-end mb-2">
            <div className="text-2xl font-bold font-tech text-red-400">
              {intrusionByArea.reduce((a, b) => a + b.value, 0)}
            </div>
            <div className="text-[10px] text-slate-400">区域统计对比</div>
          </div>
          <div className="flex-1 w-full bg-[#1c2622]/30 border border-[#4a5f54]/30 rounded overflow-hidden">
            <SimpleRadialBarChart
              data={intrusionByArea}
              nameKey="name"
              dataKey="value"
            />
          </div>
        </TechBorderContainer>
      </div>

      {/* Center: Full Domain Map (Top) & Camera Preview (Bottom) */}
      <div className="flex-1 h-full flex flex-col gap-3">
        <TechBorderContainer
          title="全域态势感知"
          height="h-[65%]"
          className="w-full border-[#4ade80]/40"
        >
          <CentralMap />
        </TechBorderContainer>

        <TechBorderContainer title="摄像头实时预览" height="flex-1">
          <CameraCarousel />
        </TechBorderContainer>
      </div>

      {/* Right Column: Flow & Violation Analysis (New) */}
      <div className="w-full md:w-1/4 h-full flex flex-col gap-3">
        <TechBorderContainer title="今日人流量监测" height="h-[33%]">
          <HumanFlowMonitor />
        </TechBorderContainer>

        <TechBorderContainer title="今日车流量监测" height="h-[33%]">
          <VehicleFlowMonitor />
        </TechBorderContainer>

        <TechBorderContainer title="交通违规抓拍分析" height="h-[33%]">
          <ViolationAnalysis />
        </TechBorderContainer>
      </div>
    </div>
  );
};
