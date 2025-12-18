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
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const recordUnitLabel = t('pages.common.unit.records');
  const personCountLabel = useCallback(
    (count: number) => t('pages.keyArea.density.personCount', { count }),
    [t],
  );
  const showTotalText = useCallback(
    (total: number) => t('pages.common.table.total', { total }),
    [t],
  );

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
        title: t('pages.keyArea.density.columns.time'),
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: t('pages.keyArea.density.columns.crowdSize'),
        width: 160,
        render: (_: unknown, record) => (
          <Tag color={record.personIdentifiers.length >= 5 ? 'red' : 'blue'}>
            {personCountLabel(record.personIdentifiers.length)}
          </Tag>
        ),
      },
      {
        title: t('pages.keyArea.density.columns.captureImages'),
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
        title: t('pages.keyArea.density.columns.type'),
        dataIndex: 'minorType',
        width: 180,
        render: (_: string | undefined, record) =>
          `${record.majorType || ''}/${record.minorType || ''}`,
      },
      {
        title: t('pages.keyArea.density.columns.action'),
        dataIndex: 'action',
        width: 120,
        render: (_: unknown, record) => (
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            {t('pages.common.actions.viewDetail')}
          </Button>
        ),
      },
    ],
    [handleViewDetail, personCountLabel, t],
  );

  return (
    <PageContainer header={{ title: t('pages.keyArea.density.pageTitle') }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.density.stats.totalEvents')}
              value={totalRecords}
              suffix={recordUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.density.stats.highDensity')}
              value={highDensityCount}
              suffix={recordUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.keyArea.density.stats.maxPersons')}
              value={maxPersonCount}
              suffix={t('pages.keyArea.density.stats.personUnit')}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.keyArea.density.table.title')}
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
            showTotal: showTotalText,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title={t('pages.keyArea.density.drawer.title')}
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
              <Descriptions.Item label={t('pages.keyArea.density.fields.time')}>
                {detail.timestamp
                  ? dayjs(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.keyArea.density.fields.eventType')}
              >
                {`${detail.majorType || ''}/${detail.minorType || ''}`}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.keyArea.density.fields.captureCount')}
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

export default DensityMonitoring;
