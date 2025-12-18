import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ChannelInfoItem,
  ChannelInfoResponse,
} from '@/services/pedestrian';
import { getChannelInfo } from '@/services/pedestrian';

const statusColor: Record<ChannelInfoItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

type FilterState = {
  keyword: string;
  status: ChannelInfoItem['status'] | 'all';
  channelType: ChannelInfoItem['channelType'] | 'all';
};

const channelTypeOptions: ChannelInfoItem['channelType'][] = [
  '商场入口',
  '地铁站出口',
  '步行街通道',
  '政府入口',
];
const statusOptions: ChannelInfoItem['status'][] = ['启用', '禁用'];
const CHANNEL_TYPE_LABEL_IDS: Record<ChannelInfoItem['channelType'], string> = {
  商场入口: 'pages.pedestrian.channelInfo.channelTypes.mall',
  地铁站出口: 'pages.pedestrian.channelInfo.channelTypes.metro',
  步行街通道: 'pages.pedestrian.channelInfo.channelTypes.walkway',
  政府入口: 'pages.pedestrian.channelInfo.channelTypes.government',
};
const STATUS_LABEL_IDS: Record<ChannelInfoItem['status'], string> = {
  启用: 'pages.pedestrian.channelInfo.status.enabled',
  禁用: 'pages.pedestrian.channelInfo.status.disabled',
};

