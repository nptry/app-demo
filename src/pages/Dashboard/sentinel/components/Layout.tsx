import {
  Activity,
  Car,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Server,
  UserCog,
  Users,
  UserX,
} from 'lucide-react';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavButton = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    type="button"
    onClick={() => onClick(id)}
    className={`relative flex items-center px-6 py-3 transition-all duration-300 group overflow-hidden ${
      active ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
    }`}
  >
    {/* Active Background Effect */}
    {active && (
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 to-transparent border-b-2 border-cyan-400"></div>
    )}
    <div
      className={`absolute bottom-0 left-0 w-full h-[1px] bg-cyan-500/0 group-hover:bg-cyan-500/50 transition-colors ${active ? 'opacity-0' : ''}`}
    ></div>

    <Icon
      size={16}
      className={`mr-2 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'group-hover:scale-110'}`}
    />
    <span className="text-sm font-medium tracking-wide font-tech uppercase">
      {label}
    </span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const menuItems = [
    { id: 'cockpit', label: '驾驶舱', icon: LayoutDashboard },
    { id: 'device', label: '设备监测', icon: Server },
    { id: 'facility', label: '设施管理', icon: MapPin },
    { id: 'faults', label: '故障工单', icon: ClipboardList },
    { id: 'traffic', label: '交通卡口', icon: Car },
    { id: 'crowd', label: '区域人群', icon: Users },
    { id: 'personnel', label: '重点人员', icon: UserX },
    { id: 'user', label: '平台用户', icon: UserCog },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#020617] overflow-hidden text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Global Header */}
      <header className="relative z-50 flex flex-col items-center bg-[#020617] border-b border-slate-800/50 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

        {/* Main Title Area */}
        <div className="w-full relative pt-4 pb-2">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>

          <div className="flex justify-between items-center px-8">
            <div className="flex items-center space-x-2 w-1/3">
              <div className="text-xs text-slate-500 font-mono">
                {new Date().toISOString().split('T')[0]}
              </div>
              <div className="px-2 py-0.5 bg-green-900/30 border border-green-500/30 text-green-400 text-[10px] rounded">
                SYSTEM ONLINE
              </div>
            </div>

            <div className="text-center w-1/3 relative group cursor-default">
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-300 font-tech tracking-[0.2em] drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                智慧城市哨兵管理平台
              </h1>
              <div className="text-[10px] text-cyan-600 tracking-[0.5em] uppercase mt-1 opacity-70">
                Smart City Sentinel Platform
              </div>
              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-12 bg-cyan-400/5 blur-2xl rounded-full pointer-events-none"></div>
            </div>

            <div className="flex justify-end items-center w-1/3 space-x-4">
              <div className="flex items-center space-x-1 text-slate-400 text-xs hover:text-cyan-400 transition-colors cursor-pointer">
                <Activity size={14} />
                <span>Server Status: Good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="w-full flex justify-center space-x-1 bg-[#0f172a]/50 backdrop-blur-sm border-t border-slate-800/50">
          {menuItems.map((item) => (
            <NavButton
              key={item.id}
              {...item}
              active={activeTab === item.id}
              onClick={setActiveTab}
            />
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#020617_100%) pointer-events-none" />

        <div className="relative z-10 h-full w-full">{children}</div>
      </main>
    </div>
  );
};
