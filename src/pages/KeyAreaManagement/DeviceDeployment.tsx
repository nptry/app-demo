import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { DeploymentItem, KeyAreaDeploymentResponse } from '@/services/keyArea';
import { getKeyAreaDeployments } from '@/services/keyArea';

const statusColor: Record<DeploymentItem['status'], 'success' | 'processing' | 'default'> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
};

type FilterState = {
  keyword: string;
  status: DeploymentItem['status'] | 'all';
  deviceType: DeploymentItem['deviceType'] | 'all';
};

const deviceTypeOptions: DeploymentItem['deviceType'][] = ['高清数字摄像机', 'AI 边缘计算设备', '4G 无线网关'];
const deploymentStatusOptions: DeploymentItem['status'][] = ['正常运行', '待调试', '已拆除'];

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaDeployments, {
    formatResult: (res: KeyAreaDeploymentResponse | { data: KeyAreaDeploymentResponse }) =>
      (res as { data?: KeyAreaDeploymentResponse })?.data ?? (res as KeyAreaDeploymentResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', deviceType: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeploymentItem | null>(null);
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
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchType = filters.deviceType === 'all' || item.deviceType === filters.deviceType;
      return matchKeyword && matchStatus && matchType;
    });
  }, [deployments, filters.deviceType, filters.keyword, filters.status]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        deviceType: (values.deviceType ?? 'all') as FilterState['deviceType'],
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
      setDeployments((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
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
        render: (value: DeploymentItem['deviceType']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '设备名称 / 编号',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.deviceId}</div>
          </div>
        ),
      },
      { title: '安装位置', dataIndex: 'position', width: 220 },
      { title: '安装高度（m）', dataIndex: 'installHeight', width: 150 },
      { title: '部署时间', dataIndex: 'installDate', width: 160 },
      {
        title: '责任人',
        dataIndex: 'owner',
        width: 140,
      },
      {
        title: '部署状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DeploymentItem['status']) => <Badge status={statusColor[value]} text={value} />,
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
            <Popconfirm title="确认删除该部署？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '设备部署管理' }}>
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
            <Input allowClear placeholder="搜索场所 / 设备 / 区域" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="deviceType">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部设备类型' }, ...deviceTypeOptions.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部部署状态' }, ...deploymentStatusOptions.map((status) => ({ label: status, value: status }))]}
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
          <Form.Item label="所属场所" name="siteName" rules={[{ required: true, message: '请输入所属场所' }]}>
            <Input placeholder="请输入场所名称" />
          </Form.Item>
          <Form.Item label="监测区域编号" name="zoneCode" rules={[{ required: true, message: '请输入监测区域编号' }]}>
            <Input placeholder="请输入监测区域编号" />
          </Form.Item>
          <Form.Item label="区域面积（㎡）" name="zoneArea" rules={[{ required: true, message: '请输入面积' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入区域面积" />
          </Form.Item>
          <Form.Item label="设备类型" name="deviceType" rules={[{ required: true, message: '请选择设备类型' }]}>
            <Select options={deviceTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择设备类型" />
          </Form.Item>
          <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: '请输入设备名称' }]}>
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item label="设备编号" name="deviceId" rules={[{ required: true, message: '请输入设备编号' }]}>
            <Input placeholder="请输入设备编号" />
          </Form.Item>
          <Form.Item label="安装位置" name="position" rules={[{ required: true, message: '请输入安装位置' }]}>
            <Input placeholder="请输入安装位置" />
          </Form.Item>
          <Form.Item label="安装高度（m）" name="installHeight">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入安装高度" />
          </Form.Item>
          <Form.Item label="部署时间" name="installDate" rules={[{ required: true, message: '请输入部署时间' }]}>
            <Input placeholder="示例：2024-08-01" />
          </Form.Item>
          <Form.Item label="责任人" name="owner" rules={[{ required: true, message: '请输入责任人' }]}>
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item label="部署状态" name="status" rules={[{ required: true, message: '请选择部署状态' }]}>
            <Select options={deploymentStatusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择部署状态" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DeviceDeployment;
