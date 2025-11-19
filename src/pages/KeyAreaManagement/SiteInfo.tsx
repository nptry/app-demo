import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type { KeyAreaMeasure, KeyAreaSiteItem, KeyAreaSiteResponse } from '@/services/keyArea';
import { getKeyAreaSites } from '@/services/keyArea';

const statusColor: Record<KeyAreaSiteItem['status'], 'success' | 'warning' | 'error'> = {
  正常: 'success',
  关注: 'warning',
  管控: 'error',
};

const riskColor: Record<KeyAreaSiteItem['riskLevel'], string> = {
  低: 'default',
  中: 'orange',
  高: 'red',
};

const SiteInfo: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaSites, {
    formatResult: (res: KeyAreaSiteResponse | { data: KeyAreaSiteResponse }) =>
      (res as { data?: KeyAreaSiteResponse })?.data ?? (res as KeyAreaSiteResponse),
  });

  const summary = data?.summary ?? {
    totalSites: 0,
    coverageSqKm: 0,
    avgDailyVisitors: 0,
    alerts24h: 0,
  };

  const sites = data?.sites ?? [];
  const measures = data?.measures ?? [];

  const columns: ColumnsType<KeyAreaSiteItem> = useMemo(
    () => [
      {
        title: '重点场所',
        dataIndex: 'name',
        width: 200,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.address}</div>
          </div>
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 120,
        render: (value: KeyAreaSiteItem['type']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '所属区域',
        dataIndex: 'district',
        width: 160,
      },
      {
        title: '面积',
        dataIndex: 'areaSize',
        width: 120,
      },
      {
        title: '负责人',
        dataIndex: 'manager',
        width: 140,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.contact}</div>
          </div>
        ),
      },
      {
        title: '运行状态',
        dataIndex: 'status',
        width: 120,
        render: (value: KeyAreaSiteItem['status']) => (
          <Badge status={statusColor[value]} text={value} />
        ),
      },
      {
        title: '风险等级',
        dataIndex: 'riskLevel',
        width: 120,
        render: (value: KeyAreaSiteItem['riskLevel']) => <Tag color={riskColor[value]}>{value}</Tag>,
      },
      {
        title: '描述',
        dataIndex: 'description',
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '场所基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="纳管场所" value={summary.totalSites} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="覆盖面积" value={summary.coverageSqKm} precision={1} suffix="km²" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="日均客流" value={summary.avgDailyVisitors} suffix="人次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="24h 告警" value={summary.alerts24h} suffix="条" />
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
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card title="在施管控措施" style={{ marginTop: 24 }}>
        <List
          dataSource={measures}
          renderItem={(item: KeyAreaMeasure) => (
            <List.Item key={item.id}>
              <List.Item.Meta
                title={item.title}
                description={
                  <div>
                    <div>{item.detail}</div>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                      负责人：{item.owner} · 更新时间：{item.lastUpdate}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {!measures.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无管控措施</div>}
      </Card>
    </PageContainer>
  );
};

export default SiteInfo;
