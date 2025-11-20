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
import type { KeyAreaSiteItem, KeyAreaSiteResponse } from '@/services/keyArea';
import { getKeyAreaSites } from '@/services/keyArea';

const statusColor: Record<KeyAreaSiteItem['status'], 'success' | 'default'> = {
  启用: 'success',
  禁用: 'default',
};

type SiteFormValues = Omit<KeyAreaSiteItem, 'id'> & { id?: string };

type FilterState = {
  keyword: string;
  status: KeyAreaSiteItem['status'] | 'all';
  siteType: KeyAreaSiteItem['siteType'] | 'all';
};

const siteTypeOptions: KeyAreaSiteItem['siteType'][] = ['公共场所', '活动区域', '政府办公区', '商业区域'];
const statusOptions: KeyAreaSiteItem['status'][] = ['启用', '禁用'];

const SiteInfo: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaSites, {
    formatResult: (res: KeyAreaSiteResponse | { data: KeyAreaSiteResponse }) =>
      (res as { data?: KeyAreaSiteResponse })?.data ?? (res as KeyAreaSiteResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [siteList, setSiteList] = useState<KeyAreaSiteItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', status: 'all', siteType: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KeyAreaSiteItem | null>(null);
  const [form] = Form.useForm<SiteFormValues>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.sites && !initialized) {
      setSiteList(data.sites);
      setInitialized(true);
    }
  }, [data?.sites, initialized]);

  const summary = useMemo(() => {
    if (siteList.length) {
      const totalAreaSqm = siteList.reduce((acc, item) => acc + (item.areaSize ?? 0), 0);
      const enabledSites = siteList.filter((item) => item.status === '启用').length;
      return {
        totalSites: siteList.length,
        enabledSites,
        totalAreaSqm,
      };
    }
    return (
      data?.summary ?? {
        totalSites: 0,
        enabledSites: 0,
        totalAreaSqm: 0,
      }
    );
  }, [data?.summary, siteList]);

  const filteredSites = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return siteList.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const matchType = filters.siteType === 'all' || item.siteType === filters.siteType;
      return matchKeyword && matchStatus && matchType;
    });
  }, [filters.keyword, filters.siteType, filters.status, siteList]);

  const handleFilterChange = useCallback(
    (_: unknown, allValues: Record<string, string>) => {
      setFilters({
        keyword: allValues.keyword ?? '',
        status: (allValues.status ?? 'all') as FilterState['status'],
        siteType: (allValues.siteType ?? 'all') as FilterState['siteType'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', siteType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: '启用',
      siteType: '公共场所',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: KeyAreaSiteItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setSiteList((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setSiteList((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? { ...editingRecord, ...values, id: editingRecord.id } : item)),
      );
      message.success('场所信息已更新');
    } else {
      const newSite: KeyAreaSiteItem = {
        ...(values as KeyAreaSiteItem),
        id: values.id?.trim() ? values.id : `SITE-${Date.now()}`,
        plan: values.plan ?? '—',
      };
      setSiteList((prev) => [newSite, ...prev]);
      message.success('新建场所成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const columns: ColumnsType<KeyAreaSiteItem> = useMemo(
    () => [
      { title: '场所 ID', dataIndex: 'id', width: 140 },
      {
        title: '场所名称',
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
        title: '场所类型',
        dataIndex: 'siteType',
        width: 160,
        render: (value: KeyAreaSiteItem['siteType']) => <Tag color="blue">{value}</Tag>,
      },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      { title: '面积（㎡）', dataIndex: 'areaSize', width: 140, render: (value: number) => value.toLocaleString() },
      {
        title: '负责人 / 联系方式',
        dataIndex: 'manager',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.phone}</div>
          </div>
        ),
      },
      { title: '场所状态', dataIndex: 'status', width: 140, render: (value: KeyAreaSiteItem['status']) => <Badge status={statusColor[value]} text={value} /> },
      { title: '场所描述', dataIndex: 'description', width: 260 },
      { title: '现场平面图', dataIndex: 'plan', width: 200 },
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
            <Popconfirm title="确认删除该场所？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '场所基础信息' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="纳管场所" value={summary.totalSites} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card bordered={false}>
            <Statistic title="启用监测" value={summary.enabledSites} suffix="处" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic title="覆盖面积" value={(summary.totalAreaSqm / 1000).toFixed(1)} suffix="千㎡" />
            <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)' }}>折算约 {summary.totalAreaSqm.toLocaleString()} ㎡</div>
          </Card>
        </Col>
      </Row>

      <Card
        title="重点场所清单"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建场所
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', siteType: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索名称 / 区域 / 地址" style={{ width: 220 }} />
          </Form.Item>
          <Form.Item name="siteType">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部类型' }, ...siteTypeOptions.map((type) => ({ value: type, label: type }))]}
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
        <Table<KeyAreaSiteItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredSites}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1700 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑场所' : '新建场所'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="场所 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : null}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="场所名称" name="name" rules={[{ required: true, message: '请输入场所名称' }]}>
                <Input placeholder="请输入场所名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属区域" name="region" rules={[{ required: true, message: '请输入所属区域' }]}>
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="场所类型" name="siteType" rules={[{ required: true, message: '请选择场所类型' }]}>
                <Select options={siteTypeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择场所类型" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="场所状态" name="status" rules={[{ required: true, message: '请选择场所状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择场所状态" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="负责人" name="manager" rules={[{ required: true, message: '请输入负责人' }]}>
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系方式" name="phone" rules={[{ required: true, message: '请输入联系方式' }]}>
                <Input placeholder="请输入联系方式" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="面积（㎡）" name="areaSize" rules={[{ required: true, message: '请输入面积' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入面积" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="坐标" name="coordinates">
                <Input placeholder="示例：118.8, 31.9" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="详细地址" name="address" rules={[{ required: true, message: '请输入详细地址' }]}>
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="现场平面图链接" name="plan">
                <Input placeholder="请输入平面图链接或说明" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="场所描述" name="description">
                <Input placeholder="请输入场所描述" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SiteInfo;
