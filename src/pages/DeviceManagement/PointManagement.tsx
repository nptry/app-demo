import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  DatePicker,
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
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { type DeviceListResponse, getDevices } from '@/services/device';
import type {
  CheckpointPoint,
  CheckpointPointResponse,
  SitePoint,
  SitePointResponse,
} from '@/services/point';
import {
  createCheckpointPoint,
  createSitePoint,
  deleteCheckpointPoint,
  deleteSitePoint,
  getCheckpointPoints,
  getSitePoints,
  updateCheckpointPoint,
  updateSitePoint,
} from '@/services/point';
import { getRegions } from '@/services/region';

type TabKey = 'checkpoint' | 'site';
type DeviceOption = { label: string; value: string };
type RegionOption = { label: string; value: string };

const DEVICE_OPTION_FETCH_SIZE = 500;

const useDeviceOptions = (): DeviceOption[] => {
  const { data } = useRequest(
    () => getDevices({ page: 1, per_page: DEVICE_OPTION_FETCH_SIZE }),
    {
      formatResult: (res: DeviceListResponse | { data: DeviceListResponse }) =>
        (res as { data?: DeviceListResponse })?.data ??
        (res as DeviceListResponse),
    },
  );

  return useMemo(() => {
    return (
      data?.records?.map((device) => ({
        label: `${device.name} (${device.id})`,
        value: device.id.toString(),
      })) ?? []
    );
  }, [data?.records]);
};

const useRegionOptions = (type: 'checkpoint' | 'site'): RegionOption[] => {
  const { data } = useRequest(() => getRegions({ region_type: type }), {
    formatResult: (res) => res.data,
  });

  return useMemo(() => {
    return (
      data?.regions?.map((region) => ({
        label: region.name,
        value: region.id,
      })) ?? []
    );
  }, [data?.regions]);
};

