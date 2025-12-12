import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
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
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DeploymentItem,
  KeyAreaDeploymentResponse,
} from '@/services/keyArea';
import { getKeyAreaDeployments } from '@/services/keyArea';
import type {
  TrafficDeploymentItem,
  TrafficDeploymentResponse,
} from '@/services/traffic';
import { getTrafficDeployments } from '@/services/traffic';

const trafficStatusColor: Record<
  TrafficDeploymentItem['status'],
  'success' | 'processing' | 'default'
> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
};

const keyAreaStatusColor: Record<
  DeploymentItem['status'],
  'success' | 'processing' | 'default'
> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
};

const trafficDeviceTypeOptions: TrafficDeploymentItem['deviceType'][] = [
  '高清数字摄像机',
  'AI 边缘计算设备',
];
const trafficStatusOptions: TrafficDeploymentItem['status'][] = [
  '正常运行',
  '待调试',
  '已拆除',
];

const keyAreaDeviceTypeOptions: DeploymentItem['deviceType'][] = [
  '高清数字摄像机',
  'AI 边缘计算设备',
];
const keyAreaStatusOptions: DeploymentItem['status'][] = [
  '正常运行',
  '待调试',
  '已拆除',
];

type TabKey = 'traffic' | 'key-area';

const TrafficDeploymentTab: React.FC = () => {
  const { data, loading } = useRequest(getTrafficDeployments, {
    formatResult: (
      res: TrafficDeploymentResponse | { data: TrafficDeploymentResponse },
    ) =>
      (res as { data?: TrafficDeploymentResponse })?.data ??
      (res as TrafficDeploymentResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [deployments, setDeployments] = useState<TrafficDeploymentItem[]>([]);
  const [filters, setFilters] = useState<{
    keyword: string;
    status: TrafficDeploymentItem['status'] | 'all';
    deviceType: TrafficDeploymentItem['deviceType'] | 'all';
  }>({
    keyword: '',
    status: 'all',
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
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
      const matchType =
        filters.deviceType === 'all' || item.deviceType === filters.deviceType;
      return matchKeyword && matchStatus && matchType;
    });
  }, [deployments, filters.deviceType, filters.keyword, filters.status]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as
          | TrafficDeploymentItem['status']
          | 'all',
        deviceType: (values.deviceType ?? 'all') as
          | TrafficDeploymentItem['deviceType']
          | 'all',
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', deviceType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: '正常运行',
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

  const handleDelete = useCallback((id: string) => {
    setDeployments((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setDeployments((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? values : item)),
      );
      message.success('部署信息已更新');
    } else {
      const newItem: TrafficDeploymentItem = {
        ...values,
        id: values.id?.trim() ? values.id : `TD-${Date.now()}`,
      };
      setDeployments((prev) => [newItem, ...prev]);
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
      { title: '镜头焦距', dataIndex: 'lensFocal', width: 140 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      { title: '责任人', dataIndex: 'owner', width: 160 },
      {
        title: '部署状态',
        dataIndex: 'status',
        width: 140,
        render: (value: TrafficDeploymentItem['status']) => (
          <Badge status={trafficStatusColor[value]} text={value} />
        ),
      },
      { title: '调试结果', dataIndex: 'result', width: 200 },
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
          initialValues={{ keyword: '', status: 'all', deviceType: 'all' }}
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
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部部署状态' },
                ...trafficStatusOptions.map((status) => ({
                  value: status,
                  label: status,
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
                label="卡口名称"
                name="checkpointName"
                rules={[{ required: true, message: '请输入卡口名称' }]}
              >
                <Input placeholder="请输入卡口名称" />
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
          <Form.Item label="镜头焦距" name="lensFocal">
            <Input placeholder="示例：12mm" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="部署时间"
                name="installDate"
                rules={[{ required: true, message: '请输入部署时间' }]}
              >
                <Input placeholder="示例：2024-08-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="部署状态"
                name="status"
                rules={[{ required: true, message: '请选择部署状态' }]}
              >
                <Select
                  options={trafficStatusOptions.map((status) => ({
                    label: status,
                    value: status,
                  }))}
                  placeholder="请选择部署状态"
                />
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
          <Form.Item label="调试结果" name="result">
            <Input placeholder="请输入调试结果或备注" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const KeyAreaDeploymentTab: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaDeployments, {
    formatResult: (
      res: KeyAreaDeploymentResponse | { data: KeyAreaDeploymentResponse },
    ) =>
      (res as { data?: KeyAreaDeploymentResponse })?.data ??
      (res as KeyAreaDeploymentResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [filters, setFilters] = useState<{
    keyword: string;
    status: DeploymentItem['status'] | 'all';
    deviceType: DeploymentItem['deviceType'] | 'all';
  }>({
    keyword: '',
    status: 'all',
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

  const filteredDeployments = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return deployments.filter((item) => {
      const matchKeyword = keyword
        ? [item.siteName, item.zoneCode, item.deviceName, item.deviceId]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
      const matchType =
        filters.deviceType === 'all' || item.deviceType === filters.deviceType;
      return matchKeyword && matchStatus && matchType;
    });
  }, [deployments, filters.deviceType, filters.keyword, filters.status]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as DeploymentItem['status'] | 'all',
        deviceType: (values.deviceType ?? 'all') as
          | DeploymentItem['deviceType']
          | 'all',
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', deviceType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: '正常运行',
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

  const handleDelete = useCallback((id: string) => {
    setDeployments((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setDeployments((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? values : item)),
      );
      message.success('部署信息已更新');
    } else {
      const newItem: DeploymentItem = {
        ...values,
        id: values.id?.trim() ? values.id : `DEP-${Date.now()}`,
        installHeight: values.installHeight ?? 0,
      };
      setDeployments((prev) => [newItem, ...prev]);
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
        title: '部署状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DeploymentItem['status']) => (
          <Badge status={keyAreaStatusColor[value]} text={value} />
        ),
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
          initialValues={{ keyword: '', status: 'all', deviceType: 'all' }}
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
                ...keyAreaDeviceTypeOptions.map((type) => ({
                  label: type,
                  value: type,
                })),
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[
                { value: 'all', label: '全部部署状态' },
                ...keyAreaStatusOptions.map((status) => ({
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
            name="siteName"
            rules={[{ required: true, message: '请输入所属场所' }]}
          >
            <Input placeholder="请输入场所名称" />
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
              options={keyAreaDeviceTypeOptions.map((type) => ({
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
          <Form.Item
            label="部署状态"
            name="status"
            rules={[{ required: true, message: '请选择部署状态' }]}
          >
            <Select
              options={keyAreaStatusOptions.map((status) => ({
                label: status,
                value: status,
              }))}
              placeholder="请选择部署状态"
            />
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
            key: 'key-area',
            label: '重点区域部署',
            children: <KeyAreaDeploymentTab />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default DeviceDeployment;
