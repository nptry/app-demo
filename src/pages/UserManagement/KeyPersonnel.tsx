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
import type { KeyPersonItem, KeyPersonResponse } from '@/services/userManagement';
import { getKeyPersons } from '@/services/userManagement';

const statusColor: Record<KeyPersonItem['status'], string> = {
  在控: 'green',
  失控: 'red',
  已解除: 'blue',
};

const typeColor: Record<KeyPersonItem['personType'], string> = {
  黑名单人员: 'red',
  重点关注人员: 'orange',
  限制进入人员: 'purple',
};

type FilterState = {
  keyword: string;
  personType: KeyPersonItem['personType'] | 'all';
  status: KeyPersonItem['status'] | 'all';
};

const typeOptions: KeyPersonItem['personType'][] = ['黑名单人员', '重点关注人员', '限制进入人员'];
const statusOptions: KeyPersonItem['status'][] = ['在控', '失控', '已解除'];

const KeyPersonnel: React.FC = () => {
  const { data, loading } = useRequest(getKeyPersons, {
    formatResult: (res: KeyPersonResponse | { data: KeyPersonResponse }) =>
      (res as { data?: KeyPersonResponse })?.data ?? (res as KeyPersonResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [persons, setPersons] = useState<KeyPersonItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({ keyword: '', personType: 'all', status: 'all' });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KeyPersonItem | null>(null);
  const [form] = Form.useForm<KeyPersonItem>();
  const [filterForm] = Form.useForm();

  useEffect(() => {
    if (data?.persons && !initialized) {
      setPersons(data.persons);
      setInitialized(true);
    }
  }, [data?.persons, initialized]);

  const summary = useMemo(() => {
    if (persons.length) {
      return {
        total: persons.length,
        inControl: persons.filter((item) => item.status === '在控').length,
        expired: persons.filter((item) => item.status === '已解除').length,
        highRisk: persons.filter((item) => item.personType === '黑名单人员').length,
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        inControl: 0,
        expired: 0,
        highRisk: 0,
      }
    );
  }, [data?.summary, persons]);

  const filteredPersons = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return persons.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.reason, item.operator]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType = filters.personType === 'all' || item.personType === filters.personType;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      return matchKeyword && matchType && matchStatus;
    });
  }, [filters.keyword, filters.personType, filters.status, persons]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        personType: (values.personType ?? 'all') as FilterState['personType'],
        status: (values.status ?? 'all') as FilterState['status'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', personType: 'all', status: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      personType: '重点关注人员',
      status: '在控',
      gender: '未知',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: KeyPersonItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback((id: string) => {
    setPersons((prev) => prev.filter((item) => item.id !== id));
    message.success('删除成功');
  }, []);

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const controlAreas = values.controlAreas?.length ? values.controlAreas : [];
    if (editingRecord) {
      setPersons((prev) => prev.map((item) => (item.id === editingRecord.id ? { ...values, controlAreas } : item)));
      message.success('重点人员信息已更新');
    } else {
      const newItem: KeyPersonItem = {
        ...values,
        controlAreas,
        id: values.id?.trim() ? values.id : `PERSON-${Date.now()}`,
      };
      setPersons((prev) => [newItem, ...prev]);
      message.success('新增重点人员成功');
    }
    setModalVisible(false);
  }, [editingRecord, form]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<KeyPersonItem> = useMemo(
    () => [
      { title: '重点人员 ID', dataIndex: 'id', width: 160 },
      {
        title: '姓名 / 基础信息',
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.gender} · 出生：{record.birthDate}
            </div>
          </div>
        ),
      },
      {
        title: '人员类型',
        dataIndex: 'personType',
        width: 160,
        render: (value: KeyPersonItem['personType']) => <Tag color={typeColor[value]}>{value}</Tag>,
      },
      {
        title: '布控区域',
        dataIndex: 'controlAreas',
        width: 240,
        render: (areas: string[]) =>
          areas.map((area) => (
            <Tag key={area} color="purple" style={{ marginBottom: 4 }}>
              {area}
            </Tag>
          )),
      },
      {
        title: '布控时效',
        dataIndex: 'startTime',
        width: 260,
        render: (value: string, record) => (
          <div>
            <div>开始：{value}</div>
            <div>结束：{record.endTime}</div>
          </div>
        ),
      },
      {
        title: '人员状态',
        dataIndex: 'status',
        width: 160,
        render: (value: KeyPersonItem['status'], record) => (
          <div>
            <Tag color={statusColor[value]}>{value}</Tag>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>更新：{record.statusUpdatedAt}</div>
          </div>
        ),
      },
      {
        title: '联系人',
        dataIndex: 'contactName',
        width: 200,
        render: (value: string | undefined, record) =>
          value ? (
            <div>
              <div>{value}</div>
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.contactPhone}</div>
            </div>
          ) : (
            '—'
          ),
      },
      { title: '操作人', dataIndex: 'operator', width: 140 },
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
            <Popconfirm title="确认删除该人员？" okText="确认" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
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
    <PageContainer header={{ title: '重点人员管理' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点人员总数" value={summary.total} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在控" value={summary.inControl} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="已解除 / 过期" value={summary.expired} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="高风险对象" value={summary.highRisk} suffix="人" valueStyle={{ color: '#fa541c' }} />
          </Card>
        </Col>
      </Row>

      <Card
        title="重点人员列表"
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            新建重点人员
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', personType: 'all', status: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input allowClear placeholder="搜索姓名 / 原因 / 操作人" style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="personType">
            <Select
              style={{ width: 200 }}
              options={[{ value: 'all', label: '全部类型' }, ...typeOptions.map((type) => ({ label: type, value: type }))]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[{ value: 'all', label: '全部状态' }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>重置筛选</Button>
          </Form.Item>
        </Form>
        <Table<KeyPersonItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredPersons}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                <div>身份证号（脱敏）：{record.idNumber}</div>
                <div>布控原因：{record.reason}</div>
                <div>人脸特征库：{record.faceLibrary}</div>
              </div>
            ),
          }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑重点人员' : '新增重点人员'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="保存"
        destroyOnClose
        width={900}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item label="重点人员 ID" name="id">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item label="重点人员 ID" name="id">
              <Input placeholder="不填写自动生成" />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别' }]}>
                <Select
                  options={[
                    { label: '男', value: '男' },
                    { label: '女', value: '女' },
                    { label: '未知', value: '未知' },
                  ]}
                  placeholder="请选择性别"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="出生日期" name="birthDate" rules={[{ required: true, message: '请输入出生日期' }]}>
                <Input placeholder="示例：1989-06-01" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="身份证号（脱敏）" name="idNumber" rules={[{ required: true, message: '请输入身份证号' }]}>
                <Input placeholder="请输入身份证号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="人员类型" name="personType" rules={[{ required: true, message: '请选择人员类型' }]}>
                <Select options={typeOptions.map((type) => ({ label: type, value: type }))} placeholder="请选择类型" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="布控区域" name="controlAreas" rules={[{ required: true, message: '请选择布控区域' }]}>
            <Select
              mode="tags"
              placeholder="输入或选择布控区域"
              options={Array.from(new Set(persons.flatMap((item) => item.controlAreas))).map((area) => ({
                label: area,
                value: area,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="布控开始时间" name="startTime" rules={[{ required: true, message: '请输入开始时间' }]}>
                <Input placeholder="示例：2024-08-01 00:00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="布控结束时间" name="endTime" rules={[{ required: true, message: '请输入结束时间' }]}>
                <Input placeholder="示例：2024-08-31 23:59" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="布控原因" name="reason" rules={[{ required: true, message: '请输入布控原因' }]}>
                <Input placeholder="请输入布控原因" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="人脸特征库" name="faceLibrary" rules={[{ required: true, message: '请输入人脸特征库' }]}>
                <Input placeholder="请输入人脸特征库" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系人" name="contactName">
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="联系电话" name="contactPhone">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="人员状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
                <Select options={statusOptions.map((status) => ({ label: status, value: status }))} placeholder="请选择状态" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态更新时间" name="statusUpdatedAt" rules={[{ required: true, message: '请输入更新时间' }]}>
                <Input placeholder="示例：2024-08-01 09:00" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="操作人" name="operator" rules={[{ required: true, message: '请输入操作人' }]}>
                <Input placeholder="请输入操作人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="备注" name="remark">
                <Input placeholder="可填写其他说明" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default KeyPersonnel;
