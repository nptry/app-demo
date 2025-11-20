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
  Statistic,
  Table,
  Tag,
  message,
} from 'antd';
import type { FaultOrderItem, FaultResponse } from '@/services/operations';
import { getFaultOverview } from '@/services/operations';

const levelColor: Record<FaultOrderItem['level'], string> = {
  '紧急（1 小时）': 'red',
  '重要（4 小时）': 'orange',
  '一般（24 小时）': 'blue',
};

const statusMap: Record<
  FaultOrderItem['status'],
  { status: 'processing' | 'warning' | 'success' | 'default' | 'error'; text: string }
> = {
  待派单: { status: 'default', text: '待派单' },
  待处理: { status: 'warning', text: '待处理' },
  处理中: { status: 'processing', text: '处理中' },
  已解决: { status: 'success', text: '已解决' },
  '无法解决（需升级）': { status: 'error', text: '需升级' },
};

type FilterState = {
  keyword: string;
  status: FaultOrderItem['status'] | 'all';
  level: FaultOrderItem['level'] | 'all';
};

const levelOptions: FaultOrderItem['level'][] = ['紧急（1 小时）', '重要（4 小时）', '一般（24 小时）'];
const statusOptions: FaultOrderItem['status'][] = ['待派单', '待处理', '处理中', '已解决', '无法解决（需升级）'];

const Fault: React.FC = () => {
  const { data, loading } = useRequest(getFaultOverview, {
    formatResult: (res: FaultResponse | { data: FaultResponse }) =>
      (res as { data?: FaultResponse })?.data ?? (res as FaultResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [orders, setOrders] = useState<FaultOrderItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', level: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FaultOrderItem | null>(null);
  const [form] = Form.useForm<FaultOrderItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.orders && !initialized) {
      setOrders(data.orders);
      setInitialized(true);
    }
  }, [data?.orders, initialized]);

  const stats = useMemo(() => {
    if (orders.length) {
      return {
        todayFaults: orders.length,
        inProgress: orders.filter((item) => item.status === '处理中').length,
        waiting: orders.filter((item) => item.status === '待派单' || item.status === '待处理').length,
      };
    }
    return (
      data?.stats ?? {
        todayFaults: 0,
        inProgress: 0,
        waiting: 0,
      }
    );
  }, [data?.stats, orders]);

  const filteredOrders = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return orders.filter((item) => {
      const matchKeyword = keyword
        ? [item.deviceName, item.faultType, item.owner]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchLevel = filters.level === 'all' || item.level === filters.level;
      return matchKeyword && matchStatus && matchLevel;
    });
  }, [filters.keyword, filters.level, filters.status, orders]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        level: (values.level ?? 'all') as FilterState['level'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', level: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      level: '一般（24 小时）',
      status: '待派单',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: FaultOrderItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setOrders((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setOrders((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
      message.success('工单已更新');
    } else {
      const newItem: FaultOrderItem = {
        ...values,
        id: values.id?.trim() ? values.id : `FAULT-${Date.now()}`,
      };
      setOrders((prev) => [newItem, ...prev]);
      message.success('已创建新的故障工单');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<FaultOrderItem> = useMemo(
    () => [
      { title: '工单 ID', dataIndex: 'id', width: 180 },
      {
        title: '关联设备',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>ID：{record.deviceId}</div>
          </div>
        ),
      },
      { title: '故障类型', dataIndex: 'faultType', width: 160 },
      { title: '故障描述', dataIndex: 'description', width: 260 },
      {
        title: '等级',
        dataIndex: 'level',
        width: 160,
        render: (value: FaultOrderItem['level']) => <Tag color={levelColor[value]}>{value}</Tag>,
      },
      {
        title: '处理状态',
        dataIndex: 'status',
        width: 140,
        render: (value: FaultOrderItem['status']) => {
          const map = statusMap[value];
          return map ? <Badge status={map.status} text={map.text} /> : value;
        },
      },
      { title: '派单时间', dataIndex: 'dispatchTime', width: 180 },
      { title: '运维负责人', dataIndex: 'owner', width: 140 },
      { title: '处理方案', dataIndex: 'solution', width: 260 },
      { title: '完成时间', dataIndex: 'finishTime', width: 180 },
      { title: '处理结果', dataIndex: 'result', width: 160 },
      { title: '备注', dataIndex: 'remark' },
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
            <Popconfirm title="确认删除该工单？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '故障管理（故障工单）' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="今日故障" value={stats.todayFaults} suffix="起" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="处理中工单" value={stats.inProgress} suffix="单" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="待派单/待处理" value={stats.waiting} suffix="单" />
          </Card>
        </Col>
      </Row>

      <Card
        title="故障工单列表"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建工单
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', level: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索设备 / 故障类型 / 负责人" style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="level">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部等级' }, ...levelOptions.map((level) => ({ label: level, value: level }))]}
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
        <Table<FaultOrderItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑工单' : '新建工单'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={840}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="工单 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="工单 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: '请输入设备名称' }]}>
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设备 ID" name="deviceId" rules={[{ required: true, message: '请输入设备 ID' }]}>
                <Input placeholder="请输入设备 ID" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="故障类型" name="faultType" rules={[{ required: true, message: '请输入故障类型' }]}>
            <Input placeholder="请输入故障类型" />
          </Form.Item>
          <Form.Item label="故障描述" name="description" rules={[{ required: true, message: '请输入故障描述' }]}>
            <Input.TextArea rows={3} placeholder="请输入故障描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="等级" name="level" rules={[{ required: true, message: '请选择等级' }]}>
                <Select options={levelOptions.map((level) => ({ label: level, value: level }))} placeholder="请选择等级" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="工单状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择状态" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="上报时间" name="reportedAt" rules={[{ required: true, message: '请输入上报时间' }]}>
                <Input placeholder="示例：2024-08-01 09:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="派单时间" name="dispatchTime" rules={[{ required: true, message: '请输入派单时间' }]}>
                <Input placeholder="示例：2024-08-01 09:30" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="运维负责人" name="owner" rules={[{ required: true, message: '请输入负责人' }]}>
            <Input placeholder="请输入负责人" />
          </Form.Item>
          <Form.Item label="处理方案" name="solution">
            <Input.TextArea rows={2} placeholder="可填写处理方案摘要" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="完成时间" name="finishTime">
                <Input placeholder="示例：2024-08-01 11:20" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="处理结果" name="result">
                <Select
                  allowClear
                  options={[
                    { label: '完全解决', value: '完全解决' },
                    { label: '部分解决', value: '部分解决' },
                    { label: '未解决（需换硬件）', value: '未解决（需换硬件）' },
                  ]}
                  placeholder="请选择处理结果"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="remark">
            <Input placeholder="可补充说明" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Fault;
