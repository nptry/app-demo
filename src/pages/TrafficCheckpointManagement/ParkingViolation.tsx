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
      { title: '违停区域', dataIndex: 'area', width: 220 },
      { title: '禁停规定', dataIndex: 'rule', width: 200 },
      { title: '开始时间', dataIndex: 'startTime', width: 180 },
      { title: '持续时长', dataIndex: 'duration', width: 140 },
      { title: '判定阈值 (秒)', dataIndex: 'threshold', width: 140 },
      { title: '车牌', dataIndex: 'plateNumber', width: 140, render: (value: string) => <strong>{value}</strong> },
      { title: '车辆类型', dataIndex: 'vehicleType', width: 140 },
      {
        title: '特殊车辆',
        dataIndex: 'specialVehicle',
        width: 140,
        render: (value: boolean, record) =>
          value ? <Tag color="blue">{record.specialReason ?? '特殊车辆'}</Tag> : <Tag>否</Tag>,
      },
      {
        title: '告警状态',
        dataIndex: 'alarmStatus',
        width: 200,
        render: (value: string) => <Tag color={value.includes('已处理') ? 'green' : 'orange'}>{value}</Tag>,
      },
      { title: '处置备注', dataIndex: 'remark', width: 220 },
      { title: '证据', dataIndex: 'photos', width: 200, render: (value: string[]) => (value.length ? <a>照片({value.length})/视频</a> : '—') },
      { title: '采集设备', dataIndex: 'deviceId', width: 160 },
      { title: '识别准确率', dataIndex: 'accuracy', width: 140, render: (value: number) => `${(value * 100).toFixed(0)}%` },
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
