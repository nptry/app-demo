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
  InputNumber,
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
import type { CheckpointInfoItem, TrafficCheckpointResponse } from '@/services/traffic';
import { getTrafficCheckpoints } from '@/services/traffic';

const statusColor: Record<CheckpointInfoItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

type FilterState = {
  keyword: string;
  status: CheckpointInfoItem['status'] | 'all';
  type: string | 'all';
};

const statusOptions: CheckpointInfoItem['status'][] = ['启用', '禁用'];

const CheckpointInfo: React.FC = () => {
  const { data, loading } = useRequest(getTrafficCheckpoints, {
    formatResult: (res: TrafficCheckpointResponse | { data: TrafficCheckpointResponse }) =>
      (res as { data?: TrafficCheckpointResponse })?.data ?? (res as TrafficCheckpointResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [checkpoints, setCheckpoints] = useState<CheckpointInfoItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', type: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CheckpointInfoItem | null>(null);
  const [form] = Form.useForm<CheckpointInfoItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.checkpoints && !initialized) {
      setCheckpoints(data.checkpoints);
      setInitialized(true);
    }
  }, [data?.checkpoints, initialized]);

  const summary = useMemo(() => {
    if (checkpoints.length) {
      return {
        total: checkpoints.length,
        enabled: checkpoints.filter((item) => item.status === '启用').length,
        laneCount: checkpoints.reduce((acc, item) => acc + (item.laneCount ?? 0), 0),
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        enabled: 0,
        laneCount: 0,
      }
    );
  }, [checkpoints, data?.summary]);

  const typeOptions = useMemo(() => {
    const dataSource = checkpoints.length ? checkpoints : data?.checkpoints ?? [];
    return Array.from(new Set(dataSource.flatMap((item) => item.checkpointTypes)));
  }, [checkpoints, data?.checkpoints]);

  const filteredCheckpoints = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return checkpoints.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address].some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchType = filters.type === 'all' || item.checkpointTypes.includes(filters.type);
      return matchKeyword && matchStatus && matchType;
    });
  }, [checkpoints, filters.keyword, filters.status, filters.type]);

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
      status: '启用',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: CheckpointInfoItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setCheckpoints((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const checkpointTypes = values.checkpointTypes?.length ? values.checkpointTypes : [];
    if (editingRecord) {
      setCheckpoints((prev) => prev.map((item) => (item.id === editingRecord.id ? { ...values, checkpointTypes } : item)));
      message.success('卡口信息已更新');
    } else {
      const newItem: CheckpointInfoItem = {
        ...values,
        checkpointTypes,
        id: values.id?.trim() ? values.id : `CP-${Date.now()}`,
      };
      setCheckpoints((prev) => [newItem, ...prev]);
      message.success('新建卡口成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<CheckpointInfoItem> = useMemo(
    () => [
      { title: '卡口 ID', dataIndex: 'id', width: 140 },
      {
        title: '卡口名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.address}</div>
          </div>
        ),
      },
      {
        title: '卡口类型',
        dataIndex: 'checkpointTypes',
        width: 240,
        render: (types: string[]) => types.map((type) => (
            <Tag key={type} color="blue" style={{ marginBottom: 4 }}>
              {type}
            </Tag>
          )),
      },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      { title: '经纬度', dataIndex: 'coordinates', width: 180 },
      {
        title: '车道数量 / 描述',
        dataIndex: 'laneCount',
        width: 220,
        render: (value: number, record) => (
          <div>
            <div>车道：{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.laneDescription}</div>
          </div>
        ),
      },
      { title: '限速（km/h）', dataIndex: 'speedLimit', width: 140 },
      {
        title: '负责人',
        dataIndex: 'manager',
        width: 160,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '卡口状态', dataIndex: 'status', width: 140, render: (value: CheckpointInfoItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '电子地图/平面图', dataIndex: 'mapFile', width: 200 },
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
            <Popconfirm title="确认删除该卡口？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '卡口基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="纳管卡口" value={summary.total} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="已启用" value={summary.enabled} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="覆盖车道" value={summary.laneCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        title="卡口清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建卡口
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
            <Input allowClear placeholder="搜索名称 / 区域 / 地址" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{ width: 200 }}
              allowClear={false}
              options={[{ value: 'all', label: '全部卡口类型' }, ...typeOptions.map((type) => ({ value: type, label: type }))]}
              placeholder="选择卡口类型"
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 160 }}
              options={[{ value: 'all', label: '全部状态' }, ...statusOptions.map((status) => ({ value: status, label: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<CheckpointInfoItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredCheckpoints}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑卡口' : '新建卡口'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="卡口 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="卡口 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="卡口名称" name="name" rules={[{ required: true, message: '请输入卡口名称' }]}>
                <Input placeholder="请输入卡口名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属区域" name="region" rules={[{ required: true, message: '请输入所属区域' }]}>
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="经纬度" name="coordinates">
                <Input placeholder="示例：118.8,31.9" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="限速（km/h）" name="speedLimit" rules={[{ required: true, message: '请输入限速' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入限速" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="车道数量" name="laneCount" rules={[{ required: true, message: '请输入车道数量' }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入车道数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="卡口状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择状态" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="车道描述" name="laneDescription">
            <Input placeholder="请输入车道描述" />
          </Form.Item>
          <Form.Item label="卡口类型" name="checkpointTypes" rules={[{ required: true, message: '请选择卡口类型' }]}>
            <Select
              mode="tags"
              placeholder="可选择或输入卡口类型"
              options={typeOptions.map((type) => ({ label: type, value: type }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="负责人" name="manager" rules={[{ required: true, message: '请输入负责人' }]}>
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="电子地图/平面图" name="mapFile">
            <Input placeholder="请输入链接或文件路径" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CheckpointInfo;
