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
  CrowdDensityDetail,
  CrowdDensityItem,
  CrowdDensityResponse,
} from '@/services/traffic';
import {
  getCrowdDensityEventDetail,
  getCrowdDensityEvents,
} from '@/services/traffic';

const { Paragraph } = Typography;
const CROWD_DENSITY_FILTER = {
  major_type: 'headcount_alarm',
  minor_type: 'MAX_NUMBER_PEOPLE',
} as const;

const DensityMonitoring: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [detailVisible, setDetailVisible] = useState(false);

  const { data, loading, run } = useRequest(
    ({ page = pagination.current, pageSize = pagination.pageSize } = {}) =>
      getCrowdDensityEvents({
        ...CROWD_DENSITY_FILTER,
        page,
        per_page: pageSize,
      }),
    {
      manual: true,
      formatResult: (
        res: CrowdDensityResponse | { data: CrowdDensityResponse },
      ) =>
        (res as { data?: CrowdDensityResponse })?.data ??
        (res as CrowdDensityResponse),
    },
  );

  useEffect(() => {
    run({ page: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, run]);

  const {
    data: detail,
    loading: detailLoading,
    run: fetchDetail,
  } = useRequest((id: string) => getCrowdDensityEventDetail(id), {
    manual: true,
    formatResult: (res: CrowdDensityDetail | { data: CrowdDensityDetail }) =>
      (res as { data?: CrowdDensityDetail })?.data ??
      (res as CrowdDensityDetail),
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
  const highDensityCount = records.filter(
    (record) => record.personIdentifiers.length >= 5,
  ).length;
  const maxPersonCount = Math.max(
    ...records.map((item) => item.personIdentifiers.length),
    0,
  );

  const columns: ColumnsType<CrowdDensityItem> = useMemo(
    () => [
      {
        title: '时间',
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: '人群规模',
        width: 160,
        render: (_: unknown, record) => (
          <Tag color={record.personIdentifiers.length >= 5 ? 'red' : 'blue'}>
            {record.personIdentifiers.length} 人
          </Tag>
        ),
      },
      {
        title: '关联人员',
        dataIndex: 'personIdentifiers',
        width: 260,
        render: (value: string[]) =>
          value?.length ? (
            <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}>
              {value.join('、')}
            </Paragraph>
          ) : (
            '未识别到具体人员'
          ),
      },
      {
        title: '抓拍图片',
        dataIndex: 'captureImageUrls',
        render: (value: string[], record) =>
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
        title: '类型',
        dataIndex: 'minorType',
        width: 180,
        render: (_: string | undefined, record) =>
          `${record.majorType || ''}/${record.minorType || ''}`,
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
    <PageContainer header={{ title: '人群密度监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="总事件" value={totalRecords} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="高密度事件"
              value={highDensityCount}
              suffix="条"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="最大识别人数"
              value={maxPersonCount}
              suffix="人"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="实时密度事件"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<CrowdDensityItem>
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
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title="密度事件详情"
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
              <Descriptions.Item label="时间">
                {detail.timestamp
                  ? dayjs(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="关联人员">
                {detail.personIdentifiers.length
                  ? detail.personIdentifiers.join('、')
                  : '未识别到具体人员'}
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
                      key={`${detail.id ?? 'density'}-${url}`}
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

export default DensityMonitoring;
