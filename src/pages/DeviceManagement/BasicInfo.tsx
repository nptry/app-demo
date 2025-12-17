import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo, useState } from 'react';
import type {
  DeviceListResponse,
  DevicePointInfo,
  DeviceRecord,
  DeviceStatusItem,
  DeviceStatusResponse,
} from '@/services/device';
import {
  createDevice,
  deleteDevice,
  getDeviceStatus,
  getDevices,
  updateDevice,
} from '@/services/device';
import { getPointOptions, type PointOption } from '@/services/point';

const statusBadge: Record<
  DeviceBasicInfoItem['status'],
  'success' | 'processing' | 'error' | 'warning'
> = {
  在线: 'success',
  维护中: 'warning',
  故障: 'error',
  离线: 'error',
};

const statusColor: Record<
  DeviceStatusItem['realtimeStatus'],
  'success' | 'warning' | 'error' | 'default'
> = {
  在线: 'success',
  维护中: 'warning',
  故障: 'error',
  离线: 'default',
};

type DeviceBasicInfoItem = {
  id: string;
  name: string;
  type: '智能盒子' | string;
  model?: string;
  vendor?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyDate?: string;
  status: '在线' | '离线' | '故障' | '维护中';
  remark?: string;
  pointIds?: number[];
  points?: DevicePointInfo[];
  sn?: string;
  deviceType?: string;
};

type FilterState = {
  keyword: string;
  status: DeviceBasicInfoItem['status'] | 'all';
  type: 'all' | string;
};

type DeviceFormValues = DeviceBasicInfoItem & {
  deviceType?: string;
  pointIds?: number;
};

const buildDevicePayload = (values: DeviceFormValues) => {
  const metadataEntries = [['remark', values.remark]].filter(
    ([, value]) => value !== undefined && value !== '',
  );
  const metadata =
    metadataEntries.length > 0
      ? Object.fromEntries(metadataEntries)
      : undefined;

  return {
    name: values.name,
    device_type: values.deviceType,
    sn: values.serialNumber,
    metadata,
    point_ids: values.pointIds ? [values.pointIds] : undefined,
  };
};

const DEVICE_TYPE_DEFINITIONS = [
  {
    value: 'box',
    labelId: 'pages.deviceManagement.basicInfo.deviceTypes.box',
  },
] as const;

const DEVICE_TYPE_LABEL_IDS: Record<string, string> = {
  box: 'pages.deviceManagement.basicInfo.deviceTypes.box',
  'AI 边缘计算设备': 'pages.deviceManagement.basicInfo.deviceTypes.aiEdge',
};

const DEVICE_STATUS_VALUES: DeviceBasicInfoItem['status'][] = [
  '在线',
  '离线',
  '故障',
  '维护中',
];

const STATUS_LABEL_IDS: Record<DeviceBasicInfoItem['status'], string> = {
  在线: 'pages.deviceManagement.basicInfo.status.online',
  离线: 'pages.deviceManagement.basicInfo.status.offline',
  故障: 'pages.deviceManagement.basicInfo.status.fault',
  维护中: 'pages.deviceManagement.basicInfo.status.maintenance',
};

const apiStatusMap: Record<
  Exclude<DeviceRecord['status'], undefined>,
  DeviceBasicInfoItem['status']
> = {
  online: '在线',
  offline: '离线',
  fault: '故障',
  maintenance: '维护中',
};

const mapApiStatusToDisplay = (
  status?: DeviceRecord['status'],
): DeviceBasicInfoItem['status'] => {
  if (!status) {
    return '维护中';
  }
  return apiStatusMap[status] ?? '维护中';
};

const metadataValue = (
  metadata: Record<string, any> | undefined,
  keys: string[],
): string | undefined => {
  if (!metadata) return undefined;
  for (const key of keys) {
    if (metadata[key] !== undefined && metadata[key] !== null) {
      return String(metadata[key]);
    }
  }
  return undefined;
};

