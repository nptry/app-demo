import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { KeyAreaTargetResponse, TargetRecord } from '@/services/keyArea';
import { getKeyAreaTargets } from '@/services/keyArea';

const TargetMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaTargets, {
    formatResult: (res: KeyAreaTargetResponse | { data: KeyAreaTargetResponse }) =>
      (res as { data?: KeyAreaTargetResponse })?.data ?? (res as KeyAreaTargetResponse),
  });

  const metrics = data?.metrics ?? {
    watchlistCount: 0,
    hitsToday: 0,
    activeAlarms: 0,
    lastPush: '--',
  };
  const records = data?.records ?? [];

  const columns: ColumnsType<TargetRecord> = useMemo(
    () => [
      { title: '场所', dataIndex: 'siteName', width: 200 },
      { title: '监测区域编号', dataIndex: 'zoneCode', width: 180 },
      {
        title: '目标人员',
        dataIndex: 'personName',
        width: 180,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.personType}</div>
          </div>
        ),
      },
      { title: '匹配时间', dataIndex: 'time', width: 180 },
      { title: '行为描述', dataIndex: 'behavior', width: 220 },
      {
        title: '告警状态',
        dataIndex: 'alarm',
        width: 180,
        render: (alarm: TargetRecord['alarm']) => (
          <div>
            <Badge status={alarm.triggered ? 'error' : 'default'} text={alarm.triggered ? alarm.status ?? '已触发' : '未触发'} />
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{alarm.receiver ?? '—'}</div>
          </div>
        ),
      },
      {
        title: '推送渠道',
        dataIndex: ['alarm', 'channels'],
        width: 200,
        render: (value: string[] | undefined) =>
          value ? value.map((channel) => <Tag key={channel}>{channel}</Tag>) : '—',
      },
      { title: '识别设备', dataIndex: 'deviceId', width: 160 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '目标人群监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点人员库" value={metrics.watchlistCount} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日命中" value={metrics.hitsToday} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="告警处理中" value={metrics.activeAlarms} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="最后推送时间" value={metrics.lastPush} />
          </Card>
        </Col>
      </Row>

      <Card title="目标人群记录" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<TargetRecord>
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

export default TargetMonitoring;
