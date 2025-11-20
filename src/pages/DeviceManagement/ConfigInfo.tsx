import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
  Button,
  Card,
  Col,
  Empty,
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
import type { DeviceApplicationItem, DeviceConfigResponse } from '@/services/device';
import { getDeviceConfigInfo } from '@/services/device';

type FilterState = {
  keyword: string;
  applicationType: DeviceApplicationItem['applicationType'] | 'all';
};

const applicationTypeOptions: DeviceApplicationItem['applicationType'][] = [
  '重点区域监测',
  '交通卡口监测',
  '行人通道监测',
];

const ConfigInfo: React.FC = () => {
  const { data, loading } = useRequest(getDeviceConfigInfo, {
    formatResult: (res: DeviceConfigResponse | { data: DeviceConfigResponse }) =>
      (res as { data?: DeviceConfigResponse })?.data ?? (res as DeviceConfigResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [applications, setApplications] = useState<DeviceApplicationItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', applicationType: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeviceApplicationItem | null>(null);
  const [form] = Form.useForm<DeviceApplicationItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.applications && !initialized) {
      setApplications(data.applications);
      setInitialized(true);
    }
  }, [data?.applications, initialized]);

  const summary = useMemo(() => {
    if (applications.length) {
      const map = applications.reduce<Record<string, { type: string; count: number; coverage: string; aiModels: string[] }>>(
        (acc, item) => {
          if (!acc[item.applicationType]) {
            const source = data?.summary?.find((s) => s.type === item.applicationType);
            acc[item.applicationType] = {
              type: item.applicationType,
              count: 0,
              coverage: source?.coverage ?? '--',
              aiModels: source?.aiModels ?? [],
            };
          }
          acc[item.applicationType].count += 1;
          return acc;
        },
        {},
      );
      return Object.values(map);
    }
    return data?.summary ?? [];
  }, [applications, data?.summary]);

  const filteredApplications = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return applications.filter((item) => {
      const matchKeyword = keyword
        ? [item.deviceName, item.region, item.address]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType = filters.applicationType === 'all' || item.applicationType === filters.applicationType;
      return matchKeyword && matchType;
    });
  }, [applications, filters.applicationType, filters.keyword]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        applicationType: (values.applicationType ?? 'all') as FilterState['applicationType'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', applicationType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      applicationType: '重点区域监测',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: DeviceApplicationItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((deviceId: string, applicationType: DeviceApplicationItem['applicationType']) => {
    setApplications((prev) => prev.filter((item) => !(item.deviceId === deviceId && item.applicationType === applicationType)));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setApplications((prev) =>
        prev.map((item) =>
          item.deviceId === editingRecord.deviceId && item.applicationType === editingRecord.applicationType ? values : item,
        ),
      );
      message.success('部署信息已更新');
    } else {
      const newItem: DeviceApplicationItem = {
        ...values,
        deviceId: values.deviceId?.trim() ? values.deviceId : `DEV-${Date.now()}`,
      };
      setApplications((prev) => [newItem, ...prev]);
      message.success('新建应用成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<DeviceApplicationItem> = useMemo(
    () => [
      { title: '设备 ID', dataIndex: 'deviceId', width: 160 },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '应用类型',
        dataIndex: 'applicationType',
        width: 180,
        render: (value: DeviceApplicationItem['applicationType']) => <Tag color="blue">{value}</Tag>,
      },
      { title: '安装区域', dataIndex: 'region', width: 200 },
      { title: '详细地址', dataIndex: 'address', width: 240 },
      { title: '经纬度', dataIndex: 'coordinates', width: 180 },
      { title: '智慧灯杆 ID', dataIndex: 'lampId', width: 160 },
      { title: '部署时间', dataIndex: 'deployDate', width: 140 },
      { title: '部署场景描述', dataIndex: 'description' },
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
            <Popconfirm title="确认删除该部署？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.deviceId, record.applicationType)}>
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
    <PageContainer header={{ title: '设备应用信息' }}>
      <Row gutter={[16, 16]}>
        {summary.length ? (
          summary.map((item) => (
            <Col xs={24} sm={12} md={8} key={item.type}>
              <Card bordered={false}>
                <Statistic title={item.type} value={item.count} suffix="台" />
                <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.65)' }}>覆盖：{item.coverage}</div>
                <div style={{ marginTop: 12 }}>
                  {item.aiModels.map((model) => (
                    <Tag color="geekblue" key={model}>
                      {model}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card>
              <Empty description="暂无应用配置数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        )}
      </Row>

      <Card
        title="部署明细"
        style={{ marginTop: 24 }}
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
          initialValues={{ keyword: '', applicationType: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索设备 / 区域 / 地址" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="applicationType">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部类型' }, ...applicationTypeOptions.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<DeviceApplicationItem>
          rowKey={(record) => `${record.deviceId}-${record.applicationType}`}
          columns={columns}
          dataSource={filteredApplications}
          loading={loading && !initialized}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1600 }}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设备 ID" name="deviceId">
                <Input placeholder="不填写自动生成" disabled={!!editingRecord} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: '请输入设备名称' }]}>
                <Input placeholder="请输入设备名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="应用类型" name="applicationType" rules={[{ required: true, message: '请选择应用类型' }]}>
                <Select options={applicationTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择应用类型" disabled={!!editingRecord} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="部署时间" name="deployDate" rules={[{ required: true, message: '请输入部署时间' }]}>
                <Input placeholder="示例：2024-08-01" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="安装区域" name="region" rules={[{ required: true, message: '请输入区域' }]}>
                <Input placeholder="请输入安装区域" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请输入地址' }]}>
                <Input placeholder="请输入详细地址" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="经纬度" name="coordinates">
                <Input placeholder="示例：118.8,31.9" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="智慧灯杆 ID" name="lampId">
                <Input placeholder="请输入灯杆 ID" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="部署场景描述" name="description">
            <Input.TextArea rows={3} placeholder="可描述应用场景、AI 模型等" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ConfigInfo;
