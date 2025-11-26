import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { TrafficDeploymentItem, TrafficDeploymentResponse } from '@/services/traffic';
import { getTrafficDeployments } from '@/services/traffic';

const statusColor: Record<TrafficDeploymentItem['status'], 'success' | 'processing' | 'default'> = {
  正常运行: 'success',
  待调试: 'processing',
  已拆除: 'default',
};

type FilterState = {
  keyword: string;
  status: TrafficDeploymentItem['status'] | 'all';
  deviceType: TrafficDeploymentItem['deviceType'] | 'all';
};

const deviceTypeOptions: TrafficDeploymentItem['deviceType'][] = ['高清数字摄像机', 'AI 边缘计算设备'];
const statusOptions: TrafficDeploymentItem['status'][] = ['正常运行', '待调试', '已拆除'];

const DeviceDeployment: React.FC = () => {
  const { data, loading } = useRequest(getTrafficDeployments, {
    formatResult: (res: TrafficDeploymentResponse | { data: TrafficDeploymentResponse }) =>
      (res as { data?: TrafficDeploymentResponse })?.data ?? (res as TrafficDeploymentResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [deployments, setDeployments] = useState<TrafficDeploymentItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', deviceType: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrafficDeploymentItem | null>(null);
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
        ? [item.checkpointName, item.deviceName, item.deviceId, item.position, item.lane]
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
      setDeployments((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
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
        render: (value: TrafficDeploymentItem['deviceType']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '设备名称 / 编号',
        dataIndex: 'deviceName',
        width: 240,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.deviceId}</div>
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
        render: (value: TrafficDeploymentItem['status']) => <Badge status={statusColor[value]} text={value} />,
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
    <PageContainer header={{ title: '卡口设备部署' }}>
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
            <Input allowClear placeholder="搜索卡口 / 设备 / 车道" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="deviceType">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部设备类型' }, ...deviceTypeOptions.map((type) => ({ value: type, label: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部部署状态' }, ...statusOptions.map((status) => ({ value: status, label: status }))]}
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
              <Form.Item label="卡口名称" name="checkpointName" rules={[{ required: true, message: '请输入卡口名称' }]}>
                <Input placeholder="请输入卡口名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="安装车道" name="lane" rules={[{ required: true, message: '请输入安装车道' }]}>
                <Input placeholder="请输入安装车道" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="设备类型" name="deviceType" rules={[{ required: true, message: '请选择设备类型' }]}>
            <Select options={deviceTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择设备类型" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: '请输入设备名称' }]}>
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设备编号" name="deviceId" rules={[{ required: true, message: '请输入设备编号' }]}>
                <Input placeholder="请输入设备编号" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="安装位置描述" name="position" rules={[{ required: true, message: '请输入安装位置' }]}>
            <Input placeholder="请输入安装位置描述" />
          </Form.Item>
          <Form.Item label="镜头焦距" name="lensFocal">
            <Input placeholder="示例：12mm" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="部署时间" name="installDate" rules={[{ required: true, message: '请输入部署时间' }]}>
                <Input placeholder="示例：2024-08-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="部署状态" name="status" rules={[{ required: true, message: '请选择部署状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择部署状态" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="责任人" name="owner" rules={[{ required: true, message: '请输入责任人' }]}>
            <Input placeholder="请输入责任人" />
          </Form.Item>
          <Form.Item label="调试结果" name="result">
            <Input placeholder="请输入调试结果或备注" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default DeviceDeployment;
