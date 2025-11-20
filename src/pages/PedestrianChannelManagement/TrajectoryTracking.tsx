import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Table } from 'antd';
import type { TrajectoryRecord, TrajectoryResponse } from '@/services/pedestrian';
import { getChannelTrajectories } from '@/services/pedestrian';

const TrajectoryTracking: React.FC = () => {
  const { data, loading } = useRequest(getChannelTrajectories, {
    formatResult: (res: TrajectoryResponse | { data: TrajectoryResponse }) =>
      (res as { data?: TrajectoryResponse })?.data ?? (res as TrajectoryResponse),
  });

  const trajectories = data?.trajectories ?? [];

  const columns: ColumnsType<TrajectoryRecord> = useMemo(
    () => [
      { title: '重点人员', dataIndex: 'personName', width: 200 },
      { title: '查询时间范围', dataIndex: 'range', width: 220 },
      { title: '轨迹持续', dataIndex: 'duration', width: 140 },
      { title: '轨迹距离 (km)', dataIndex: 'distanceKm', width: 160 },
      { title: '高频区域', dataIndex: 'hotspots', width: 240, render: (value: string[]) => value.join(' / ') },
      { title: '操作人', dataIndex: 'operator', width: 160 },
      { title: '查询时间', dataIndex: 'queryTime', width: 200 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '轨迹跟踪' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<TrajectoryRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={trajectories}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ fontSize: 12 }}>
                {record.points.map((point) => (
                  <div key={`${record.id}-${point.time}`}>
                    {point.time} · {point.channelName} · 设备：{point.deviceId}
                  </div>
                ))}
              </div>
            ),
          }}
          pagination={{ pageSize: 5, showSizeChanger: false }}
        />
      </Card>
    </PageContainer>
  );
};

export default TrajectoryTracking;
