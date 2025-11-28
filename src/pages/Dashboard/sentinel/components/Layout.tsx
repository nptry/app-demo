import { Car, LayoutDashboard, MapPin, Server, UserX } from 'lucide-react';
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
    className={`relative flex items-center px-8 py-4 transition-all duration-300 group overflow-hidden skew-x-[-10deg] mx-1 ${
      active
        ? 'text-[#4ade80] bg-[#323e37]'
        : 'text-slate-400 hover:text-slate-200 hover:bg-[#323e37]/50'
    }`}
  >
    {/* Active Indicators */}
    {active && (
      <div className="absolute top-0 left-0 w-1 h-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]"></div>
    )}
    <div className="skew-x-[10deg] flex items-center">
      <Icon
        size={18}
        className={`mr-2 transition-transform duration-500 ${active ? 'scale-110 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]' : 'group-hover:scale-110'}`}
      />
      <span className="text-sm font-bold tracking-widest font-tech uppercase">
        {label}
      </span>
    </div>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  // Menu items based on "Hypervise" version requirements
  const menuItems = [
    { id: 'cockpit', label: '驾驶舱', icon: LayoutDashboard },
    { id: 'device', label: '设备监测', icon: Server },
    { id: 'crowd', label: '重点区域', icon: MapPin },
    { id: 'traffic', label: '交通卡口', icon: Car },
    { id: 'personnel', label: '重点人员', icon: UserX },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0b1210] overflow-hidden text-slate-200 font-sans selection:bg-[#4ade80]/30">
      <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
        `}</style>

      {/* Global Header */}
      <header className="relative z-50 flex flex-col items-center bg-[#141b18] border-b border-[#323e37] shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

        {/* Main Title Area */}
        <div className="w-full relative pt-5 pb-3 bg-gradient-to-r from-[#0b1210] via-[#1c2622] to-[#0b1210]">
          <div className="flex justify-between items-center px-8">
            <div className="flex items-center space-x-2 w-1/3">
              <div className="flex flex-col">
                <div className="text-xs text-[#4ade80] font-mono tracking-widest">
                  SYSTEM STATUS
                </div>
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    OPERATIONAL
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center w-1/3 relative group cursor-default">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-emerald-100 to-[#4ade80] font-tech tracking-[0.1em] drop-shadow-[0_0_10px_rgba(74,222,128,0.3)] italic">
                HYPERVISE AIOT
              </h1>
              <div className="text-[10px] text-[#4ade80] tracking-[0.6em] uppercase mt-1 opacity-80 font-bold">
                Management Platform
              </div>
            </div>

            <div className="flex justify-end items-center w-1/3 space-x-4">
              <div className="text-right">
                <div className="text-xs text-slate-500 font-mono">
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-[#323e37] bg-[#4ade80] px-1 font-bold rounded-sm">
                  SECURE CONN
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="w-full flex justify-center bg-[#1c2622] border-t border-[#323e37] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
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
      <main className="flex-1 overflow-hidden relative bg-[#0f1614]">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(50,62,55,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(50,62,55,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,#0b1210_120%) pointer-events-none" />

        <div className="relative z-10 h-full w-full">{children}</div>
      </main>
    </div>
  );
};
