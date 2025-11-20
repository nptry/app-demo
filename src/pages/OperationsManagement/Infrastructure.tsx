import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Badge, Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { FacilityItem, InfrastructureResponse } from '@/services/operations';
import { getInfrastructureOverview } from '@/services/operations';

const statusColor: Record<FacilityItem['status'], 'success' | 'warning' | 'error'> = {
  正常运行: 'success',
  待维护: 'warning',
  停用: 'error',
};

const Infrastructure: React.FC = () => {
  const { data, loading } = useRequest(getInfrastructureOverview, {
    formatResult: (res: InfrastructureResponse | { data: InfrastructureResponse }) =>
      (res as { data?: InfrastructureResponse })?.data ?? (res as InfrastructureResponse),
  });

  const summary = data?.summary ?? {
    regions: 0,
    checkpoints: 0,
    pedestrianPoints: 0,
    lampPoles: 0,
  };
  const facilities = data?.facilities ?? [];

  const columns: ColumnsType<FacilityItem> = useMemo(
    () => [
      { title: '设施 ID', dataIndex: 'id', width: 140 },
      {
        title: '设施名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '设施类型',
        dataIndex: 'type',
        width: 160,
        render: (value: FacilityItem['type']) => <Tag color="blue">{value}</Tag>,
      },
      { title: '所属区域', dataIndex: 'region', width: 220 },
      { title: '详细地址', dataIndex: 'address', width: 240 },
      { title: '经纬度', dataIndex: 'coordinates', width: 180 },
      {
        title: '负责人 / 联系电话',
        dataIndex: 'owner',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      {
        title: '设施状态',
        dataIndex: 'status',
        width: 140,
        render: (value: FacilityItem['status']) => <Badge status={statusColor[value]} text={value} />,
      },
      { title: '建成时间', dataIndex: 'buildDate', width: 140 },
      { title: '备注', dataIndex: 'remark' },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '基础设施管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点区域" value={summary.regions} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="交通卡口" value={summary.checkpoints} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="行人通道点位" value={summary.pedestrianPoints} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="智慧灯杆" value={summary.lampPoles} suffix="根" />
          </Card>
        </Col>
      </Row>

      <Card title="设施清单" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<FacilityItem>
          rowKey="id"
          columns={columns}
          dataSource={facilities}
          loading={loading}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Infrastructure;
