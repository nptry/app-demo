import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DeviceBasicInfoItem,
  DeviceBasicInfoResponse,
  DevicePointInfo,
  DeviceStatusItem,
  DeviceStatusResponse,
} from '@/services/device';
import {
  createDevice,
  deleteDevice,
  getDeviceBasicInfo,
  getDeviceStatus,
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

const deviceTypeOptions = [{ label: '智能盒子', value: 'box' }];
const deviceTypeLabel: Record<string, string> = {
  box: '智能盒子',
};
const deviceStatusOptions: DeviceBasicInfoItem['status'][] = [
  '在线',
  '离线',
  '故障',
  '维护中',
];
const statusToApiMap: Record<
  DeviceBasicInfoItem['status'],
  'online' | 'offline' | 'fault' | 'maintenance'
> = {
  在线: 'online',
  离线: 'offline',
  故障: 'fault',
  维护中: 'maintenance',
};
const mapStatusToApi = (
  status: DeviceBasicInfoItem['status'],
): 'online' | 'offline' | 'fault' | 'maintenance' =>
  statusToApiMap[status] ?? 'offline';

type EnrichedDevice = DeviceBasicInfoItem & {
  realtimeStatus?: DeviceStatusItem['realtimeStatus'];
  lastHeartbeat?: string;
  exception?: string;
};

const BasicInfo: React.FC = () => {
  const { data, loading, refresh } = useRequest(getDeviceBasicInfo, {
    formatResult: (
      res: DeviceBasicInfoResponse | { data: DeviceBasicInfoResponse },
    ) =>
      (res as { data?: DeviceBasicInfoResponse })?.data ??
      (res as DeviceBasicInfoResponse),
  });
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
        const baseLabel = point.pointType === 'checkpoint' ? '卡口' : '场所';
        const suffix = point.deviceName ? ` · 已绑定：${point.deviceName}` : '';
        return {
          label: `${point.name}（${baseLabel}${suffix}）`,
          value: point.id,
        };
      }),
    [pointOptions],
  );

  const devices = data?.devices ?? [];
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
      message.success('删除成功');
      refresh();
      refreshStatus();
      refreshPointOptions();
    },
    [refresh, refreshPointOptions, refreshStatus],
  );

  const handleModalOk = useCallback(async () => {
    const values = (await form.validateFields()) as DeviceFormValues;
    const payload = buildDevicePayload(values);
    setSaving(true);
    try {
      if (editingRecord) {
        await updateDevice(editingRecord.id, payload);
        message.success('设备信息已更新');
      } else {
        await createDevice(payload);
        message.success('新建设备成功');
      }
      setModalVisible(false);
      refresh();
      refreshStatus();
      refreshPointOptions();
    } finally {
      setSaving(false);
    }
  }, [editingRecord, form, refresh, refreshPointOptions, refreshStatus]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<EnrichedDevice> = useMemo(
    () => [
      { title: '设备 ID', dataIndex: 'id', width: 150 },
      {
        title: '设备名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '设备类型 / 型号',
        dataIndex: 'deviceType',
        width: 220,
        render: (_: string, record) => {
          const label =
            (record.deviceType && deviceTypeLabel[record.deviceType]) ||
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
      { title: '设备序列号', dataIndex: 'serialNumber', width: 200 },
      {
        title: '设备状态',
        dataIndex: 'realtimeStatus',
        width: 150,
        render: (value: DeviceStatusItem['realtimeStatus']) =>
          value ? <Badge status={statusColor[value]} text={value} /> : '—',
      },
      { title: '最后心跳时间', dataIndex: 'lastHeartbeat', width: 200 },
      {
        title: '关联点位',
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
            '未关联'
          ),
      },
      { title: '备注', dataIndex: 'remark', width: 200 },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认删除该设备？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit],
  );
  const metrics = statusData?.metrics ?? {
    onlineRate: 0,
    offlineDevices: 0,
    faultDevices: 0,
    lastSync: '--',
  };

  return (
    <PageContainer header={{ title: '设备管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在册设备" value={summary.total} suffix="台" />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在线设备" value={summary.online} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="离线设备"
              value={metrics.offlineDevices}
              suffix="台"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="设备清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建设备
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
              placeholder="搜索名称 / 厂商 / 序列号"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部类型' },
                ...deviceTypeOptions,
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部状态' },
                ...deviceStatusOptions.map((status) => ({
                  label: status,
                  value: status,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
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
        title={editingRecord ? '编辑设备' : '新建设备'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        confirmLoading={saving}
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="设备 ID" name="id">
            <Input placeholder="不填写则自动生成" disabled={!!editingRecord} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="设备名称"
                name="name"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备类型"
                name="deviceType"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select
                  options={deviceTypeOptions}
                  placeholder="请选择设备类型"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="设备序列号" name="serialNumber">
            <Input placeholder="请输入设备序列号" />
          </Form.Item>
          <Form.Item label="关联点位" name="pointIds">
            <Select
              allowClear
              placeholder="请选择需要绑定的点位"
              options={pointSelectOptions}
              loading={pointOptionsLoading}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="可填写安装说明、维护记录等" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BasicInfo;
