import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import {
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
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ChannelDeploymentItem,
  ChannelDeploymentResponse,
} from '@/services/pedestrian';
import { getChannelDeployments } from '@/services/pedestrian';

type FilterState = {
  keyword: string;
  deviceType: ChannelDeploymentItem['deviceType'] | 'all';
};

const deviceTypeOptions: ChannelDeploymentItem['deviceType'][] = ['智能盒子'];
const DEVICE_TYPE_LABEL_IDS: Record<string, string> = {
  智能盒子: 'pages.pedestrian.deviceDeployment.deviceType.smartBox',
};

const DeviceDeployment: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getChannelDeployments, {
    formatResult: (
      res: ChannelDeploymentResponse | { data: ChannelDeploymentResponse },
    ) =>
      (res as { data?: ChannelDeploymentResponse })?.data ??
      (res as ChannelDeploymentResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [devices, setDevices] = useState<ChannelDeploymentItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    deviceType: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<ChannelDeploymentItem | null>(null);
  const [form] = Form.useForm<ChannelDeploymentItem>();
  const [filterForm] = Form.useForm();
  const formatDeviceType = useCallback(
    (type?: string) => {
      if (!type) return undefined;
      const labelId = DEVICE_TYPE_LABEL_IDS[type];
      return labelId ? t(labelId) : type;
    },
    [t],
  );

  useEffect(() => {
    if (data?.devices && !initialized) {
      setDevices(data.devices);
      setInitialized(true);
    }
  }, [data?.devices, initialized]);

  const filteredDevices = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return devices.filter((item) => {
      const matchKeyword = keyword
        ? [item.channelName, item.deviceName, item.deviceId, item.position]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType =
        filters.deviceType === 'all' || item.deviceType === filters.deviceType;
      return matchKeyword && matchType;
    });
  }, [devices, filters.deviceType, filters.keyword]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        deviceType: (values.deviceType ?? 'all') as FilterState['deviceType'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', deviceType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      deviceType: '智能盒子',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: ChannelDeploymentItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setDevices((prev) => prev.filter((item) => item.id !== id));
      message.success(t('pages.common.messages.deleteSuccess'));
    },
    [t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setDevices((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id ? { ...item, ...values } : item,
        ),
      );
      message.success(
        t('pages.pedestrian.deviceDeployment.messages.updateSuccess'),
      );
    } else {
      const newItem: ChannelDeploymentItem = {
        ...values,
        id: values.id?.trim() ? values.id : `PCD-${Date.now()}`,
        status: '正常运行',
      };
      setDevices((prev) => [newItem, ...prev]);
      message.success(
        t('pages.pedestrian.deviceDeployment.messages.createSuccess'),
      );
    }
    setModalVisible(false);
  }, [editingRecord, form, t]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<ChannelDeploymentItem> = useMemo(
    () => [
      {
        title: t('pages.pedestrian.deviceDeployment.columns.channel'),
        dataIndex: 'channelName',
        width: 200,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.deviceName'),
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.deviceId}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.deviceType'),
        dataIndex: 'deviceType',
        width: 180,
        render: (value: ChannelDeploymentItem['deviceType']) => (
          <Tag color="blue">{formatDeviceType(value)}</Tag>
        ),
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.position'),
        dataIndex: 'position',
        width: 220,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.installHeight'),
        dataIndex: 'installHeight',
        width: 140,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.lensAngle'),
        dataIndex: 'lensAngle',
        width: 160,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.installDate'),
        dataIndex: 'installDate',
        width: 160,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.owner'),
        dataIndex: 'owner',
        width: 160,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.testResult'),
        dataIndex: 'testResult',
        width: 200,
      },
      {
        title: t('pages.pedestrian.deviceDeployment.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.pedestrian.deviceDeployment.popconfirm.delete')}
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
    [formatDeviceType, handleDelete, handleEdit, t],
  );

  return (
    <PageContainer
      header={{ title: t('pages.pedestrian.deviceDeployment.pageTitle') }}
    >
      <Card
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.pedestrian.deviceDeployment.button.add')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', deviceType: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t(
                'pages.pedestrian.deviceDeployment.filter.keyword',
              )}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="deviceType">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.pedestrian.deviceDeployment.filter.allTypes'),
                },
                ...deviceTypeOptions.map((type) => ({
                  value: type,
                  label: formatDeviceType(type),
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
        <Table<ChannelDeploymentItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredDevices}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.pedestrian.deviceDeployment.modal.editTitle')
            : t('pages.pedestrian.deviceDeployment.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={760}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item
              label={t('pages.pedestrian.deviceDeployment.form.labels.id')}
              name="id"
            >
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item
              label={t('pages.pedestrian.deviceDeployment.form.labels.id')}
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
                label={t(
                  'pages.pedestrian.deviceDeployment.form.labels.channel',
                )}
                name="channelName"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.deviceDeployment.form.validations.channel',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.channel',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.pedestrian.deviceDeployment.form.labels.type')}
                name="deviceType"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.deviceDeployment.form.validations.type',
                    ),
                  },
                ]}
              >
                <Select
                  options={deviceTypeOptions.map((type) => ({
                    label: formatDeviceType(type),
                    value: type,
                  }))}
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.type',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.pedestrian.deviceDeployment.form.labels.deviceName',
                )}
                name="deviceName"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.deviceDeployment.form.validations.deviceName',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.deviceName',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.pedestrian.deviceDeployment.form.labels.deviceId',
                )}
                name="deviceId"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.deviceDeployment.form.validations.deviceId',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.deviceId',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.pedestrian.deviceDeployment.form.labels.position')}
            name="position"
            rules={[
              {
                required: true,
                message: t(
                  'pages.pedestrian.deviceDeployment.form.validations.position',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.pedestrian.deviceDeployment.form.placeholders.position',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.pedestrian.deviceDeployment.form.labels.installHeight',
                )}
                name="installHeight"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.installHeight',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.pedestrian.deviceDeployment.form.labels.lensAngle',
                )}
                name="lensAngle"
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.lensAngle',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t(
                  'pages.pedestrian.deviceDeployment.form.labels.installDate',
                )}
                name="installDate"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.pedestrian.deviceDeployment.form.validations.installDate',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.pedestrian.deviceDeployment.form.placeholders.installDate',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.pedestrian.deviceDeployment.form.labels.owner')}
            name="owner"
            rules={[
              {
                required: true,
                message: t(
                  'pages.pedestrian.deviceDeployment.form.validations.owner',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.pedestrian.deviceDeployment.form.placeholders.owner',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t(
              'pages.pedestrian.deviceDeployment.form.labels.testResult',
            )}
            name="testResult"
          >
            <Input
              placeholder={t(
                'pages.pedestrian.deviceDeployment.form.placeholders.testResult',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DeviceDeployment;
