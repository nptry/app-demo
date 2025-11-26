import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { TrafficMonitoringRecord, TrafficMonitoringResponse } from '@/services/traffic';
import { getTrafficMonitoring } from '@/services/traffic';

const TrafficMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getTrafficMonitoring, {
    formatResult: (res: TrafficMonitoringResponse | { data: TrafficMonitoringResponse }) =>
      (res as { data?: TrafficMonitoringResponse })?.data ?? (res as TrafficMonitoringResponse),
  });

  const records = data?.records ?? [];
  const congestionCount = records.filter((record) => record.congestion).length;

  const columns: ColumnsType<TrafficMonitoringRecord> = useMemo(
    () => [
      { title: '卡口', dataIndex: 'checkpointName', width: 220 },
      { title: '车道', dataIndex: 'lane', width: 180 },
      { title: '统计时段', dataIndex: 'period', width: 200 },
      { title: '时间范围', dataIndex: 'range', width: 220 },
      { title: '总车流量', dataIndex: 'totalVehicles', width: 140 },
      { title: '拥堵阈值', dataIndex: 'threshold', width: 140 },
      {
        title: '是否拥堵',
        dataIndex: 'congestion',
        width: 140,
        render: (value: boolean) => <Tag color={value ? 'orange' : 'green'}>{value ? '拥堵' : '正常'}</Tag>,
      },
      { title: '拥堵持续', dataIndex: 'duration', width: 160, render: (value: string | undefined) => value ?? '—' },
      { title: '处理建议', dataIndex: 'suggestion', width: 240, render: (value: string | undefined) => value ?? '—' },
      { title: '采集设备', dataIndex: 'deviceId', width: 180 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '车流监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="统计记录" value={records.length} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="拥堵事件" value={congestionCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card title="车流统计" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<TrafficMonitoringRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>
    </PageContainer>
  );
};

export default TrafficMonitoring;
