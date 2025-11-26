import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { FlowRecord, KeyAreaFlowResponse } from '@/services/keyArea';
import { getKeyAreaFlow } from '@/services/keyArea';

const PedestrianFlow: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaFlow, {
    formatResult: (res: KeyAreaFlowResponse | { data: KeyAreaFlowResponse }) =>
      (res as { data?: KeyAreaFlowResponse })?.data ?? (res as KeyAreaFlowResponse),
  });

  const metrics = data?.metrics ?? {
    totalFlows: 0,
    abnormalEvents: 0,
    lastSync: '--',
  };
  const records = data?.records ?? [];

  const columns: ColumnsType<FlowRecord> = useMemo(
    () => [
      { title: '场所', dataIndex: 'siteName', width: 200 },
      { title: '监测区域编号', dataIndex: 'zoneCode', width: 180 },
      { title: '统计时间', dataIndex: 'time', width: 180 },
      { title: '监测方向', dataIndex: 'direction', width: 140 },
      {
        title: '单向流量',
        dataIndex: 'forwardFlow',
        width: 160,
        render: (value: number, record) =>
          record.direction === '双向' ? `${value} / ${record.reverseFlow ?? 0}` : `${value}`,
      },
      { title: '总流量', dataIndex: 'totalFlow', width: 140 },
      { title: '异常阈值', dataIndex: 'threshold', width: 140 },
      {
        title: '是否异常',
        dataIndex: 'abnormal',
        width: 120,
        render: (value: boolean) => <Tag color={value ? 'orange' : 'green'}>{value ? '异常' : '正常'}</Tag>,
      },
      { title: '异常持续', dataIndex: 'duration', width: 140, render: (value: string | undefined) => value ?? '—' },
      { title: '建议措施', dataIndex: 'suggestion', width: 220, render: (value: string | undefined) => value ?? '—' },
      { title: '采集设备', dataIndex: 'deviceId', width: 160 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '行人流量监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="统计周期流量" value={metrics.totalFlows} suffix="人次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="异常事件" value={metrics.abnormalEvents} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="最后同步" value={metrics.lastSync} />
          </Card>
        </Col>
      </Row>

      <Card title="流量记录" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<FlowRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default PedestrianFlow;
