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
import type { FacilityItem, InfrastructureResponse } from '@/services/operations';
import { getInfrastructureOverview } from '@/services/operations';

const statusColor: Record<FacilityItem['status'], 'success' | 'warning' | 'error'> = {
  正常运行: 'success',
  待维护: 'warning',
  停用: 'error',
};

type FilterState = {
  keyword: string;
  status: FacilityItem['status'] | 'all';
  type: FacilityItem['type'] | 'all';
};

const facilityTypes: FacilityItem['type'][] = ['监测区域', '交通卡口', '行人通道点位', '智慧灯杆'];
const facilityStatus: FacilityItem['status'][] = ['正常运行', '待维护', '停用'];

const Infrastructure: React.FC = () => {
  const { data, loading } = useRequest(getInfrastructureOverview, {
    formatResult: (res: InfrastructureResponse | { data: InfrastructureResponse }) =>
      (res as { data?: InfrastructureResponse })?.data ?? (res as InfrastructureResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', type: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FacilityItem | null>(null);
  const [form] = Form.useForm<FacilityItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.facilities && !initialized) {
      setFacilities(data.facilities);
      setInitialized(true);
    }
  }, [data?.facilities, initialized]);

  const summary = useMemo(() => {
    if (facilities.length) {
      return {
        regions: facilities.filter((item) => item.type === '监测区域').length,
        checkpoints: facilities.filter((item) => item.type === '交通卡口').length,
        pedestrianPoints: facilities.filter((item) => item.type === '行人通道点位').length,
        lampPoles: facilities.filter((item) => item.type === '智慧灯杆').length,
      };
    }
    return (
      data?.summary ?? {
        regions: 0,
        checkpoints: 0,
        pedestrianPoints: 0,
        lampPoles: 0,
      }
    );
  }, [data?.summary, facilities]);

  const filteredFacilities = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return facilities.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchType = filters.type === 'all' || item.type === filters.type;
      return matchKeyword && matchStatus && matchType;
    });
  }, [facilities, filters.keyword, filters.status, filters.type]);

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
      status: '正常运行',
      type: '监测区域',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: FacilityItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setFacilities((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setFacilities((prev) => prev.map((item) => (item.id === editingRecord.id ? values : item)));
      message.success('设施信息已更新');
    } else {
      const newItem: FacilityItem = {
        ...values,
        id: values.id?.trim() ? values.id : `FAC-${Date.now()}`,
      };
      setFacilities((prev) => [newItem, ...prev]);
      message.success('新增设施成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<FacilityItem> = useMemo(
    () => [
      { title: '设施 ID', dataIndex: 'id', width: 140 },
      {
        title: '设施名称',
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: '设施类型',
        dataIndex: 'type',
        width: 160,
        render: (value: FacilityItem['type']) => <Tag color="blue">{value}</Tag>,
      },
      { title: '所属区域', dataIndex: 'region', width: 220 },
      { title: '详细地址', dataIndex: 'address', width: 240 },
      { title: '经纬度', dataIndex: 'coordinates', width: 180 },
      {
        title: '负责人 / 联系电话',
        dataIndex: 'owner',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      {
        title: '设施状态',
        dataIndex: 'status',
        width: 140,
        render: (value: FacilityItem['status']) => <Badge status={statusColor[value]} text={value} />,
      },
      { title: '建成时间', dataIndex: 'buildDate', width: 140 },
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
            <Popconfirm title="确认删除该设施？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '基础设施管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点区域" value={summary.regions} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="交通卡口" value={summary.checkpoints} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="行人通道点位" value={summary.pedestrianPoints} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="智慧灯杆" value={summary.lampPoles} suffix="根" />
          </Card>
        </Col>
      </Row>

      <Card
        title="设施清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新增设施
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
              options={[{ value: 'all', label: '全部类型' }, ...facilityTypes.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部状态' }, ...facilityStatus.map((status) => ({ label: status, value: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<FacilityItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredFacilities}
          loading={loading && !initialized}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑设施' : '新增设施'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={760}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="设施 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="设施 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="设施名称" name="name" rules={[{ required: true, message: '请输入设施名称' }]}>
                <Input placeholder="请输入设施名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="设施类型" name="type" rules={[{ required: true, message: '请选择设施类型' }]}>
                <Select options={facilityTypes.map((type) => ({ label: type, value: type }))} placeholder="请选择设施类型" />
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
              <Form.Item label="设施状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                <Select options={facilityStatus.map((status) => ({ label: status, value: status }))} placeholder="请选择状态" />
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
              <Form.Item label="负责人" name="owner" rules={[{ required: true, message: '请输入负责人' }]}>
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
              <Form.Item label="建成时间" name="buildDate" rules={[{ required: true, message: '请输入建成时间' }]}>
                <Input placeholder="示例：2022-08-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="备注" name="remark">
                <Input placeholder="可填写维护信息、扩展说明" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Infrastructure;
