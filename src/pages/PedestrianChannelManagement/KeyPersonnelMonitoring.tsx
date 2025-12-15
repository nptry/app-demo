import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Descriptions,
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

  const columns: ColumnsType<PersonEventRecord> = useMemo(
    () => [
      {
        title: '抓拍时间',
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string | undefined) =>
          value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—',
      },
      {
        title: '姓名/类型',
        dataIndex: 'name',
        width: 200,
        render: (_: string | undefined, record) => (
          <>
            <div style={{ fontWeight: 600 }}>{record.name ?? '未知'}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.personType ?? '未分类'}
            </div>
          </>
        ),
      },
      {
        title: '人员标签',
        dataIndex: 'personTag',
        width: 140,
        render: (value: string | undefined) =>
          value ? (
            <Tag color={value === 'blacklist' ? 'red' : 'orange'}>{value}</Tag>
          ) : (
            '—'
          ),
      },
      { title: '位置', dataIndex: 'location', width: 180 },
      {
        title: '抓拍图片',
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
    <PageContainer header={{ title: '重点人员监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="抓拍记录" value={totalRecords} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点人员" value={vipCount} suffix="条" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="覆盖点位" value={locationCount} suffix="处" />
          </Card>
        </Col>
      </Row>

      <Card
        title="重点人员抓拍记录"
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
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title="抓拍详情"
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
              <Descriptions.Item label="姓名">
                {detail.name ?? '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="人员类型">
                {detail.personType ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="人员标签">
                {detail.personTag ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="位置">
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
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default KeyPersonnelMonitoring;