const CheckpointTab: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const regionOptions = useRegionOptions('checkpoint');
  const { data, loading, refresh } = useRequest(getCheckpointPoints, {
    formatResult: (
      res: CheckpointPointResponse | { data: CheckpointPointResponse },
    ) =>
      (res as { data?: CheckpointPointResponse })?.data ??
      (res as CheckpointPointResponse),
  });

  const checkpoints = data?.checkpoints ?? [];
  const summary = data?.summary ?? { total: 0, enabled: 0, laneCount: 0 };

  const [filters, setFilters] = useState<{ keyword: string; type: string }>({
    keyword: '',
    type: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CheckpointPoint | null>(
    null,
  );
  const [form] = Form.useForm<CheckpointPoint>();
  const [filterForm] = Form.useForm();
  const checkpointUnitLabel = t('pages.deviceManagement.point.unit.count');
  const laneUnitLabel = t('pages.deviceManagement.point.unit.lane');
  const unboundText = t('pages.deviceManagement.point.text.unbound');

  const typeOptions = useMemo(() => {
    return Array.from(
      new Set(checkpoints.flatMap((item) => item.checkpointTypes || [])),
    );
  }, [checkpoints]);

  const filteredCheckpoints = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return checkpoints.filter((item) => {
      const matchKeyword = keyword
        ? [
            item.name,
            item.region,
            item.address,
            item.positionDescription,
            item.deviceName,
          ]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType =
        filters.type === 'all' || item.checkpointTypes.includes(filters.type);
      return matchKeyword && matchType;
    });
  }, [checkpoints, filters.keyword, filters.type]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        type: values.type ?? 'all',
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', type: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: CheckpointPoint) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteCheckpointPoint(id);
      message.success(t('pages.common.messages.deleteSuccess'));
      refresh();
    },
    [refresh, t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const payload = { ...values };
    if (editingRecord) {
      await updateCheckpointPoint(editingRecord.id, payload);
      message.success(
        t('pages.deviceManagement.point.checkpoint.messages.updateSuccess'),
      );
    } else {
      await createCheckpointPoint(payload);
      message.success(
        t('pages.deviceManagement.point.checkpoint.messages.createSuccess'),
      );
    }
    setModalVisible(false);
    refresh();
  }, [editingRecord, form, refresh, t]);

  const columns: ColumnsType<CheckpointPoint> = useMemo(
    () => [
      {
        title: t('pages.deviceManagement.point.columns.id'),
        dataIndex: 'id',
        width: 140,
      },
      {
        title: t('pages.deviceManagement.point.columns.name'),
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
        title: t('pages.deviceManagement.point.columns.region'),
        dataIndex: 'region',
        width: 200,
      },
      {
        title: t('pages.deviceManagement.point.columns.devices'),
        dataIndex: 'devices',
        width: 220,
        render: (devices: { id: string; name: string }[], record) => {
          if (devices && devices.length > 0) {
            return (
              <Space direction="vertical" size={0}>
                {devices.map((d) => (
                  <div key={d.id}>{`${d.name} (${d.id})`}</div>
                ))}
              </Space>
            );
          }
          return record.deviceName
            ? `${record.deviceName} (${record.deviceId})`
            : unboundText;
        },
      },
      {
        title: t('pages.deviceManagement.point.columns.position'),
        dataIndex: 'positionDescription',
        width: 220,
      },
      {
        title: t('pages.deviceManagement.point.columns.lane'),
        dataIndex: 'laneName',
        width: 140,
      },
      {
        title: t('pages.deviceManagement.point.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.deviceManagement.point.popconfirm.deleteTitle')}
              okText={t('pages.common.actions.confirm')}
              cancelText={t('pages.common.actions.cancel')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {t('pages.common.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit, t, unboundText],
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.point.checkpoint.card.total')}
              value={summary.total}
              suffix={checkpointUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.point.checkpoint.card.lane')}
              value={summary.laneCount}
              suffix={laneUnitLabel}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.deviceManagement.point.checkpoint.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.deviceManagement.point.checkpoint.button.create')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', type: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t(
                'pages.deviceManagement.point.checkpoint.filter.keyword',
              )}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              allowClear={false}
              style={{ width: 200 }}
              options={[
                {
                  label: t(
                    'pages.deviceManagement.point.checkpoint.filter.type.all',
                  ),
                  value: 'all',
                },
                ...typeOptions.map((item) => ({ label: item, value: item })),
              ]}
              placeholder={t(
                'pages.deviceManagement.point.checkpoint.filter.type.placeholder',
              )}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
          </Form.Item>
        </Form>

        <Table<CheckpointPoint>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredCheckpoints}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 2000 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.deviceManagement.point.checkpoint.modal.editTitle')
            : t('pages.deviceManagement.point.checkpoint.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" form={form}>
          {editingRecord && (
            <Form.Item
              label={t('pages.deviceManagement.point.form.labels.id')}
              name="id"
            >
              <Input
                placeholder={t('pages.common.form.placeholder.autoGenerate')}
                disabled
              />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.deviceManagement.point.form.labels.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.deviceManagement.point.form.validations.name',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.deviceManagement.point.form.placeholders.name',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.deviceManagement.point.form.labels.region')}
                name="region"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.deviceManagement.point.form.validations.region',
                    ),
                  },
                ]}
              >
                <Select
                  options={regionOptions}
                  placeholder={t(
                    'pages.deviceManagement.point.form.placeholders.region',
                  )}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.lane')}
            name="laneName"
          >
            <Input
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.lane',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.position')}
            name="positionDescription"
          >
            <Input
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.position',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.remark')}
            name="remark"
          >
            <Input.TextArea
              rows={3}
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.remark',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const SiteTab: React.FC<{ deviceOptions: DeviceOption[] }> = ({
  deviceOptions,
}) => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const regionOptions = useRegionOptions('site');
  const { data, loading, refresh } = useRequest(getSitePoints, {
    formatResult: (res: SitePointResponse | { data: SitePointResponse }) =>
      (res as { data?: SitePointResponse })?.data ?? (res as SitePointResponse),
  });

  const sites = data?.sites ?? [];
  const summary =
    data?.summary ??
    ({ totalSites: 0, totalAreaSqm: 0 } as SitePointResponse['summary']);

  const [filters, setFilters] = useState<{ keyword: string }>({
    keyword: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SitePoint | null>(null);
  const [form] = Form.useForm<SitePoint>();
  const [filterForm] = Form.useForm();
  const siteUnitLabel = t('pages.deviceManagement.point.unit.site');
  const areaUnitLabel = t('pages.deviceManagement.point.unit.area');
  const unboundText = t('pages.deviceManagement.point.text.unbound');

  const filteredSites = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return sites.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      return matchKeyword;
    });
  }, [filters.keyword, sites]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: SitePoint) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSitePoint(id);
      message.success(t('pages.common.messages.deleteSuccess'));
      refresh();
    },
    [refresh, t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const payload = { ...values };
    if (editingRecord) {
      await updateSitePoint(editingRecord.id, payload);
      message.success(
        t('pages.deviceManagement.point.site.messages.updateSuccess'),
      );
    } else {
      await createSitePoint(payload);
      message.success(
        t('pages.deviceManagement.point.site.messages.createSuccess'),
      );
    }
    setModalVisible(false);
    refresh();
  }, [editingRecord, form, refresh, t]);

  const columns: ColumnsType<SitePoint> = useMemo(
    () => [
      {
        title: t('pages.deviceManagement.point.columns.id'),
        dataIndex: 'id',
        width: 140,
      },
      {
        title: t('pages.deviceManagement.point.columns.name'),
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
        title: t('pages.deviceManagement.point.columns.region'),
        dataIndex: 'region',
        width: 200,
      },
      {
        title: t('pages.deviceManagement.point.columns.devices'),
        dataIndex: 'devices',
        width: 220,
        render: (devices: { id: string; name: string }[], record) => {
          if (devices && devices.length > 0) {
            return (
              <Space direction="vertical" size={0}>
                {devices.map((d) => (
                  <div key={d.id}>{`${d.name} (${d.id})`}</div>
                ))}
              </Space>
            );
          }
          return record.deviceName
            ? `${record.deviceName} (${record.deviceId})`
            : unboundText;
        },
      },
      {
        title: t('pages.deviceManagement.point.columns.position'),
        dataIndex: 'positionDescription',
        width: 220,
      },
      {
        title: t('pages.deviceManagement.point.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.deviceManagement.point.popconfirm.deleteTitle')}
              okText={t('pages.common.actions.confirm')}
              cancelText={t('pages.common.actions.cancel')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {t('pages.common.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit, t, unboundText],
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.point.site.card.total')}
              value={summary.totalSites}
              suffix={siteUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.point.site.card.area')}
              value={summary.totalAreaSqm}
              suffix={areaUnitLabel}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.deviceManagement.point.site.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.deviceManagement.point.site.button.create')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t(
                'pages.deviceManagement.point.site.filter.keyword',
              )}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
          </Form.Item>
        </Form>
        <Table<SitePoint>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredSites}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.deviceManagement.point.site.modal.editTitle')
            : t('pages.deviceManagement.point.site.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={780}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.id')}
            name="id"
          >
            <Input
              placeholder={t('pages.common.form.placeholder.autoGenerate')}
              disabled={!!editingRecord}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.name')}
            name="name"
            rules={[
              {
                required: true,
                message: t(
                  'pages.deviceManagement.point.form.validations.name',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.name',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.deviceManagement.point.form.labels.region')}
                name="region"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.deviceManagement.point.form.validations.region',
                    ),
                  },
                ]}
              >
                <Select
                  options={regionOptions}
                  placeholder={t(
                    'pages.deviceManagement.point.form.placeholders.region',
                  )}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.deviceManagement.point.form.labels.area')}
                name="areaSize"
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={t(
                    'pages.deviceManagement.point.form.placeholders.area',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.device')}
            name="deviceId"
          >
            <Select
              options={deviceOptions}
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.device',
              )}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.position')}
            name="positionDescription"
          >
            <Input
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.position',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.point.form.labels.remark')}
            name="remark"
          >
            <Input.TextArea
              rows={3}
              placeholder={t(
                'pages.deviceManagement.point.form.placeholders.remark',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const PointManagement: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const deviceOptions = useDeviceOptions();
  const [activeKey, setActiveKey] = useState<TabKey>('checkpoint');

  return (
    <PageContainer
      header={{ title: t('pages.deviceManagement.point.pageTitle') }}
    >
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as TabKey)}
        destroyInactiveTabPane={false}
        items={[
          {
            key: 'checkpoint',
            label: t('pages.deviceManagement.point.tabs.checkpoint'),
            children: <CheckpointTab />,
          },
          {
            key: 'site',
            label: t('pages.deviceManagement.point.tabs.site'),
            children: <SiteTab deviceOptions={deviceOptions} />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default PointManagement;
