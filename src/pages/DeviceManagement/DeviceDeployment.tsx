import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
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
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DeploymentItem,
  KeyAreaDeploymentResponse,
  KeyAreaSiteResponse,
} from '@/services/keyArea';
import {
  createSiteDeployment,
  deleteSiteDeployment,
  getSiteDeployments,
  getSites,
  updateSiteDeployment,
} from '@/services/keyArea';
import type {
  TrafficCheckpointResponse,
  TrafficDeploymentItem,
  TrafficDeploymentResponse,
} from '@/services/traffic';
import {
  createTrafficDeployment,
  deleteTrafficDeployment,
  getTrafficCheckpoints,
  getTrafficDeployments,
  updateTrafficDeployment,
} from '@/services/traffic';

const trafficDeviceTypeOptions: TrafficDeploymentItem['deviceType'][] = [
  '高清数字摄像机',
  'AI 边缘计算设备',
];

const siteDeviceTypeOptions: DeploymentItem['deviceType'][] = [
  '高清数字摄像机',
  'AI 边缘计算设备',
];

type TabKey = 'traffic' | 'site';

const TrafficDeploymentTab: React.FC = () => {
  const { data, loading } = useRequest(getTrafficDeployments, {
    formatResult: (
      res: TrafficDeploymentResponse | { data: TrafficDeploymentResponse },
    ) =>
      (res as { data?: TrafficDeploymentResponse })?.data ??
      (res as TrafficDeploymentResponse),
  });

  const { data: checkpointData } = useRequest(getTrafficCheckpoints, {
    formatResult: (
      res: TrafficCheckpointResponse | { data: TrafficCheckpointResponse },
    ) =>
      (res as { data?: TrafficCheckpointResponse })?.data ??
      (res as TrafficCheckpointResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [deployments, setDeployments] = useState<TrafficDeploymentItem[]>([]);
  const [filters, setFilters] = useState<{
    keyword: string;
    deviceType: TrafficDeploymentItem['deviceType'] | 'all';
  }>({
    keyword: '',
    deviceType: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<TrafficDeploymentItem | null>(null);
  const [form] = Form.useForm<TrafficDeploymentItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.deployments && !initialized) {
      setDeployments(data.deployments);
      setInitialized(true);
    }
  }, [data?.deployments, initialized]);

  const checkpointOptions = useMemo(
    () => checkpointData?.checkpoints ?? [],
    [checkpointData?.checkpoints],
  );

  const filteredDeployments = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return deployments.filter((item) => {
      const matchKeyword = keyword
        ? [
            item.checkpointName,
            item.deviceName,
            item.deviceId,
            item.position,
            item.lane,
          ]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType =
        filters.deviceType === 'all' || item.deviceType === filters.deviceType;
      return matchKeyword && matchType;
    });
  }, [deployments, filters.deviceType, filters.keyword]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        deviceType: (values.deviceType ?? 'all') as
          | TrafficDeploymentItem['deviceType']
          | 'all',
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
      deviceType: '高清数字摄像机',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: TrafficDeploymentItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(async (id: string) => {
    await deleteTrafficDeployment(id);
    setDeployments((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      const res = await updateTrafficDeployment(editingRecord.id, values);
      setDeployments((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? res.data : item)),
      );
      message.success('部署信息已更新');
    } else {
      const res = await createTrafficDeployment(values);
      setDeployments((prev) => [res.data, ...prev]);
      message.success('新增部署成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<TrafficDeploymentItem> = useMemo(
    () => [
      { title: '部署 ID', dataIndex: 'id', width: 140 },
      { title: '卡口名称', dataIndex: 'checkpointName', width: 200 },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 180,
        render: (value: TrafficDeploymentItem['deviceType']) => (
          <Tag color="blue">{value}</Tag>
        ),
      },
      {
        title: '设备名称 / 编号',
        dataIndex: 'deviceName',
        width: 240,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.deviceId}
            </div>
          </div>
        ),
      },
      { title: '安装车道', dataIndex: 'lane', width: 200 },
      { title: '安装位置描述', dataIndex: 'position', width: 220 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      { title: '责任人', dataIndex: 'owner', width: 160 },
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
              title="确认删除该部署？"
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

  return (
    <>
      <Card
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新增部署
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
              placeholder="搜索卡口 / 设备 / 车道"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="deviceType">
            <Select
              style={{ width: 200 }}
              options={[
                { value: 'all', label: '全部设备类型' },
                ...trafficDeviceTypeOptions.map((type) => ({
                  value: type,
                  label: type,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<TrafficDeploymentItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredDeployments}
          pagination={{ pageSize: 7, showSizeChanger: false }}
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑部署' : '新增部署'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={760}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="部署 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="部署 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属卡口"
                name="checkpointId"
                rules={[{ required: true, message: '请选择卡口' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={checkpointOptions.map((checkpoint) => ({
                    label: checkpoint.name,
                    value: checkpoint.id,
                  }))}
                  placeholder="请选择卡口"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="安装车道"
                name="lane"
                rules={[{ required: true, message: '请输入安装车道' }]}
              >
                <Input placeholder="请输入安装车道" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select
              options={trafficDeviceTypeOptions.map((type) => ({
                label: type,
                value: type,
              }))}
              placeholder="请选择设备类型"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="设备名称"
                name="deviceName"
                rules={[{ required: true, message: '请输入设备名称' }]}
              >
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备编号"
                name="deviceId"
                rules={[{ required: true, message: '请输入设备编号' }]}
              >
                <Input placeholder="请输入设备编号" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="安装位置描述"
            name="position"
            rules={[{ required: true, message: '请输入安装位置' }]}
          >
            <Input placeholder="请输入安装位置描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="部署时间"
                name="installDate"
                rules={[{ required: true, message: '请输入部署时间' }]}
              >
                <Input placeholder="示例：2024-08-01" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="责任人"
            name="owner"
            rules={[{ required: true, message: '请输入责任人' }]}
          >
            <Input placeholder="请输入责任人" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const SiteDeploymentTab: React.FC = () => {
  const { data, loading } = useRequest(getSiteDeployments, {
    formatResult: (
      res: KeyAreaDeploymentResponse | { data: KeyAreaDeploymentResponse },
    ) =>
      (res as { data?: KeyAreaDeploymentResponse })?.data ??
      (res as KeyAreaDeploymentResponse),
  });

  const { data: siteData } = useRequest(getSites, {
    formatResult: (res: KeyAreaSiteResponse | { data: KeyAreaSiteResponse }) =>
      (res as { data?: KeyAreaSiteResponse })?.data ??
      (res as KeyAreaSiteResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [filters, setFilters] = useState<{
    keyword: string;
    deviceType: DeploymentItem['deviceType'] | 'all';
  }>({
    keyword: '',
    deviceType: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeploymentItem | null>(
    null,
  );
  const [form] = Form.useForm<DeploymentItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.deployments && !initialized) {
      setDeployments(data.deployments);
      setInitialized(true);
    }
  }, [data?.deployments, initialized]);

  const siteOptions = useMemo(() => siteData?.sites ?? [], [siteData?.sites]);

  const filteredDeployments = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return deployments.filter((item) => {
      const matchKeyword = keyword
        ? [item.siteName, item.zoneCode, item.deviceName, item.deviceId]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType =
        filters.deviceType === 'all' || item.deviceType === filters.deviceType;
      return matchKeyword && matchType;
    });
  }, [deployments, filters.deviceType, filters.keyword]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        deviceType: (values.deviceType ?? 'all') as
          | DeploymentItem['deviceType']
          | 'all',
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
      deviceType: '高清数字摄像机',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: DeploymentItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(async (id: string) => {
    await deleteSiteDeployment(id);
    setDeployments((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      const res = await updateSiteDeployment(editingRecord.id, values);
      setDeployments((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? res.data : item)),
      );
      message.success('部署信息已更新');
    } else {
      const res = await createSiteDeployment(values);
      setDeployments((prev) => [res.data, ...prev]);
      message.success('新增部署成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<DeploymentItem> = useMemo(
    () => [
      { title: '部署 ID', dataIndex: 'id', width: 140 },
      { title: '所属场所', dataIndex: 'siteName', width: 200 },
      { title: '监测区域编号', dataIndex: 'zoneCode', width: 180 },
      { title: '区域面积（㎡）', dataIndex: 'zoneArea', width: 150 },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 160,
        render: (value: DeploymentItem['deviceType']) => (
          <Tag color="blue">{value}</Tag>
        ),
      },
      {
        title: '设备名称 / 编号',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.deviceId}
            </div>
          </div>
        ),
      },
      { title: '安装位置', dataIndex: 'position', width: 220 },
      { title: '安装高度（m）', dataIndex: 'installHeight', width: 150 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      { title: '责任人', dataIndex: 'owner', width: 140 },
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
              title="确认删除该部署？"
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

  return (
    <>
      <Card
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新增部署
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
              placeholder="搜索场所 / 设备 / 区域"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="deviceType">
            <Select
              style={{ width: 200 }}
              options={[
                { value: 'all', label: '全部设备类型' },
                ...siteDeviceTypeOptions.map((type) => ({
                  label: type,
                  value: type,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<DeploymentItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredDeployments}
          pagination={{ pageSize: 7, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑部署' : '新增部署'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="部署 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="部署 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Form.Item
            label="所属场所"
            name="siteId"
            rules={[{ required: true, message: '请选择所属场所' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={siteOptions.map((site) => ({
                label: site.name,
                value: site.id,
              }))}
              placeholder="请选择场所"
            />
          </Form.Item>
          <Form.Item
            label="监测区域编号"
            name="zoneCode"
            rules={[{ required: true, message: '请输入监测区域编号' }]}
          >
            <Input placeholder="请输入监测区域编号" />
          </Form.Item>
          <Form.Item
            label="区域面积（㎡）"
            name="zoneArea"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入区域面积"
            />
          </Form.Item>
          <Form.Item
            label="设备类型"
            name="deviceType"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select
              options={siteDeviceTypeOptions.map((type) => ({
                label: type,
                value: type,
              }))}
              placeholder="请选择设备类型"
            />
          </Form.Item>
          <Form.Item
            label="设备名称"
            name="deviceName"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item
            label="设备编号"
            name="deviceId"
            rules={[{ required: true, message: '请输入设备编号' }]}
          >
            <Input placeholder="请输入设备编号" />
          </Form.Item>
          <Form.Item
            label="安装位置"
            name="position"
            rules={[{ required: true, message: '请输入安装位置' }]}
          >
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Form.Item label="安装高度（m）" name="installHeight">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入安装高度"
            />
          </Form.Item>
          <Form.Item
            label="部署时间"
            name="installDate"
            rules={[{ required: true, message: '请输入部署时间' }]}
          >
            <Input placeholder="示例：2024-08-01" />
          </Form.Item>
          <Form.Item
            label="责任人"
            name="owner"
            rules={[{ required: true, message: '请输入责任人' }]}
          >
            <Input placeholder="请输入责任人" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const DeviceDeployment: React.FC = () => {
  const [activeKey, setActiveKey] = useState<TabKey>('traffic');

  return (
    <PageContainer header={{ title: '设备部署' }}>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as TabKey)}
        destroyInactiveTabPane={false}
        items={[
          {
            key: 'traffic',
            label: '卡口设备部署',
            children: <TrafficDeploymentTab />,
          },
          {
            key: 'site',
            label: '重点区域部署',
            children: <SiteDeploymentTab />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default DeviceDeployment;
