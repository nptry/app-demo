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
  const totalRecords = data?.total ?? 0;

  const columns: ColumnsType<LicenseRecordItem> = useMemo(
    () => [
      {
        title: t('pages.licenseRecords.columns.captureTime'),
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: t('pages.licenseRecords.columns.plateNumber'),
        dataIndex: 'plateNumber',
        width: 140,
        render: (value: string | undefined) =>
          value ? <strong>{value}</strong> : '—',
      },
      {
        title: t('pages.licenseRecords.columns.eventType'),
        dataIndex: 'plateRecognition',
        width: 140,
        render: (_: boolean, record) => (
          <Tag color={record.plateRecognition ? 'blue' : 'default'}>
            {record.plateRecognition
              ? t('pages.licenseRecords.tag.plateRecognition')
              : `${record.majorType ?? ''}/${record.minorType ?? ''}`}
          </Tag>
        ),
      },
      {
        title: t('pages.licenseRecords.columns.vehicleInfo'),
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
        title: t('pages.licenseRecords.columns.captureImages'),
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
        title: t('pages.licenseRecords.columns.action'),
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
    <PageContainer header={{ title: t('pages.licenseRecords.pageTitle') }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.licenseRecords.stat.totalRecords')}
              value={totalRecords}
              suffix={recordUnitLabel}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.licenseRecords.table.title')}
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
            showTotal: (total) => t('pages.common.table.total', { total }),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Drawer
        title={t('pages.licenseRecords.drawer.title')}
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
                label={t('pages.licenseRecords.fields.captureTime')}
              >
                {detail.timestamp
                  ? dayjs(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.licenseRecords.fields.plateNumber')}
              >
                {detail.plateNumber || '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.licenseRecords.fields.vehicleInfo')}
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
                label={t('pages.licenseRecords.fields.rawPersonIds')}
              >
                {detail.rawPersonIdList || '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.licenseRecords.fields.captureImageCount')}
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

export default LicenseRecords;
