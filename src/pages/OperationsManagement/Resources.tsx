import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
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
  Statistic,
  Table,
  Tag,
  message,
} from 'antd';
import type { ResourceItem, ResourceResponse } from '@/services/operations';
import { getResourceOverview } from '@/services/operations';

const statusTagColor = (status: string) => {
  if (status.includes('任务中') || status.includes('执行')) return 'red';
  if (status.includes('待命')) return 'blue';
  if (status.includes('可用') || status.includes('充足')) return 'green';
  if (status.includes('不足') || status.includes('休假') || status.includes('停用')) return 'orange';
  return 'default';
};

type FilterState = {
  keyword: string;
  resourceType: ResourceItem['resourceType'] | 'all';
  status: string | 'all';
};

const resourceTypeOptions: ResourceItem['resourceType'][] = ['运维车辆', '运维人员', '设备配件'];

const Resources: React.FC = () => {
  const { data, loading } = useRequest(getResourceOverview, {
    formatResult: (res: ResourceResponse | { data: ResourceResponse }) =>
      (res as { data?: ResourceResponse })?.data ?? (res as ResourceResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', resourceType: 'all', status: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ResourceItem | null>(null);
  const [form] = Form.useForm<ResourceItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.resources && !initialized) {
      setResources(data.resources);
      setInitialized(true);
    }
  }, [data?.resources, initialized]);

  const summary = useMemo(() => {
    if (resources.length) {
      return {
        vehicles: resources.filter((item) => item.resourceType === '运维车辆').length,
        engineers: resources.filter((item) => item.resourceType === '运维人员').length,
        spareParts: resources.filter((item) => item.resourceType === '设备配件').length,
      };
    }
    return (
      data?.summary ?? {
        vehicles: 0,
        engineers: 0,
        spareParts: 0,
      }
    );
  }, [data?.summary, resources]);

  const statusOptions = useMemo(() => {
    const source = resources.length ? resources : data?.resources ?? [];
    return Array.from(new Set(source.map((item) => item.status)));
  }, [data?.resources, resources]);

  const filteredResources = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return resources.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.department, item.contact, item.detail]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType = filters.resourceType === 'all' || item.resourceType === filters.resourceType;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      return matchKeyword && matchType && matchStatus;
    });
  }, [filters.keyword, filters.resourceType, filters.status, resources]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        resourceType: (values.resourceType ?? 'all') as FilterState['resourceType'],
        status: (values.status ?? 'all') as FilterState['status'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', resourceType: 'all', status: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      resourceType: '运维车辆',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: ResourceItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setResources((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setResources((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
      message.success('资源信息已更新');
    } else {
      const newItem: ResourceItem = {
        ...values,
        id: values.id?.trim() ? values.id : `RES-${Date.now()}`,
      };
      setResources((prev) => [newItem, ...prev]);
      message.success('新增资源成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<ResourceItem> = useMemo(
    () => [
      {
        title: '资源编号',
        dataIndex: 'id',
        width: 140,
      },
      {
        title: '资源类型',
        dataIndex: 'resourceType',
        width: 160,
        render: (value: ResourceItem['resourceType']) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '资源名称',
        dataIndex: 'name',
        width: 200,
        render: (value: string) => <strong>{value}</strong>,
      },
      { title: '所属部门', dataIndex: 'department', width: 200 },
      {
        title: '状态',
        dataIndex: 'status',
        width: 140,
        render: (value: string) => <Tag color={statusTagColor(value)}>{value}</Tag>,
      },
      {
        title: '联系人 / 电话',
        dataIndex: 'contact',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '资源详情', dataIndex: 'detail', width: 240 },
      { title: '最后调度时间', dataIndex: 'lastDispatch', width: 180 },
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
            <Popconfirm title="确认删除该资源？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '运维资源管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="运维车辆" value={summary.vehicles} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="在册工程师" value={summary.engineers} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="核心备件" value={summary.spareParts} suffix="件" />
          </Card>
        </Col>
      </Row>

      <Card
        title="资源清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新增资源
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', resourceType: 'all', status: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索名称 / 部门 / 联系人" style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="resourceType">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部资源类型' }, ...resourceTypeOptions.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部状态' }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<ResourceItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredResources}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑资源' : '新增资源'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="资源编号" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="资源编号" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="资源类型" name="resourceType" rules={[{ required: true, message: '请选择资源类型' }]}>
                <Select options={resourceTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择资源类型" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="资源名称" name="name" rules={[{ required: true, message: '请输入资源名称' }]}>
                <Input placeholder="请输入资源名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所属部门" name="department" rules={[{ required: true, message: '请输入部门' }]}>
                <Input placeholder="请输入所属部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="status" rules={[{ required: true, message: '请输入状态' }]}>
                <Input placeholder="例如：可用 / 待命 / 任务中" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系人" name="contact" rules={[{ required: true, message: '请输入联系人' }]}>
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="资源详情" name="detail" rules={[{ required: true, message: '请输入资源详情' }]}>
            <Input placeholder="请输入资源详情" />
          </Form.Item>
          <Form.Item label="最后调度时间" name="lastDispatch">
            <Input placeholder="示例：2024-07-01 12:00" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Resources;
