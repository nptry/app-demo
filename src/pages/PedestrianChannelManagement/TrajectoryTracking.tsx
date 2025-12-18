import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import { Card, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo } from 'react';
import type {
  TrajectoryRecord,
  TrajectoryResponse,
} from '@/services/pedestrian';
import { getChannelTrajectories } from '@/services/pedestrian';

const TrajectoryTracking: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getChannelTrajectories, {
    formatResult: (res: TrajectoryResponse | { data: TrajectoryResponse }) =>
      (res as { data?: TrajectoryResponse })?.data ??
      (res as TrajectoryResponse),
  });

  const trajectories = data?.trajectories ?? [];

  const columns: ColumnsType<TrajectoryRecord> = useMemo(
    () => [
      {
        title: t('pages.pedestrian.trajectory.columns.person'),
        dataIndex: 'personName',
        width: 200,
      },
      {
        title: t('pages.pedestrian.trajectory.columns.range'),
        dataIndex: 'range',
        width: 220,
      },
      {
        title: t('pages.pedestrian.trajectory.columns.duration'),
        dataIndex: 'duration',
        width: 140,
      },
      {
        title: t('pages.pedestrian.trajectory.columns.distance'),
        dataIndex: 'distanceKm',
        width: 160,
      },
      {
        title: t('pages.pedestrian.trajectory.columns.hotspots'),
        dataIndex: 'hotspots',
        width: 240,
        render: (value: string[]) => value.join(' / '),
      },
      {
        title: t('pages.pedestrian.trajectory.columns.operator'),
        dataIndex: 'operator',
        width: 160,
      },
      {
        title: t('pages.pedestrian.trajectory.columns.queryTime'),
        dataIndex: 'queryTime',
        width: 200,
      },
    ],
    [t],
  );

  return (
    <PageContainer
      header={{ title: t('pages.pedestrian.trajectory.pageTitle') }}
    >
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
                    {t('pages.pedestrian.trajectory.points.line', {
                      time: point.time,
                      channel: point.channelName,
                      device: point.deviceId,
                    })}
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
