import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Image,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  RetrogradeViolationDetail,
  RetrogradeViolationItem,
  RetrogradeViolationResponse,
} from '@/services/traffic';
import {
  getRetrogradeViolationDetail,
  getRetrogradeViolations,
} from '@/services/traffic';

const { Paragraph } = Typography;
const RETROGRADE_FILTER = {
  major_type: 'alert_alarm',
  minor_type: 'TRIPWIRE',
} as const;

const RetrogradeMonitoring: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [detailVisible, setDetailVisible] = useState(false);

  const { data, loading, run } = useRequest(
    ({ page = pagination.current, pageSize = pagination.pageSize } = {}) =>
      getRetrogradeViolations({
        ...RETROGRADE_FILTER,
        page,
        per_page: pageSize,
      }),
    {
      manual: true,
      formatResult: (
        res:
          | RetrogradeViolationResponse
          | { data: RetrogradeViolationResponse },
      ) =>
        (res as { data?: RetrogradeViolationResponse })?.data ??
        (res as RetrogradeViolationResponse),
    },
  );

  useEffect(() => {
    run({ page: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, run]);

  const {
    data: detail,
    loading: detailLoading,
    run: fetchDetail,
  } = useRequest((id: string) => getRetrogradeViolationDetail(id), {
    manual: true,
    formatResult: (
      res: RetrogradeViolationDetail | { data: RetrogradeViolationDetail },
    ) =>
      (res as { data?: RetrogradeViolationDetail })?.data ??
      (res as RetrogradeViolationDetail),
  });

  const handleViewDetail = useCallback(
    (id: string) => {
      setDetailVisible(true);
      fetchDetail(id);
    },
    [fetchDetail],
  );

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
  }, []);

  const records = data?.records ?? [];
  const totalRecords = data?.total ?? 0;
  const taggedRecords = records.filter(
    (record) => record.personIdentifiers.length > 0,
  ).length;

  const columns: ColumnsType<RetrogradeViolationItem> = useMemo(
    () => [
      {
        title: '抓拍时间',
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: '车牌号',
        dataIndex: 'plateNumber',
        width: 140,
        render: (value: string | undefined) =>
          value ? <strong>{value}</strong> : '—',
      },
      {
        title: '车辆信息',
        render: (_: unknown, record) => (
          <>
            <div>
              {record.vehicleBrand || '未知'}
              {record.vehicleSubBrand ? `/${record.vehicleSubBrand}` : ''}
            </div>
            <div>
              {record.vehicleClass || '未知'}
              {record.vehicleColor ? `/${record.vehicleColor}` : ''}
            </div>
          </>
        ),
      },
      {
        title: '事件类型',
        dataIndex: 'minorType',
        width: 160,
        render: (_: string | undefined, record) => (
          <Tag color="red">逆行告警/{record.minorType || 'TRIPWIRE'}</Tag>
        ),
      },
      {
        title: '关联人员',
        dataIndex: 'personIdentifiers',
        width: 220,
        render: (value: string[], _record) =>
          value?.length ? value.join('、') : '无关联人员',
      },
      {
        title: '抓拍图片',
        dataIndex: 'captureImageUrls',
        render: (value: string[]) =>
          value?.length ? (
            <Image.PreviewGroup>
              <Space size={8} wrap>
                {value.slice(0, 3).map((url) => (
                  <Image
                    key={`${record.id}-${url}`}
                    src={url}
                    width={90}
                    height={60}
                    style={{ objectFit: 'cover' }}
                    preview={{ src: url }}
                  />
                ))}
                {value.length > 3 ? (
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    +{value.length - 3}
                  </Paragraph>
                ) : null}
              </Space>
            </Image.PreviewGroup>
          ) : (
            '—'
          ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 120,
        render: (_: unknown, record) => (
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            查看详情
          </Button>
        ),
      },
    ],
    [handleViewDetail],
  );

  return (
    <PageContainer header={{ title: '逆行监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="逆行记录" value={totalRecords} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="关联人员" value={taggedRecords} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        bodyStyle={{ paddingTop: 8 }}
        style={{ marginTop: 24 }}
        title="逆行告警记录"
      >
        <Table<RetrogradeViolationItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalRecords,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({
                current: page,
                pageSize: pageSize || pagination.pageSize,
              }),
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Drawer
        title="逆行告警详情"
        width={520}
        open={detailVisible}
        onClose={closeDetail}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : detail ? (
          <>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="抓拍时间">
                {detail.timestamp
                  ? dayjs(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="车牌号">
                {detail.plateNumber || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="车辆信息">
                {[detail.vehicleBrand, detail.vehicleSubBrand]
                  .filter(Boolean)
                  .join('/')}
                <br />
                {[detail.vehicleClass, detail.vehicleColor]
                  .filter(Boolean)
                  .join('/')}
              </Descriptions.Item>
              <Descriptions.Item label="关联人员">
                {detail.personIdentifiers.length
                  ? detail.personIdentifiers.join('、')
                  : '无'}
              </Descriptions.Item>
              <Descriptions.Item label="事件类型">
                {`${detail.majorType || ''}/${detail.minorType || ''}`}
              </Descriptions.Item>
              <Descriptions.Item label="抓拍图片数量">
                {detail.captureImageCount ?? detail.captureImageUrls.length}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {detail.captureImageUrls.length ? (
              <Image.PreviewGroup>
                <Space size={12} wrap>
                  {detail.captureImageUrls.map((url) => (
                    <Image
                      key={`${detail.id ?? 'retro'}-${url}`}
                      src={url}
                      width={160}
                      height={110}
                      style={{ objectFit: 'cover' }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无抓拍图片"
              />
            )}
          </>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RetrogradeMonitoring;
