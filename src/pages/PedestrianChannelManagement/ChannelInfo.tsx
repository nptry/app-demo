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
  message,
} from 'antd';
import type { ChannelInfoItem, ChannelInfoResponse } from '@/services/pedestrian';
import { getChannelInfo } from '@/services/pedestrian';

const statusColor: Record<ChannelInfoItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

type FilterState = {
  keyword: string;
  status: ChannelInfoItem['status'] | 'all';
  channelType: ChannelInfoItem['channelType'] | 'all';
};

const channelTypeOptions: ChannelInfoItem['channelType'][] = ['商场入口', '地铁站出口', '步行街通道', '政府入口'];
const statusOptions: ChannelInfoItem['status'][] = ['启用', '禁用'];

const ChannelInfo: React.FC = () => {
  const { data, loading } = useRequest(getChannelInfo, {
    formatResult: (res: ChannelInfoResponse | { data: ChannelInfoResponse }) =>
      (res as { data?: ChannelInfoResponse })?.data ?? (res as ChannelInfoResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [channels, setChannels] = useState<ChannelInfoItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', channelType: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ChannelInfoItem | null>(null);
  const [form] = Form.useForm<ChannelInfoItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.channels && !initialized) {
      setChannels(data.channels);
      setInitialized(true);
    }
  }, [data?.channels, initialized]);

  const summary = useMemo(() => {
    if (channels.length) {
      return {
        total: channels.length,
        enabled: channels.filter((item) => item.status === '启用').length,
        widthMeters: channels.reduce((acc, item) => acc + (item.width ?? 0), 0),
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        enabled: 0,
        widthMeters: 0,
      }
    );
  }, [channels, data?.summary]);

  const filteredChannels = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return channels.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address].some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchType = filters.channelType === 'all' || item.channelType === filters.channelType;
      return matchKeyword && matchStatus && matchType;
    });
  }, [channels, filters.channelType, filters.keyword, filters.status]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        channelType: (values.channelType ?? 'all') as FilterState['channelType'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', channelType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: '启用',
      channelType: '商场入口',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: ChannelInfoItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setChannels((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setChannels((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
      message.success('通道信息已更新');
    } else {
      const newItem: ChannelInfoItem = {
        ...values,
        id: values.id?.trim() ? values.id : `CH-${Date.now()}`,
      };
      setChannels((prev) => [newItem, ...prev]);
      message.success('新增通道成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<ChannelInfoItem> = useMemo(
    () => [
      { title: '通道 ID', dataIndex: 'id', width: 140 },
      {
        title: '通道名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.address}</div>
          </div>
        ),
      },
      { title: '通道类型', dataIndex: 'channelType', width: 160 },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      { title: '宽度 (m)', dataIndex: 'width', width: 120 },
      { title: '经纬度', dataIndex: 'coordinates', width: 200 },
      {
        title: '负责人',
        dataIndex: 'manager',
        width: 180,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '通道状态', dataIndex: 'status', width: 140, render: (value: ChannelInfoItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '电子地图', dataIndex: 'mapFile', width: 200 },
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
            <Popconfirm title="确认删除该通道？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '通道定位基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="纳管理通道" value={summary.total} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="启用通道" value={summary.enabled} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="通道宽度合计" value={summary.widthMeters} suffix="m" />
          </Card>
        </Col>
      </Row>

      <Card
        title="通道清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建通道
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', channelType: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索名称 / 区域 / 地址" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="channelType">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部类型' }, ...channelTypeOptions.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 160 }}
              options={[{ value: 'all', label: '全部状态' }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<ChannelInfoItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredChannels}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑通道' : '新建通道'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={800}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="通道 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="通道 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="通道名称" name="name" rules={[{ required: true, message: '请输入通道名称' }]}>
                <Input placeholder="请输入通道名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="通道类型" name="channelType" rules={[{ required: true, message: '请选择通道类型' }]}>
                <Select options={channelTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择通道类型" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="所属区域" name="region" rules={[{ required: true, message: '请输入所属区域' }]}>
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="宽度 (m)" name="width" rules={[{ required: true, message: '请输入宽度' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入宽度" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item label="经纬度" name="coordinates">
            <Input placeholder="示例：118.8,31.9" />
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="通道状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择通道状态" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="电子地图" name="mapFile">
                <Input placeholder="请输入链接或文件标识" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ChannelInfo;
