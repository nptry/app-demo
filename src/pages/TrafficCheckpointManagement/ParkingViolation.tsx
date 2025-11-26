import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Table, Tag } from 'antd';
import type { ParkingViolationRecord } from '@/services/traffic';
import { getParkingViolations } from '@/services/traffic';

const ParkingViolation: React.FC = () => {
  const { data, loading } = useRequest(getParkingViolations, {
    formatResult: (res: ParkingViolationRecord[] | { data: ParkingViolationRecord[] }) =>
      (res as { data?: ParkingViolationRecord[] })?.data ?? (res as ParkingViolationRecord[]),
  });

  const records = data ?? [];

  const columns: ColumnsType<ParkingViolationRecord> = useMemo(
    () => [
      { title: '卡口', dataIndex: 'checkpointName', width: 220 },
      {
        title: '告警状态',
        dataIndex: 'alarmStatus',
        width: 200,
        render: (value: string) => <Tag color={value.includes('已处理') ? 'green' : 'orange'}>{value}</Tag>,
      },
      { title: '处置备注', dataIndex: 'remark', width: 220 },
      { title: '证据', dataIndex: 'photos', width: 200, render: (value: string[]) => (value.length ? <a>照片({value.length})/视频</a> : '—') },
      { title: '采集设备', dataIndex: 'deviceId', width: 160 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '违规停车' }}>
      <Card bodyStyle={{ paddingTop: 8 }}>
        <Table<ParkingViolationRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1800 }}
        />
      </Card>
    </PageContainer>
  );
};

export default ParkingViolation;
