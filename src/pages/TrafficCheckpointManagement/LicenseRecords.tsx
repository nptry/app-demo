import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type { LicenseRecordItem, LicenseRecordResponse } from '@/services/traffic';
import { getLicenseRecords } from '@/services/traffic';

const LicenseRecords: React.FC = () => {
  const { data, loading } = useRequest(getLicenseRecords, {
    formatResult: (res: LicenseRecordResponse | { data: LicenseRecordResponse }) =>
      (res as { data?: LicenseRecordResponse })?.data ?? (res as LicenseRecordResponse),
  });

  const records = data?.records ?? [];
  const abnormalCount = records.filter((record) => record.abnormal).length;

  const columns: ColumnsType<LicenseRecordItem> = useMemo(
    () => [
      { title: '抓拍时间', dataIndex: 'captureTime', width: 180 },
      { title: '卡口', dataIndex: 'checkpointName', width: 200 },
      { title: '抓拍方向', dataIndex: 'lane', width: 180 },
      {
        title: '车牌号',
        dataIndex: 'plateNumber',
        width: 140,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '车辆特征',
        dataIndex: 'vehicleType',
        width: 200,
        render: (value: string, record) => `${value} / ${record.vehicleColor} / ${record.plateColor}`,
      },
      {
        title: '告警',
        dataIndex: 'abnormal',
        width: 140,
        render: (value: boolean, record) =>
          value ? <Tag color="orange">{record.reason ?? '异常'}</Tag> : <Tag color="green">正常</Tag>,
      },
      {
        title: '抓拍图片',
        dataIndex: 'photos',
        render: (value: string[]) => (value.length ? <a>查看({value.length})</a> : '—'),
      },
      { title: '识别准确率', dataIndex: 'accuracy', width: 140, render: (value: number) => `${(value * 100).toFixed(0)}%` },
      { title: '采集设备', dataIndex: 'deviceId', width: 160 },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '车牌识别与记录' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="记录条数" value={records.length} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="异常/黑名单" value={abnormalCount} suffix="条" />
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
          scroll={{ x: 1500 }}
        />
      </Card>
    </PageContainer>
  );
};

export default LicenseRecords;
