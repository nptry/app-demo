import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Progress, Row, Statistic, Table } from 'antd';
import type { DensityRecord, KeyAreaDensityResponse } from '@/services/keyArea';
import { getKeyAreaDensity } from '@/services/keyArea';

const DensityMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaDensity, {
    formatResult: (res: KeyAreaDensityResponse | { data: KeyAreaDensityResponse }) =>
      (res as { data?: KeyAreaDensityResponse })?.data ?? (res as KeyAreaDensityResponse),
  });

  const metrics = data?.metrics ?? {
    alertCount: 0,
    highDensityZones: 0,
    lastSync: '--',
  };
  const records = data?.records ?? [];

  const columns: ColumnsType<DensityRecord> = useMemo(
    () => [
      { title: '场所', dataIndex: 'siteName', width: 200 },
      { title: '监测区域编号', dataIndex: 'zoneCode', width: 180 },
      {
        title: '实时密度（人/㎡）',
        dataIndex: 'density',
        width: 180,
        render: (value: number, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value.toFixed(2)}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              阈值 {record.threshold.toFixed(2)}
            </div>
          </div>
        ),
      },
      { title: '区域面积（㎡）', dataIndex: 'zoneArea', width: 150 },
      { title: '区域内人数', dataIndex: 'totalPeople', width: 140 },
      { title: '采集时间', dataIndex: 'time', width: 180 },
      {
        title: '告警状态',
        dataIndex: 'alarm',
        width: 140,
        render: (alarm: DensityRecord['alarm']) => (
          <Badge status={alarm.triggered ? 'error' : 'success'} text={alarm.triggered ? alarm.status ?? '已触发' : '未触发'} />
        ),
      },
      {
        title: '告警接收人',
        dataIndex: ['alarm', 'receiver'],
        width: 160,
        render: (value: string | undefined) => value ?? '—',
      },
      { title: '数据来源设备', dataIndex: 'sourceDeviceId', width: 160 },
      {
        title: '数据可信度',
        dataIndex: 'confidence',
        width: 160,
        render: (value: number) => <Progress percent={value * 100} size="small" />,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '人群密度监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="触发告警" value={metrics.alertCount} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="高密度区域" value={metrics.highDensityZones} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="最近同步" value={metrics.lastSync} />
          </Card>
        </Col>
      </Row>

      <Card title="实时密度记录" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DensityRecord>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ fontSize: 12 }}>
                <div style={{ marginBottom: 4 }}>
                  历史趋势：
                  {record.trend.map((point) => `${point.time}=${point.density.toFixed(2)}`).join('，')}
                </div>
                {record.alarm.remark && <div>处置备注：{record.alarm.remark}</div>}
              </div>
            ),
          }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default DensityMonitoring;