const ChannelInfo: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getChannelInfo, {
    formatResult: (res: ChannelInfoResponse | { data: ChannelInfoResponse }) =>
      (res as { data?: ChannelInfoResponse })?.data ??
      (res as ChannelInfoResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [channels, setChannels] = useState<ChannelInfoItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    status: 'all',
    channelType: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChannelInfoItem | null>(
    null,
  );
  const [form] = Form.useForm<ChannelInfoItem>();
  const [filterForm] = Form.useForm();
  const formatChannelType = useCallback(
    (type?: ChannelInfoItem['channelType']) => {
      if (!type) return undefined;
      const labelId = CHANNEL_TYPE_LABEL_IDS[type];
      return labelId ? t(labelId) : type;
    },
    [t],
  );
  const formatStatus = useCallback(
    (status?: ChannelInfoItem['status']) => {
      if (!status) return undefined;
      const labelId = STATUS_LABEL_IDS[status];
      return labelId ? t(labelId) : status;
    },
    [t],
  );

  useEffect(() => {
    if (data?.channels && !initialized) {
      setChannels(data.channels);
      setInitialized(true);
    }
  }, [data?.channels, initialized]);

  const summary = useMemo(() => {
    if (channels.length) {
      return {
        total: channels.length,
        enabled: channels.filter((item) => item.status === '启用').length,
        widthMeters: channels.reduce((acc, item) => acc + (item.width ?? 0), 0),
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        enabled: 0,
        widthMeters: 0,
      }
    );
  }, [channels, data?.summary]);

  const filteredChannels = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return channels.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address].some((field) =>
            field?.toLowerCase().includes(keyword),
          )
        : true;
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
      const matchType =
        filters.channelType === 'all' ||
        item.channelType === filters.channelType;
      return matchKeyword && matchStatus && matchType;
    });
  }, [channels, filters.channelType, filters.keyword, filters.status]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        channelType: (values.channelType ??
          'all') as FilterState['channelType'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', channelType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: '启用',
      channelType: '商场入口',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: ChannelInfoItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setChannels((prev) => prev.filter((item) => item.id !== id));
      message.success(t('pages.common.messages.deleteSuccess'));
    },
    [t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setChannels((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? values : item)),
      );
      message.success(t('pages.pedestrian.channelInfo.messages.updateSuccess'));
    } else {
      const newItem: ChannelInfoItem = {
        ...values,
        id: values.id?.trim() ? values.id : `CH-${Date.now()}`,
      };
      setChannels((prev) => [newItem, ...prev]);
      message.success(t('pages.pedestrian.channelInfo.messages.createSuccess'));
    }
    setModalVisible(false);
  }, [editingRecord, form, t]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<ChannelInfoItem> = useMemo(
    () => [
      {
        title: t('pages.pedestrian.channelInfo.columns.id'),
        dataIndex: 'id',
        width: 140,
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.name'),
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.address}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.channelType'),
        dataIndex: 'channelType',
        width: 160,
        render: (value: ChannelInfoItem['channelType']) =>
          formatChannelType(value),
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.region'),
        dataIndex: 'region',
        width: 200,
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.width'),
        dataIndex: 'width',
        width: 120,
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.coordinates'),
        dataIndex: 'coordinates',
        width: 200,
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.manager'),
        dataIndex: 'manager',
        width: 180,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.phone}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.status'),
        dataIndex: 'status',
        width: 140,
        render: (value: ChannelInfoItem['status']) => (
          <Badge status={statusColor[value]} text={formatStatus(value)} />
        ),
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.mapFile'),
        dataIndex: 'mapFile',
        width: 200,
      },
      {
        title: t('pages.pedestrian.channelInfo.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.pedestrian.channelInfo.popconfirm.delete')}
              okText={t('pages.common.actions.confirm')}
              cancelText={t('pages.common.actions.cancel')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger>
                {t('pages.common.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [formatChannelType, formatStatus, handleDelete, handleEdit, t],
  );

  return (
    <PageContainer
      header={{ title: t('pages.pedestrian.channelInfo.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.pedestrian.channelInfo.stats.total')}
              value={summary.total}
              suffix={t('pages.pedestrian.channelInfo.unit.location')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.pedestrian.channelInfo.stats.enabled')}
              value={summary.enabled}
              suffix={t('pages.pedestrian.channelInfo.unit.location')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.pedestrian.channelInfo.stats.width')}
              value={summary.widthMeters}
              suffix="m"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.pedestrian.channelInfo.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.pedestrian.channelInfo.button.add')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', channelType: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t('pages.pedestrian.channelInfo.filter.keyword')}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="channelType">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.pedestrian.channelInfo.filter.allTypes'),
                },
                ...channelTypeOptions.map((type) => ({
                  label: formatChannelType(type),
                  value: type,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 160 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.pedestrian.channelInfo.filter.allStatus'),
                },
                ...statusOptions.map((status) => ({
                  label: formatStatus(status),
                  value: status,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
          </Form.Item>
        </Form>
        <Table<ChannelInfoItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredChannels}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.pedestrian.channelInfo.modal.editTitle')
            : t('pages.pedestrian.channelInfo.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item
              label={t('pages.pedestrian.channelInfo.form.labels.id')}
              name="id"
            >
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item
              label={t('pages.pedestrian.channelInfo.form.labels.id')}
              name="id"
            >
              <Input
                placeholder={t('pages.common.form.placeholder.autoGenerate')}
              />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.name',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.name',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.pedestrian.channelInfo.form.labels.channelType',
                )}
                name="channelType"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.channelType',
                    ),
                  },
                ]}
              >
                <Select
                  options={channelTypeOptions.map((type) => ({
                    label: formatChannelType(type),
                    value: type,
                  }))}
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.channelType',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.region')}
                name="region"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.region',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.region',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.width')}
                name="width"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.width',
                    ),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.width',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.pedestrian.channelInfo.form.labels.address')}
            name="address"
            rules={[
              {
                required: true,
                message: t(
                  'pages.pedestrian.channelInfo.form.validations.address',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.pedestrian.channelInfo.form.placeholders.address',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.pedestrian.channelInfo.form.labels.coordinates')}
            name="coordinates"
          >
            <Input
              placeholder={t(
                'pages.pedestrian.channelInfo.form.placeholders.coordinates',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.manager')}
                name="manager"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.manager',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.manager',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.phone')}
                name="phone"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.phone',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.phone',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.status')}
                name="status"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.channelInfo.form.validations.status',
                    ),
                  },
                ]}
              >
                <Select
                  options={statusOptions.map((status) => ({
                    label: formatStatus(status),
                    value: status,
                  }))}
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.status',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.channelInfo.form.labels.mapFile')}
                name="mapFile"
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.channelInfo.form.placeholders.mapFile',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ChannelInfo;
