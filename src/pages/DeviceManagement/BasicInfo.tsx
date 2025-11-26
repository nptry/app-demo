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
  message,
} from 'antd';
import type { DeviceBasicInfoItem, DeviceBasicInfoResponse } from '@/services/device';
import { getDeviceBasicInfo } from '@/services/device';

const statusBadge: Record<DeviceBasicInfoItem['status'], 'success' | 'processing' | 'error' | 'warning'> = {
  在线: 'success',
  维护中: 'warning',
  故障: 'error',
  离线: 'error',
};

type FilterState = {
  keyword: string;
  status: DeviceBasicInfoItem['status'] | 'all';
  type: DeviceBasicInfoItem['type'] | 'all';
};

const deviceTypeOptions: DeviceBasicInfoItem['type'][] = ['AI 边缘计算设备'];
const deviceStatusOptions: DeviceBasicInfoItem['status'][] = ['在线', '离线', '故障', '维护中'];

const BasicInfo: React.FC = () => {
  const { data, loading } = useRequest(getDeviceBasicInfo, {
    formatResult: (res: DeviceBasicInfoResponse | { data: DeviceBasicInfoResponse }) =>
      (res as { data?: DeviceBasicInfoResponse })?.data ?? (res as DeviceBasicInfoResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [devices, setDevices] = useState<DeviceBasicInfoItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', type: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeviceBasicInfoItem | null>(null);
  const [form] = Form.useForm<DeviceBasicInfoItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.devices && !initialized) {
      setDevices(data.devices);
      setInitialized(true);
    }
  }, [data?.devices, initialized]);

  const summary = useMemo(() => {
    if (devices.length) {
      return {
        total: devices.length,
        aiEdge: devices.filter((item) => item.type === 'AI 边缘计算设备').length,
        online: devices.filter((item) => item.status === '在线').length,
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        aiEdge: 0,
        gateways: 0,
        online: 0,
      }
    );
  }, [data?.summary, devices]);

  const filteredDevices = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return devices.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.vendor, item.serialNumber]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchType = filters.type === 'all' || item.type === filters.type;
      return matchKeyword && matchStatus && matchType;
    });
  }, [devices, filters.keyword, filters.status, filters.type]);

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
      status: '在线',
      type: 'AI 边缘计算设备',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: DeviceBasicInfoItem) => {
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
      setDevices((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
      message.success('设备信息已更新');
    } else {
      const newDevice: DeviceBasicInfoItem = {
        ...values,
        id: values.id?.trim() ? values.id : `DEV-${Date.now()}`,
        serialNumber: values.serialNumber ?? `SN-${Date.now()}`,
      };
      setDevices((prev) => [newDevice, ...prev]);
      message.success('新建设备成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<DeviceBasicInfoItem> = useMemo(
    () => [
      { title: '设备 ID', dataIndex: 'id', width: 150 },
      {
        title: '设备名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '设备类型 / 型号',
        dataIndex: 'type',
        width: 220,
        render: (value: DeviceBasicInfoItem['type'], record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.model}</div>
          </div>
        ),
      },
      { title: '供应商', dataIndex: 'vendor', width: 160 },
      { title: '设备序列号', dataIndex: 'serialNumber', width: 200 },
      { title: '安装时间', dataIndex: 'installDate', width: 140 },
      { title: '质保期限', dataIndex: 'warrantyDate', width: 140 },
      {
        title: '设备状态',
        dataIndex: 'status',
        width: 140,
        render: (value: DeviceBasicInfoItem['status']) => (
          <Badge status={statusBadge[value]} text={value} />
        ),
      },
      { title: '备注', dataIndex: 'remark', width: 200 },
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
            <Popconfirm title="确认删除该设备？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '设备基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在册设备" value={summary.total} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="AI 边缘计算" value={summary.aiEdge} suffix="台" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="当前在线" value={summary.online} suffix="台" />
          </Card>
        </Col>
      </Row>

      <Card
        title="设备清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建设备
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
            <Input allowClear placeholder="搜索名称 / 厂商 / 序列号" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部类型' }, ...deviceTypeOptions.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部状态' }, ...deviceStatusOptions.map((status) => ({ label: status, value: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<DeviceBasicInfoItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredDevices}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑设备' : '新建设备'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="设备 ID" name="id">
            <Input placeholder="不填写则自动生成" disabled={!!editingRecord} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备名称" name="name" rules={[{ required: true, message: '请输入设备名称' }]}>
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设备类型" name="type" rules={[{ required: true, message: '请选择设备类型' }]}>
                <Select options={deviceTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择设备类型" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备型号" name="model" rules={[{ required: true, message: '请输入型号' }]}>
                <Input placeholder="请输入设备型号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="供应商" name="vendor" rules={[{ required: true, message: '请输入供应商' }]}>
                <Input placeholder="请输入供应商" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备序列号" name="serialNumber">
                <Input placeholder="请输入设备序列号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设备状态" name="status" rules={[{ required: true, message: '请选择设备状态' }]}>
                <Select options={deviceStatusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择设备状态" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="安装时间" name="installDate" rules={[{ required: true, message: '请输入安装时间' }]}>
                <Input placeholder="示例：2024-08-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="质保期限" name="warrantyDate" rules={[{ required: true, message: '请输入质保期限' }]}>
                <Input placeholder="示例：2026-08-01" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="可填写安装说明、维护记录等" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BasicInfo;
