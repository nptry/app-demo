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
  LicenseRecordDetail,
  LicenseRecordItem,
  LicenseRecordResponse,
} from '@/services/traffic';
import { getLicenseRecordDetail, getLicenseRecords } from '@/services/traffic';

const { Paragraph } = Typography;
const PLATE_RECOGNITION_FILTER = {
  major_type: 'structure',
  minor_type: 'plate',
} as const;

const LicenseRecords: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [detailVisible, setDetailVisible] = useState(false);

  const { data, loading, run } = useRequest(
    ({ page = pagination.current, pageSize = pagination.pageSize } = {}) =>
      getLicenseRecords({
        ...PLATE_RECOGNITION_FILTER,
        page,
        per_page: pageSize,
      }),
    {
      manual: true,
      formatResult: (
        res: LicenseRecordResponse | { data: LicenseRecordResponse },
      ) =>
        (res as { data?: LicenseRecordResponse })?.data ??
        (res as LicenseRecordResponse),
    },
  );

  useEffect(() => {
    run({ page: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, run]);

  const {
    data: detail,
    loading: detailLoading,
    run: fetchDetail,
  } = useRequest((id: string) => getLicenseRecordDetail(id), {
    manual: true,
    formatResult: (res: LicenseRecordDetail | { data: LicenseRecordDetail }) =>
      (res as { data?: LicenseRecordDetail })?.data ??
      (res as LicenseRecordDetail),
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
  const abnormalCount = records.filter(
    (record) => record.personIdentifiers.length > 0,
  ).length;
  const totalRecords = data?.total ?? 0;

  const columns: ColumnsType<LicenseRecordItem> = useMemo(
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
        title: '事件类型',
        dataIndex: 'plateRecognition',
        width: 140,
        render: (_: boolean, record) => (
          <Tag color={record.plateRecognition ? 'blue' : 'default'}>
            {record.plateRecognition
              ? '车牌识别'
              : `${record.majorType ?? ''}/${record.minorType ?? ''}`}
          </Tag>
        ),
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
        title: '关联人员',
        dataIndex: 'personIdentifiers',
        width: 200,
        render: (value: string[]) =>
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
                    key={url}
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
    <PageContainer header={{ title: '车牌识别与记录' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="记录条数" value={totalRecords} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="关联人员" value={abnormalCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        title="抓拍记录"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<LicenseRecordItem>
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
          scroll={{ x: 1000 }}
        />
      </Card>

      <Drawer
        title="识别详情"
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
              <Descriptions.Item label="原始人员ID">
                {detail.rawPersonIdList || '—'}
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
                      key={`${detail.id ?? 'detail'}-${url}`}
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

export default LicenseRecords;
