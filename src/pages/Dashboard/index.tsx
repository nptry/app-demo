import { Helmet } from '@umijs/max';
import React from 'react';
import SentinelApp from './sentinel/App';
import './sentinel/styles.less';

const DashboardPage: React.FC = () => {
  return (
    <div className="sentinel-root">
      <Helmet>
        <title>智慧城市哨兵管理平台</title>
        <script key="sentinel-tailwind" src="https://cdn.tailwindcss.com" />
        <link
          key="sentinel-fonts"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;700&display=swap"
        />
      </Helmet>
      <SentinelApp />
    </div>
  );
};

export default DashboardPage;
