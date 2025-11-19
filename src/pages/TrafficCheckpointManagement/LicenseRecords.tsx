import React from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table } from 'antd';
import type { LicenseRecordItem, LicenseRecordResponse } from '@/services/traffic';
import { getLicenseRecords } from '@/services/traffic';

const statusColor: Record<LicenseRecordItem['status'], 'success' | 'warning' | 'error'> = {
  正常: 'success',
  异常: 'warning',
  黑名单: 'error',
};

const LicenseRecords: React.FC = () => {
  const { data, loading } = useRequest(getLicenseRecords, {
    formatResult: (res: LicenseRecordResponse | { data: LicenseRecordResponse }) =>
      (res as { data?: LicenseRecordResponse })?.data ?? (res as LicenseRecordResponse),
  });

  const metrics = data?.metrics ?? {
    totalToday: 0,
    validPlates: 0,
    blacklistHits: 0,
    lastSync: '--',
  };

  const records = data?.records ?? [];

  const columns: ColumnsType<LicenseRecordItem> = [
    {
      title: '抓拍时间',
      dataIndex: 'captureTime',
      width: 180,
    },
    {
      title: '卡口',
      dataIndex: 'checkpoint',
      width: 200,
    },
    {
      title: '车牌号',
      dataIndex: 'plate',
      width: 140,
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      title: '类型/颜色',
      dataIndex: 'vehicleType',
      width: 180,
      render: (value: string, record) => `${value} / ${record.color}`,
    },
    {
      title: '方向',
      dataIndex: 'direction',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 140,
      render: (value: LicenseRecordItem['status']) => (
        <Badge status={statusColor[value]} text={value} />
      ),
    },
    {
      title: '抓拍图',
      dataIndex: 'snapshot',
      render: (value: string) => <a>{value ? '查看' : '无'}</a>,
    },
  ];

  return (
    <PageContainer header={{ title: '车牌识别与记录' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日抓拍" value={metrics.totalToday} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="有效车牌" value={metrics.validPlates} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="黑名单命中" value={metrics.blacklistHits} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="同步时间" value={metrics.lastSync} />
          </Card>
        </Col>
      </Row>

      <Card title="抓拍记录" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<LicenseRecordItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </PageContainer>
  );
};

export default LicenseRecords;
