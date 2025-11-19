import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Empty, Row, Statistic, Table, Tag } from 'antd';
import type { DeviceConfigResponse, DeviceDeploymentItem } from '@/services/device';
import { getDeviceConfigInfo } from '@/services/device';

const ConfigInfo: React.FC = () => {
  const { data, loading } = useRequest(getDeviceConfigInfo, {
    formatResult: (res: DeviceConfigResponse | { data: DeviceConfigResponse }) =>
      (res as { data?: DeviceConfigResponse })?.data ?? (res as DeviceConfigResponse),
  });

  const applicationSummary = data?.applicationSummary ?? [];
  const deployments = data?.deployments ?? [];

  const columns: ColumnsType<DeviceDeploymentItem> = useMemo(
    () => [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 200,
        render: (value) => <strong>{value}</strong>,
      },
      {
        title: '应用场景',
        dataIndex: 'applicationType',
        width: 160,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '覆盖区域/通道',
        dataIndex: 'deploymentArea',
        width: 220,
      },
      {
        title: '灯杆/卡口编号',
        dataIndex: 'poleCode',
        width: 160,
      },
      {
        title: '安装位置',
        dataIndex: 'location',
        width: 240,
      },
      {
        title: '坐标',
        dataIndex: 'coordinates',
        width: 160,
      },
      {
        title: '网络/供电',
        dataIndex: 'network',
        width: 160,
      },
      {
        title: '部署算法/服务',
        dataIndex: 'edgeApps',
        render: (apps: string[]) => (
          <span>
            {apps.map((app) => (
              <Tag color="purple" key={app}>
                {app}
              </Tag>
            ))}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '设备配置信息' }}>
      <Row gutter={[16, 16]}>
        {applicationSummary.length ? (
          applicationSummary.map((app) => (
            <Col xs={24} sm={12} md={8} key={app.type}>
              <Card bordered={false}>
                <Statistic title={app.type} value={app.count} suffix="台" />
                <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.65)' }}>
                  覆盖：{app.coverage}
                </div>
                <div style={{ marginTop: 12 }}>
                  {app.aiModels.map((model) => (
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
        <Table<DeviceDeploymentItem>
          rowKey="id"
          columns={columns}
          dataSource={deployments}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1300 }}
        />
      </Card>
    </PageContainer>
  );
};

export default ConfigInfo;
