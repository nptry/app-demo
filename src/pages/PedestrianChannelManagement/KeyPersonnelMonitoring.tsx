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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PersonEventRecord,
  PersonEventResponse,
} from '@/services/personEventLogs';
import {
  getPersonEventLogDetail,
  getPersonEventLogs,
} from '@/services/personEventLogs';

const PERSON_TAG_FILTER = 'blacklist';

const KeyPersonnelMonitoring: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [detailVisible, setDetailVisible] = useState(false);
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const recordUnit = t('pages.common.unit.records');
  const personUnit = t('pages.pedestrian.keyPersonnel.unit.person');
  const locationUnit = t('pages.pedestrian.keyPersonnel.unit.location');

  const { data, loading, run } = useRequest(
    ({ page = pagination.current, pageSize = pagination.pageSize } = {}) =>
      getPersonEventLogs({
        person_tag: PERSON_TAG_FILTER,
        page,
        per_page: pageSize,
      }),
    {
      manual: true,
      formatResult: (
        res: PersonEventResponse | { data: PersonEventResponse },
      ) =>
        (res as { data?: PersonEventResponse })?.data ??
        (res as PersonEventResponse),
    },
  );

  useEffect(() => {
    run({ page: pagination.current, pageSize: pagination.pageSize });
  }, [pagination.current, pagination.pageSize, run]);

  const {
    data: detail,
    loading: detailLoading,
    run: fetchDetail,
  } = useRequest((id: string) => getPersonEventLogDetail(id), {
    manual: true,
  });

  const handleViewDetail = useCallback(
    (id: string) => {
      setDetailVisible(true);
      fetchDetail(id);
    },
    [fetchDetail],
  );

  const closeDetail = useCallback(() => setDetailVisible(false), []);

  const records = data?.records ?? [];
  const totalRecords = data?.total ?? 0;
  const vipCount = records.filter(
    (record) => record.personTag && record.personTag !== 'none',
  ).length;
  const locationCount = new Set(records.map((record) => record.location)).size;

  const tagLabelMap = useMemo(
    () => ({
      blacklist: t('pages.pedestrian.keyPersonnel.tags.blacklist'),
      watchlist: t('pages.pedestrian.keyPersonnel.tags.watchlist'),
    }),
    [t],
  );

  const columns: ColumnsType<PersonEventRecord> = useMemo(
    () => [
      {
        title: t('pages.pedestrian.keyPersonnel.columns.captureTime'),
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: t('pages.pedestrian.keyPersonnel.columns.person'),
        dataIndex: 'name',
        width: 200,
        render: (_: string | undefined, record) => (
          <>
            <div style={{ fontWeight: 600 }}>
              {record.name ?? t('pages.common.text.unknown')}
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.personType ??
                t('pages.pedestrian.keyPersonnel.text.unclassified')}
            </div>
          </>
        ),
      },
      {
        title: t('pages.pedestrian.keyPersonnel.columns.tag'),
        dataIndex: 'personTag',
        width: 140,
        render: (value: string | undefined) =>
          value ? (
            <Tag color={value === 'blacklist' ? 'red' : 'orange'}>
              {tagLabelMap[value] ?? value}
            </Tag>
          ) : (
            '—'
          ),
      },
      {
        title: t('pages.pedestrian.keyPersonnel.columns.location'),
        dataIndex: 'location',
        width: 180,
      },
      {
        title: t('pages.pedestrian.keyPersonnel.columns.images'),
        dataIndex: 'captureImageUrl',
        width: 200,
        render: (value: string | undefined, record) =>
          value ? (
            <Image.PreviewGroup>
              <Space size={8}>
                <Image
                  src={value}
                  width={90}
                  height={60}
                  style={{ objectFit: 'cover' }}
                  preview={{ src: value }}
                />
                {record.personImageUrl ? (
                  <Image
                    src={record.personImageUrl}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover' }}
                    preview={{ src: record.personImageUrl }}
                  />
                ) : null}
              </Space>
            </Image.PreviewGroup>
          ) : (
            '—'
          ),
      },
      {
        title: t('pages.pedestrian.keyPersonnel.columns.action'),
        dataIndex: 'action',
        width: 120,
        render: (_: unknown, record) => (
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            {t('pages.common.actions.viewDetail')}
          </Button>
        ),
      },
    ],
    [handleViewDetail, t, tagLabelMap],
  );

  return (
    <PageContainer
      header={{ title: t('pages.pedestrian.keyPersonnel.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.pedestrian.keyPersonnel.stats.records')}
              value={totalRecords}
              suffix={recordUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.pedestrian.keyPersonnel.stats.keyPersons')}
              value={vipCount}
              suffix={personUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.pedestrian.keyPersonnel.stats.locations')}
              value={locationCount}
              suffix={locationUnit}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.pedestrian.keyPersonnel.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
      >
        <Table<PersonEventRecord>
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
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title={t('pages.pedestrian.keyPersonnel.drawer.title')}
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
                label={t('pages.pedestrian.keyPersonnel.fields.captureTime')}
              >
                {detail.timestamp
                  ? dayjs(detail.timestamp).format('YYYY-MM-DD HH:mm:ss')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.pedestrian.keyPersonnel.fields.name')}
              >
                {detail.name ?? t('pages.common.text.unknown')}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.pedestrian.keyPersonnel.fields.type')}
              >
                {detail.personType ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.pedestrian.keyPersonnel.fields.tag')}
              >
                {detail.personTag
                  ? (tagLabelMap[detail.personTag] ?? detail.personTag)
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item
                label={t('pages.pedestrian.keyPersonnel.fields.location')}
              >
                {detail.location ?? '—'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Image.PreviewGroup>
              <Space size={12} wrap>
                {detail.captureImageUrl ? (
                  <Image
                    src={detail.captureImageUrl}
                    width={160}
                    height={110}
                    style={{ objectFit: 'cover' }}
                  />
                ) : null}
                {detail.personImageUrl ? (
                  <Image
                    src={detail.personImageUrl}
                    width={110}
                    height={110}
                    style={{ objectFit: 'cover' }}
                  />
                ) : null}
                {detail.frameImageUrl ? (
                  <Image
                    src={detail.frameImageUrl}
                    width={160}
                    height={110}
                    style={{ objectFit: 'cover' }}
                  />
                ) : null}
              </Space>
            </Image.PreviewGroup>
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

export default KeyPersonnelMonitoring;
