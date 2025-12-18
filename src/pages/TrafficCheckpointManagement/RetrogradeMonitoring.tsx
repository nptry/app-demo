import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
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
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const recordUnitLabel = t('pages.common.unit.records');
  const unknownLabel = t('pages.common.text.unknown');

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
  const columns: ColumnsType<RetrogradeViolationItem> = useMemo(
    () => [
      {
        title: t('pages.retrogradeMonitoring.columns.captureTime'),
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: t('pages.retrogradeMonitoring.columns.plateNumber'),
        dataIndex: 'plateNumber',
        width: 140,
        render: (value: string | undefined) =>
          value ? <strong>{value}</strong> : '—',
      },
      {
        title: t('pages.retrogradeMonitoring.columns.vehicleInfo'),
        render: (_: unknown, record) => (
          <>
            <div>
              {record.vehicleBrand || unknownLabel}
              {record.vehicleSubBrand ? `/${record.vehicleSubBrand}` : ''}
            </div>
            <div>
              {record.vehicleClass || unknownLabel}
              {record.vehicleColor ? `/${record.vehicleColor}` : ''}
            </div>
          </>
        ),
      },
      {
        title: t('pages.retrogradeMonitoring.columns.eventType'),
        dataIndex: 'minorType',
        width: 160,
        render: (_: string | undefined, record) => (
          <Tag color="red">
            {t('pages.retrogradeMonitoring.tag.wrongWay', {
              type: record.minorType || 'TRIPWIRE',
            })}
          </Tag>
        ),
      },
      {
        title: t('pages.retrogradeMonitoring.columns.captureImages'),
        dataIndex: 'captureImageUrls',
        render: (
          value: string[] | undefined,
          record: RetrogradeViolationItem,
        ) =>
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
        title: t('pages.retrogradeMonitoring.columns.action'),
        dataIndex: 'action',
        width: 120,
        render: (_: unknown, record) => (
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            {t('pages.common.actions.viewDetail')}
          </Button>
        ),
      },
    ],
    [handleViewDetail, t, unknownLabel],
  );

  return (
    <PageContainer
      header={{ title: t('pages.retrogradeMonitoring.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.retrogradeMonitoring.stat.totalRecords')}
              value={totalRecords}
              suffix={recordUnitLabel}
            />
          </Card>
        </Col>
      </Row>

      <Card
        bodyStyle={{ paddingTop: 8 }}
        style={{ marginTop: 24 }}
        title={t('pages.retrogradeMonitoring.table.title')}
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
            showTotal: (total) => t('pages.common.table.total', { total }),
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Drawer
        title={t('pages.retrogradeMonitoring.drawer.title')}
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
              <Descriptions.Item
                label={t('pages.retrogradeMonitoring.fields.captureTime')}
              >
                {detail.timestamp
                  ? dayjs(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.retrogradeMonitoring.fields.plateNumber')}
              >
                {detail.plateNumber || '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.retrogradeMonitoring.fields.vehicleInfo')}
              >
                {[detail.vehicleBrand, detail.vehicleSubBrand]
                  .filter(Boolean)
                  .join('/')}
                <br />
                {[detail.vehicleClass, detail.vehicleColor]
                  .filter(Boolean)
                  .join('/')}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.retrogradeMonitoring.fields.eventType')}
              >
                {`${detail.majorType || ''}/${detail.minorType || ''}`}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.retrogradeMonitoring.fields.captureImageCount')}
              >
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
                description={t('pages.common.empty.noImages')}
              />
            )}
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('pages.common.empty.noData')}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RetrogradeMonitoring;
