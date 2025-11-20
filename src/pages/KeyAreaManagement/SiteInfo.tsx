import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { KeyAreaSiteItem, KeyAreaSiteResponse } from '@/services/keyArea';
import { getKeyAreaSites } from '@/services/keyArea';

const statusColor: Record<KeyAreaSiteItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

const SiteInfo: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaSites, {
    formatResult: (res: KeyAreaSiteResponse | { data: KeyAreaSiteResponse }) =>
      (res as { data?: KeyAreaSiteResponse })?.data ?? (res as KeyAreaSiteResponse),
  });

  const summary = data?.summary ?? {
    totalSites: 0,
    enabledSites: 0,
    totalAreaSqm: 0,
  };
  const sites = data?.sites ?? [];

  const columns: ColumnsType<KeyAreaSiteItem> = useMemo(
    () => [
      { title: '场所 ID', dataIndex: 'id', width: 140 },
      {
        title: '场所名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.address}</div>
          </div>
        ),
      },
      {
        title: '场所类型',
        dataIndex: 'siteType',
        width: 160,
        render: (value: KeyAreaSiteItem['siteType']) => <Tag color="blue">{value}</Tag>,
      },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      { title: '面积（㎡）', dataIndex: 'areaSize', width: 140, render: (value: number) => value.toLocaleString() },
      {
        title: '负责人 / 联系方式',
        dataIndex: 'manager',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '场所状态', dataIndex: 'status', width: 140, render: (value: KeyAreaSiteItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '场所描述', dataIndex: 'description', width: 260 },
      { title: '现场平面图', dataIndex: 'plan', width: 200 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '场所基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="纳管场所" value={summary.totalSites} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="启用监测" value={summary.enabledSites} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="覆盖面积" value={(summary.totalAreaSqm / 1000).toFixed(1)} suffix="千㎡" />
            <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)' }}>折算约 {summary.totalAreaSqm.toLocaleString()} ㎡</div>
          </Card>
        </Col>
      </Row>

      <Card title="重点场所清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<KeyAreaSiteItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={sites}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default SiteInfo;
