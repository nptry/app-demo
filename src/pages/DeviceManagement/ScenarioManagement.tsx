import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyAreaSiteItem, KeyAreaSiteResponse } from '@/services/keyArea';
import { getKeyAreaSites } from '@/services/keyArea';
import type {
  CheckpointInfoItem,
  TrafficCheckpointResponse,
} from '@/services/traffic';
import { getTrafficCheckpoints } from '@/services/traffic';

const siteTypeOptions: KeyAreaSiteItem['siteType'][] = [
  '公共场所',
  '活动区域',
  '政府办公区',
  '商业区域',
];

type ScenarioTabKey = 'checkpoint' | 'site';

const CheckpointInfoTab: React.FC = () => {
  const { data, loading } = useRequest(getTrafficCheckpoints, {
    formatResult: (
      res: TrafficCheckpointResponse | { data: TrafficCheckpointResponse },
    ) =>
      (res as { data?: TrafficCheckpointResponse })?.data ??
      (res as TrafficCheckpointResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [checkpoints, setCheckpoints] = useState<CheckpointInfoItem[]>([]);
  const [filters, setFilters] = useState<{
    keyword: string;
    type: string | 'all';
  }>({
    keyword: '',
    type: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CheckpointInfoItem | null>(
    null,
  );
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
        laneCount: checkpoints.reduce(
          (acc, item) => acc + (item.laneCount ?? 0),
          0,
        ),
      };
    }
    return {
      total: data?.summary?.total ?? 0,
      laneCount: data?.summary?.laneCount ?? 0,
    };
  }, [checkpoints, data?.summary]);

  const typeOptions = useMemo(() => {
    const dataSource = checkpoints.length
      ? checkpoints
      : (data?.checkpoints ?? []);
    return Array.from(
      new Set(dataSource.flatMap((item) => item.checkpointTypes)),
    );
  }, [checkpoints, data?.checkpoints]);

  const filteredCheckpoints = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return checkpoints.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address].some((field) =>
            field?.toLowerCase().includes(keyword),
          )
        : true;
      const matchType =
        filters.type === 'all' || item.checkpointTypes.includes(filters.type);
      return matchKeyword && matchType;
    });
  }, [checkpoints, filters.keyword, filters.type]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        type: (values.type ?? 'all') as string | 'all',
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', type: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
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
    const checkpointTypes = values.checkpointTypes?.length
      ? values.checkpointTypes
      : [];
    if (editingRecord) {
      setCheckpoints((prev) =>
        prev.map((item) =>
          item.id === editingRecord.id
            ? { ...item, ...values, checkpointTypes }
            : item,
        ),
      );
      message.success('卡口信息已更新');
    } else {
      const newItem: CheckpointInfoItem = {
        ...values,
        checkpointTypes,
        id: values.id?.trim() ? values.id : `CP-${Date.now()}`,
        status: '启用',
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
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.address}
            </div>
          </div>
        ),
      },
      {
        title: '卡口类型',
        dataIndex: 'checkpointTypes',
        width: 240,
        render: (types: string[]) =>
          types.map((type) => (
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
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.laneDescription}
            </div>
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
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.phone}
            </div>
          </div>
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
            <Popconfirm
              title="确认删除该卡口？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
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
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12}>
          <Card bordered={false}>
            <Statistic title="卡口总数" value={summary.total} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
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
          initialValues={{ keyword: '', type: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder="搜索卡口 / 区域 / 地址"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              allowClear={false}
              style={{ width: 180 }}
              options={[
                { label: '全部类型', value: 'all' },
                ...typeOptions.map((item) => ({ label: item, value: item })),
              ]}
              placeholder="卡口类型"
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
          pagination={{ pageSize: 8, showSizeChanger: false }}
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
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="卡口 ID" name="id">
            <Input placeholder="不填写则自动生成" disabled={!!editingRecord} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="卡口名称"
                name="name"
                rules={[{ required: true, message: '请输入卡口名称' }]}
              >
                <Input placeholder="请输入卡口名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="所属区域"
                name="region"
                rules={[{ required: true, message: '请输入所属区域' }]}
              >
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="经纬度"
                name="coordinates"
                rules={[{ required: true, message: '请输入经纬度' }]}
              >
                <Input placeholder="示例：6.5244°N, 3.3792°E" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="限速（km/h）" name="speedLimit">
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入限速"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="卡口类型"
                name="checkpointTypes"
                rules={[{ required: true, message: '请选择卡口类型' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择卡口类型"
                  options={typeOptions.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="负责人"
                name="manager"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="车道数量"
                name="laneCount"
                rules={[{ required: true, message: '请输入车道数量' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="请输入车道数量"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="车道描述" name="laneDescription">
            <Input.TextArea rows={2} placeholder="请输入车道描述" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

type SiteFormValues = Omit<
  KeyAreaSiteItem,
  'id' | 'status' | 'plan' | 'description'
> & { id?: string };

const SiteInfoTab: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaSites, {
    formatResult: (res: KeyAreaSiteResponse | { data: KeyAreaSiteResponse }) =>
      (res as { data?: KeyAreaSiteResponse })?.data ??
      (res as KeyAreaSiteResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [siteList, setSiteList] = useState<KeyAreaSiteItem[]>([]);
  const [filters, setFilters] = useState<{
    keyword: string;
    siteType: KeyAreaSiteItem['siteType'] | 'all';
  }>({
    keyword: '',
    siteType: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KeyAreaSiteItem | null>(
    null,
  );
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
      const totalAreaSqm = siteList.reduce(
        (acc, item) => acc + (item.areaSize ?? 0),
        0,
      );
      return {
        totalSites: siteList.length,
        totalAreaSqm,
      };
    }
    return {
      totalSites: data?.summary?.totalSites ?? 0,
      totalAreaSqm: data?.summary?.totalAreaSqm ?? 0,
    };
  }, [data?.summary, siteList]);

  const filteredSites = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return siteList.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.region, item.address]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType =
        filters.siteType === 'all' || item.siteType === filters.siteType;
      return matchKeyword && matchType;
    });
  }, [filters.keyword, filters.siteType, siteList]);

  const handleFilterChange = useCallback(
    (_: unknown, allValues: Record<string, string>) => {
      setFilters({
        keyword: allValues.keyword ?? '',
        siteType: (allValues.siteType ?? 'all') as
          | KeyAreaSiteItem['siteType']
          | 'all',
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', siteType: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
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
        prev.map((item) =>
          item.id === editingRecord.id
            ? { ...item, ...values, id: editingRecord.id }
            : item,
        ),
      );
      message.success('场所信息已更新');
    } else {
      const newSite: KeyAreaSiteItem = {
        ...(values as Omit<KeyAreaSiteItem, 'status'>),
        id: values.id?.trim() ? values.id : `SITE-${Date.now()}`,
        plan: values.plan ?? '—',
        status: '启用',
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
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.address}
            </div>
          </div>
        ),
      },
      {
        title: '场所类型',
        dataIndex: 'siteType',
        width: 160,
        render: (value: KeyAreaSiteItem['siteType']) => (
          <Tag color="blue">{value}</Tag>
        ),
      },
      { title: '所属区域', dataIndex: 'region', width: 200 },
      {
        title: '面积（㎡）',
        dataIndex: 'areaSize',
        width: 140,
        render: (value: number) => value.toLocaleString(),
      },
      {
        title: '负责人 / 联系方式',
        dataIndex: 'manager',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.phone}
            </div>
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除该场所？"
              okText="确认"
              cancelText="取消"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
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
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12}>
          <Card bordered={false}>
            <Statistic
              title="场所总数"
              value={summary.totalSites}
              suffix="处"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Card bordered={false}>
            <Statistic
              title="覆盖总面积"
              value={summary.totalAreaSqm}
              suffix="㎡"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="场所清单"
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
          initialValues={{ keyword: '', siteType: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder="搜索场所 / 区域 / 地址"
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="siteType">
            <Select
              style={{ width: 180 }}
              options={[
                { label: '全部类型', value: 'all' },
                ...siteTypeOptions.map((type) => ({
                  label: type,
                  value: type,
                })),
              ]}
              placeholder="场所类型"
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
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1500 }}
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
          <Form.Item label="场所 ID" name="id">
            <Input placeholder="不填写则自动生成" disabled={!!editingRecord} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="场所名称"
                name="name"
                rules={[{ required: true, message: '请输入场所名称' }]}
              >
                <Input placeholder="请输入场所名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="场所类型"
                name="siteType"
                rules={[{ required: true, message: '请选择场所类型' }]}
              >
                <Select
                  options={siteTypeOptions.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  placeholder="请选择场所类型"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="所属区域"
                name="region"
                rules={[{ required: true, message: '请输入所属区域' }]}
              >
                <Input placeholder="请输入所属区域" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="面积（㎡）"
                name="areaSize"
                rules={[{ required: true, message: '请输入面积' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="请输入场所面积"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="负责人"
                name="manager"
                rules={[{ required: true, message: '请输入负责人' }]}
              >
                <Input placeholder="请输入负责人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="详细地址"
            name="address"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const ScenarioManagement: React.FC = () => {
  const [activeKey, setActiveKey] = useState<ScenarioTabKey>('checkpoint');

  return (
    <PageContainer header={{ title: '场景管理' }}>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key as ScenarioTabKey)}
        destroyInactiveTabPane={false}
        items={[
          {
            key: 'checkpoint',
            label: '卡口管理',
            children: <CheckpointInfoTab />,
          },
          {
            key: 'site',
            label: '场所管理',
            children: <SiteInfoTab />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default ScenarioManagement;
