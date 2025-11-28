import React, { useState } from 'react';
import { Cockpit } from './components/Cockpit';
import { Layout } from './components/Layout';
import {
  CrowdAreaView,
  DeviceFacilityView,
  KeyPersonnelView,
  TrafficMountView,
} from './components/ModuleViews';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cockpit');

  const renderContent = () => {
    switch (activeTab) {
      case 'cockpit':
        return <Cockpit />;
      case 'device':
        return <DeviceFacilityView />;
      case 'crowd':
        return <CrowdAreaView />; // "重点区域"
      case 'traffic':
        return <TrafficMountView />;
      case 'personnel':
        return <KeyPersonnelView />;
      default:
        return <Cockpit />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
