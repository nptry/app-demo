import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Empty, Row, Statistic, Table, Tag } from 'antd';
import type { DeviceApplicationItem, DeviceConfigResponse } from '@/services/device';
import { getDeviceConfigInfo } from '@/services/device';

const ConfigInfo: React.FC = () => {
  const { data, loading } = useRequest(getDeviceConfigInfo, {
    formatResult: (res: DeviceConfigResponse | { data: DeviceConfigResponse }) =>
      (res as { data?: DeviceConfigResponse })?.data ?? (res as DeviceConfigResponse),
  });

  const summary = data?.summary ?? [];
  const applications = data?.applications ?? [];

  const columns: ColumnsType<DeviceApplicationItem> = useMemo(
    () => [
      { title: '设备 ID', dataIndex: 'deviceId', width: 160 },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '应用类型',
        dataIndex: 'applicationType',
        width: 180,
        render: (value: DeviceApplicationItem['applicationType']) => <Tag color="blue">{value}</Tag>,
      },
      { title: '安装区域', dataIndex: 'region', width: 200 },
      { title: '详细地址', dataIndex: 'address', width: 240 },
      { title: '经纬度', dataIndex: 'coordinates', width: 180 },
      { title: '智慧灯杆 ID', dataIndex: 'lampId', width: 160 },
      { title: '部署时间', dataIndex: 'deployDate', width: 140 },
      { title: '部署场景描述', dataIndex: 'description' },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '设备应用信息' }}>
      <Row gutter={[16, 16]}>
        {summary.length ? (
          summary.map((item) => (
            <Col xs={24} sm={12} md={8} key={item.type}>
              <Card bordered={false}>
                <Statistic title={item.type} value={item.count} suffix="台" />
                <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.65)' }}>覆盖：{item.coverage}</div>
                <div style={{ marginTop: 12 }}>
                  {item.aiModels.map((model) => (
                    <Tag color="geekblue" key={model}>
                      {model}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <Empty description="暂无应用配置数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        )}
      </Row>

      <Card title="部署明细" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<DeviceApplicationItem>
          rowKey={(record) => `${record.deviceId}-${record.applicationType}`}
          columns={columns}
          dataSource={applications}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </PageContainer>
  );
};

export default ConfigInfo;
