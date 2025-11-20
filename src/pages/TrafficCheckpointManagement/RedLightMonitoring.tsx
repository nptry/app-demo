import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Table } from 'antd';
import type { RedLightRecord } from '@/services/traffic';
import { getRedLightViolations } from '@/services/traffic';

const RedLightMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getRedLightViolations, {
    formatResult: (res: RedLightRecord[] | { data: RedLightRecord[] }) =>
      (res as { data?: RedLightRecord[] })?.data ?? (res as RedLightRecord[]),
  });

  const records = data ?? [];

  const columns: ColumnsType<RedLightRecord> = useMemo(
    () => [
      { title: '卡口', dataIndex: 'checkpointName', width: 200 },
      { title: '车道', dataIndex: 'lane', width: 180 },
      { title: '违章时间', dataIndex: 'violationTime', width: 200 },
      { title: '红灯亮起时间', dataIndex: 'lightOnTime', width: 200 },
      { title: '车牌号', dataIndex: 'plateNumber', width: 140, render: (value: string) => <strong>{value}</strong> },
      { title: '车辆类型', dataIndex: 'vehicleType', width: 140 },
      { title: '越线位置', dataIndex: 'position', width: 200 },
      { title: '违章速度 (km/h)', dataIndex: 'speed', width: 160 },
      {
        title: '告警状态',
        dataIndex: 'alarm',
        width: 200,
        render: (alarm: RedLightRecord['alarm']) => (
          <div>
            <Badge status={alarm.triggered ? 'error' : 'default'} text={alarm.status ?? '未触发'} />
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{alarm.receiver ?? '—'}</div>
          </div>
        ),
      },
      {
        title: '证据照片/视频',
        dataIndex: 'photos',
        width: 200,
        render: (_: string[], record) => (
          <div>
            <a style={{ marginRight: 8 }}>照片({record.photos.length})</a>
            <a>视频</a>
          </div>
        ),
      },
      { title: '识别设备', dataIndex: 'deviceId', width: 160 },
      { title: '识别准确率', dataIndex: 'accuracy', width: 160, render: (value: number) => `${(value * 100).toFixed(0)}%` },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '红灯违法监控' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<RedLightRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>
    </PageContainer>
  );
};

export default RedLightMonitoring;
