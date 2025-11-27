import React, { useState } from 'react';
import { Cockpit } from './components/Cockpit';
import { Layout } from './components/Layout';
import {
  CrowdAreaView,
  DeviceFacilityView,
  FacilityPage,
  FaultManagementView,
  KeyPersonnelView,
  TrafficMountView,
  UserManagementView,
} from './components/ModuleViews';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cockpit');

  const renderContent = () => {
    switch (activeTab) {
      case 'cockpit':
        return <Cockpit />;
      case 'device':
        return <DeviceFacilityView />;
      case 'facility':
        return <FacilityPage />;
      case 'faults':
        return <FaultManagementView />;
      case 'traffic':
        return <TrafficMountView />;
      case 'crowd':
        return <CrowdAreaView />;
      case 'personnel':
        return <KeyPersonnelView />;
      case 'user':
        return <UserManagementView />;
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
