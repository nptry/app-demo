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

const deviceTypeOptions: ChannelDeploymentItem['deviceType'][] = [
  '高清数字摄像机',
  'AI 边缘计算设备',
];

const DeviceDeployment: React.FC = () => {
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
      deviceType: '高清数字摄像机',
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

  const handleDelete = useCallback((id: string) => {
    setDevices((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setDevices((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id ? { ...item, ...values } : item,
        ),
      );
      message.success('部署信息已更新');
    } else {
      const newItem: ChannelDeploymentItem = {
        ...values,
        id: values.id?.trim() ? values.id : `PCD-${Date.now()}`,
        status: '正常运行',
      };
      setDevices((prev) => [newItem, ...prev]);
      message.success('新增部署成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<ChannelDeploymentItem> = useMemo(
    () => [
      { title: '通道', dataIndex: 'channelName', width: 200 },
      {
        title: '设备名称',
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
        title: '设备类型',
        dataIndex: 'deviceType',
        width: 180,
        render: (value: ChannelDeploymentItem['deviceType']) => (
          <Tag color="blue">{value}</Tag>
        ),
      },
      { title: '安装位置', dataIndex: 'position', width: 220 },
      { title: '安装高度 (m)', dataIndex: 'installHeight', width: 140 },
      { title: '镜头角度', dataIndex: 'lensAngle', width: 160 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      { title: '责任人', dataIndex: 'owner', width: 160 },
      { title: '捕获测试结果', dataIndex: 'testResult', width: 200 },
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
    <PageContainer header={{ title: '通道设备部署' }}>
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
              placeholder="搜索通道 / 设备 / 位置"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="deviceType">
            <Select
              style={{ width: 200 }}
              options={[
                { value: 'all', label: '全部设备类型' },
                ...deviceTypeOptions.map((type) => ({
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
                label="通道名称"
                name="channelName"
                rules={[{ required: true, message: '请输入通道名称' }]}
              >
                <Input placeholder="请输入通道名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备类型"
                name="deviceType"
                rules={[{ required: true, message: '请选择设备类型' }]}
              >
                <Select
                  options={deviceTypeOptions.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  placeholder="请选择设备类型"
                />
              </Form.Item>
            </Col>
          </Row>
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
            label="安装位置"
            name="position"
            rules={[{ required: true, message: '请输入安装位置' }]}
          >
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="安装高度 (m)" name="installHeight">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入安装高度"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="镜头角度" name="lensAngle">
                <Input placeholder="请输入镜头角度" />
              </Form.Item>
            </Col>
          </Row>
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
          <Form.Item label="捕获测试结果" name="testResult">
            <Input placeholder="请输入测试结果" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DeviceDeployment;