const transformDeviceRecord = (record: DeviceRecord): DeviceBasicInfoItem => {
  const metadata = record.metadata ?? {};
  const remark = metadataValue(metadata, ['remark', 'Remark']);
  const vendor = metadataValue(metadata, ['vendor', 'Vendor']);
  const installDate =
    metadataValue(metadata, ['install_date', 'installDate']) ??
    (record.created_at ? record.created_at.slice(0, 10) : undefined);
  const warrantyDate = metadataValue(metadata, [
    'warranty_date',
    'warrantyDate',
  ]);
  const pointIds = (record.point_ids ?? [])
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  return {
    id: String(record.id),
    name: record.name,
    type: 'AI 边缘计算设备',
    model: record.model,
    vendor,
    serialNumber: record.sn,
    installDate,
    warrantyDate,
    status: mapApiStatusToDisplay(record.status),
    remark,
    pointIds,
    points: record.points,
    sn: record.sn,
    deviceType: record.device_type,
  };
};

const DEFAULT_DEVICE_FETCH_SIZE = 500;

type EnrichedDevice = DeviceBasicInfoItem & {
  realtimeStatus?: DeviceStatusItem['realtimeStatus'];
  lastHeartbeat?: string;
  exception?: string;
};

const BasicInfo: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const deviceTypeOptions = useMemo(
    () =>
      DEVICE_TYPE_DEFINITIONS.map((option) => ({
        value: option.value,
        label: t(option.labelId),
      })),
    [t],
  );
  const deviceStatusOptions = useMemo(
    () =>
      DEVICE_STATUS_VALUES.map((status) => ({
        value: status,
        label: t(STATUS_LABEL_IDS[status]),
      })),
    [t],
  );
  const deviceUnitLabel = t('pages.deviceManagement.basicInfo.unit.device');
  const getDeviceTypeLabel = useCallback(
    (type?: string) => {
      if (!type) return undefined;
      const labelId = DEVICE_TYPE_LABEL_IDS[type];
      return labelId ? t(labelId) : type;
    },
    [t],
  );
  const formatStatusText = useCallback(
    (
      status?:
        | DeviceStatusItem['realtimeStatus']
        | DeviceBasicInfoItem['status'],
    ) => {
      if (!status) return undefined;
      const labelId = STATUS_LABEL_IDS[status as DeviceBasicInfoItem['status']];
      return labelId ? t(labelId) : status;
    },
    [t],
  );
  const { data, loading, refresh } = useRequest(
    () => getDevices({ page: 1, per_page: DEFAULT_DEVICE_FETCH_SIZE }),
    {
      formatResult: (res: DeviceListResponse | { data: DeviceListResponse }) =>
        (res as { data?: DeviceListResponse })?.data ??
        (res as DeviceListResponse),
    },
  );
  const {
    data: statusData,
    loading: statusLoading,
    refresh: refreshStatus,
  } = useRequest(getDeviceStatus, {
    formatResult: (
      res: DeviceStatusResponse | { data: DeviceStatusResponse },
    ) =>
      (res as { data?: DeviceStatusResponse })?.data ??
      (res as DeviceStatusResponse),
  });
  const {
    data: pointOptionsData,
    loading: pointOptionsLoading,
    refresh: refreshPointOptions,
  } = useRequest(getPointOptions, {
    formatResult: (res: PointOption[] | { data: PointOption[] }) =>
      (res as { data?: PointOption[] })?.data ?? (res as PointOption[]),
  });

  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    status: 'all',
    type: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<DeviceBasicInfoItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<DeviceBasicInfoItem & { pointIds?: number[] }>();
  const [filterForm] = Form.useForm();
  const pointOptions = pointOptionsData ?? [];
  const pointSelectOptions = useMemo(
    () =>
      pointOptions.map((point) => {
        const typeLabel = t(
          point.pointType === 'checkpoint'
            ? 'pages.deviceManagement.basicInfo.point.type.checkpoint'
            : 'pages.deviceManagement.basicInfo.point.type.site',
        );
        const suffix = point.deviceName
          ? t('pages.deviceManagement.basicInfo.point.boundSuffix', {
              name: point.deviceName,
            })
          : '';
        return {
          label: t('pages.deviceManagement.basicInfo.point.optionLabel', {
            name: point.name,
            type: typeLabel,
            suffix,
          }),
          value: point.id,
        };
      }),
    [pointOptions, t],
  );

  const rawDevices = data?.records ?? [];
  const devices = useMemo(() => {
    return rawDevices.map((record) => transformDeviceRecord(record));
  }, [rawDevices]);
  const summary = data?.summary ?? {
    total: 0,
    aiEdge: 0,
    gateways: 0,
    online: 0,
  };

  const statusList = statusData?.statuses ?? [];
  const statusMap = useMemo(() => {
    return statusList.reduce<Record<string, DeviceStatusItem>>((acc, item) => {
      acc[item.deviceId] = item;
      return acc;
    }, {});
  }, [statusList]);

  const enrichedDevices = useMemo<EnrichedDevice[]>(() => {
    return devices.map((item) => {
      const statusKey = item.serialNumber ?? item.id;
      const statusInfo = statusKey ? statusMap[statusKey] : undefined;
      return {
        ...item,
        realtimeStatus: statusInfo?.realtimeStatus,
        lastHeartbeat: statusInfo?.lastHeartbeat,
        exception: statusInfo?.exception,
      };
    });
  }, [devices, statusMap]);

  const filteredDevices = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return enrichedDevices.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.serialNumber]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus =
        filters.status === 'all' ||
        (item.realtimeStatus ?? item.status) === filters.status;
      const matchType =
        filters.type === 'all' ||
        item.deviceType === filters.type ||
        (!item.deviceType && item.type === filters.type);
      return matchKeyword && matchStatus && matchType;
    });
  }, [enrichedDevices, filters.keyword, filters.status, filters.type]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        type: (values.type ?? 'all') as FilterState['type'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', type: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      deviceType: 'box',
      pointIds: undefined,
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: DeviceBasicInfoItem) => {
      setEditingRecord(record);
      form.setFieldsValue({
        ...record,
        deviceType: record.deviceType ?? 'box',
        pointIds:
          record.pointIds && record.pointIds.length > 0
            ? record.pointIds[0]
            : undefined,
      });
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteDevice(id);
      message.success(t('pages.common.messages.deleteSuccess'));
      refresh();
      refreshStatus();
      refreshPointOptions();
    },
    [refresh, refreshPointOptions, refreshStatus, t],
  );

  const handleModalOk = useCallback(async () => {
    const values = (await form.validateFields()) as DeviceFormValues;
    const payload = buildDevicePayload(values);
    setSaving(true);
    try {
      if (editingRecord) {
        await updateDevice(editingRecord.id, payload);
        message.success(
          t('pages.deviceManagement.basicInfo.messages.updateSuccess'),
        );
      } else {
        await createDevice(payload);
        message.success(
          t('pages.deviceManagement.basicInfo.messages.createSuccess'),
        );
      }
      setModalVisible(false);
      refresh();
      refreshStatus();
      refreshPointOptions();
    } finally {
      setSaving(false);
    }
  }, [editingRecord, form, refresh, refreshPointOptions, refreshStatus, t]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<EnrichedDevice> = useMemo(
    () => [
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.id'),
        dataIndex: 'id',
        width: 150,
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.deviceName'),
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.deviceType'),
        dataIndex: 'deviceType',
        width: 220,
        render: (_: string, record) => {
          const label =
            getDeviceTypeLabel(record.deviceType) ??
            getDeviceTypeLabel(record.type) ??
            record.type;
          return (
            <div>
              <div>{label}</div>
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                {record.model}
              </div>
            </div>
          );
        },
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.serialNumber'),
        dataIndex: 'serialNumber',
        width: 200,
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.status'),
        dataIndex: 'realtimeStatus',
        width: 150,
        render: (value: DeviceStatusItem['realtimeStatus']) =>
          value ? (
            <Badge status={statusColor[value]} text={formatStatusText(value)} />
          ) : (
            '—'
          ),
      },
      {
        title: t(
          'pages.deviceManagement.basicInfo.table.columns.lastHeartbeat',
        ),
        dataIndex: 'lastHeartbeat',
        width: 200,
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.points'),
        dataIndex: 'points',
        width: 220,
        render: (points: DevicePointInfo[] | undefined) =>
          points && points.length ? (
            <Space size="small" wrap>
              {points.map((point) => (
                <Tag
                  key={point.id}
                  color={
                    point.pointType === 'checkpoint' ? 'processing' : 'success'
                  }
                >
                  {point.name}
                </Tag>
              ))}
            </Space>
          ) : (
            t('pages.deviceManagement.basicInfo.text.unbound')
          ),
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.remark'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: t('pages.deviceManagement.basicInfo.table.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t(
                'pages.deviceManagement.basicInfo.popconfirm.deleteTitle',
              )}
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
    [formatStatusText, getDeviceTypeLabel, handleDelete, handleEdit, t],
  );
  const metrics = statusData?.metrics ?? {
    onlineRate: 0,
    offlineDevices: 0,
    faultDevices: 0,
    lastSync: '--',
  };

  return (
    <PageContainer
      header={{ title: t('pages.deviceManagement.basicInfo.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.basicInfo.card.total')}
              value={summary.total}
              suffix={deviceUnitLabel}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.basicInfo.card.online')}
              value={summary.online}
              suffix={deviceUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.deviceManagement.basicInfo.card.offline')}
              value={metrics.offlineDevices}
              suffix={deviceUnitLabel}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.deviceManagement.basicInfo.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.deviceManagement.basicInfo.button.create')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', type: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t(
                'pages.deviceManagement.basicInfo.filter.keyword.placeholder',
              )}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{ width: 180 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.deviceManagement.basicInfo.filter.type.all'),
                },
                ...deviceTypeOptions,
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[
                {
                  value: 'all',
                  label: t(
                    'pages.deviceManagement.basicInfo.filter.status.all',
                  ),
                },
                ...deviceStatusOptions,
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
          </Form.Item>
        </Form>
        <Table<EnrichedDevice>
          rowKey="id"
          loading={loading || statusLoading}
          columns={columns}
          dataSource={filteredDevices}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1900 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.deviceManagement.basicInfo.modal.editTitle')
            : t('pages.deviceManagement.basicInfo.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        confirmLoading={saving}
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('pages.deviceManagement.basicInfo.form.labels.id')}
            name="id"
          >
            <Input
              placeholder={t('pages.common.form.placeholder.autoGenerate')}
              disabled={!!editingRecord}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.deviceManagement.basicInfo.form.labels.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.deviceManagement.basicInfo.form.validations.name',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.deviceManagement.basicInfo.form.placeholders.name',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.deviceManagement.basicInfo.form.labels.type')}
                name="deviceType"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.deviceManagement.basicInfo.form.validations.type',
                    ),
                  },
                ]}
              >
                <Select
                  options={deviceTypeOptions}
                  placeholder={t(
                    'pages.deviceManagement.basicInfo.form.placeholders.type',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t(
              'pages.deviceManagement.basicInfo.form.labels.serialNumber',
            )}
            name="serialNumber"
          >
            <Input
              placeholder={t(
                'pages.deviceManagement.basicInfo.form.placeholders.serialNumber',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.basicInfo.form.labels.points')}
            name="pointIds"
          >
            <Select
              allowClear
              placeholder={t(
                'pages.deviceManagement.basicInfo.form.placeholders.points',
              )}
              options={pointSelectOptions}
              loading={pointOptionsLoading}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.basicInfo.form.labels.remark')}
            name="remark"
          >
            <Input.TextArea
              placeholder={t(
                'pages.deviceManagement.basicInfo.form.placeholders.remark',
              )}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BasicInfo;
