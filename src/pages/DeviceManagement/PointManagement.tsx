import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
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
import {
  type DeviceBasicInfoResponse,
  getDeviceBasicInfo,
} from '@/services/device';
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

type TabKey = 'checkpoint' | 'site';
type DeviceOption = { label: string; value: string };

const deploymentStatusOptions = ['正常运行', '待调试', '已拆除'];
const deviceTypeOptions = ['高清数字摄像机', 'AI 边缘计算设备'];

const useDeviceOptions = (): DeviceOption[] => {
  const { data } = useRequest(getDeviceBasicInfo, {
    formatResult: (
      res: DeviceBasicInfoResponse | { data: DeviceBasicInfoResponse },
    ) =>
      (res as { data?: DeviceBasicInfoResponse })?.data ??
      (res as DeviceBasicInfoResponse),
  });

  return useMemo(() => {
    return (
      data?.devices?.map((device) => ({
        label: `${device.name} (${device.id})`,
        value: device.id,
      })) ?? []
    );
  }, [data?.devices]);
};

const CheckpointTab: React.FC = () => {
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
      message.success('删除成功');
      refresh();
    },
    [refresh],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const payload = { ...values };
    if (editingRecord) {
      await updateCheckpointPoint(editingRecord.id, payload);
      message.success('卡口点位信息已更新');
    } else {
      await createCheckpointPoint(payload);
      message.success('新建卡口点位成功');
    }
    setModalVisible(false);
    refresh();
  }, [editingRecord, form, refresh]);

  const columns: ColumnsType<CheckpointPoint> = useMemo(
    () => [
      { title: '点位 ID', dataIndex: 'id', width: 140 },
      {
        title: '点位名称',
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
      { title: '所属区域', dataIndex: 'region', width: 200 },
      {
        title: '关联设备',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) =>
          value ? `${value} (${record.deviceId})` : '未关联',
      },
      {
        title: '位置',
        dataIndex: 'positionDescription',
        width: 220,
      },
      { title: '车道编号', dataIndex: 'laneName', width: 140 },
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
              title="确认删除该点位？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit],
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic title="卡口点位总数" value={summary.total} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic title="覆盖车道" value={summary.laneCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        title="卡口点位"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建卡口点位
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
              placeholder="搜索点位 / 区域 / 地址"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              allowClear={false}
              style={{ width: 200 }}
              options={[
                { label: '全部类型', value: 'all' },
                ...typeOptions.map((item) => ({ label: item, value: item })),
              ]}
              placeholder="卡口类型"
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
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
        title={editingRecord ? '编辑卡口点位' : '新建卡口点位'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="点位 ID" name="id">
            <Input placeholder="不填写则自动生成" disabled={!!editingRecord} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="点位名称"
                name="name"
                rules={[{ required: true, message: '请输入点位名称' }]}
              >
                <Input placeholder="请输入点位名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="所属区域"
                name="region"
                rules={[{ required: true, message: '请输入所属区域' }]}
              >
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="车道编号" name="laneName">
            <Input placeholder="请输入车道编号" />
          </Form.Item>
          <Form.Item label="位置" name="positionDescription">
            <Input placeholder="请输入点位位置" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const SiteTab: React.FC<{ deviceOptions: DeviceOption[] }> = ({
  deviceOptions,
}) => {
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
      message.success('删除成功');
      refresh();
    },
    [refresh],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const payload = { ...values };
    if (editingRecord) {
      await updateSitePoint(editingRecord.id, payload);
      message.success('场所点位信息已更新');
    } else {
      await createSitePoint(payload);
      message.success('新建场所点位成功');
    }
    setModalVisible(false);
    refresh();
  }, [editingRecord, form, refresh]);

  const columns: ColumnsType<SitePoint> = useMemo(
    () => [
      { title: '点位 ID', dataIndex: 'id', width: 140 },
      {
        title: '点位名称',
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
      { title: '所属区域', dataIndex: 'region', width: 200 },
      {
        title: '关联设备',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) =>
          value ? `${value} (${record.deviceId})` : '未关联',
      },
      {
        title: '位置',
        dataIndex: 'positionDescription',
        width: 220,
      },
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
              title="确认删除该点位？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit],
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic
              title="场所点位总数"
              value={summary.totalSites}
              suffix="处"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false}>
            <Statistic
              title="覆盖总面积"
              value={summary.totalAreaSqm}
              suffix="㎡"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="场所点位"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建场所点位
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
              placeholder="搜索场所 / 区域 / 地址"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
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
        title={editingRecord ? '编辑场所点位' : '新建场所点位'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        destroyOnClose
        width={780}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="点位 ID" name="id">
            <Input placeholder="不填写则自动生成" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item
            label="点位名称"
            name="name"
            rules={[{ required: true, message: '请输入点位名称' }]}
          >
            <Input placeholder="请输入点位名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属区域"
                name="region"
                rules={[{ required: true, message: '请输入所属区域' }]}
              >
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="面积（㎡）" name="areaSize">
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="请输入场所面积"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="关联设备" name="deviceId">
            <Select
              options={deviceOptions}
              placeholder="请选择关联设备"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item label="位置" name="positionDescription">
            <Input placeholder="请输入点位位置" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const PointManagement: React.FC = () => {
  const deviceOptions = useDeviceOptions();
  const [activeKey, setActiveKey] = useState<TabKey>('checkpoint');

  return (
    <PageContainer header={{ title: '点位管理' }}>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as TabKey)}
        destroyInactiveTabPane={false}
        items={[
          {
            key: 'checkpoint',
            label: '卡口点位',
            children: <CheckpointTab />,
          },
          {
            key: 'site',
            label: '场所点位',
            children: <SiteTab deviceOptions={deviceOptions} />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default PointManagement;
