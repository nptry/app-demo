import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useMemo, useState } from 'react';
import type { Region } from '@/services/region';
import {
  createRegion,
  deleteRegion,
  getRegions,
  updateRegion,
} from '@/services/region';

const RegionManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Region | null>(null);
  const [filters, setFilters] = useState<{ keyword: string; type: string }>({
    keyword: '',
    type: 'all',
  });

  const { data, loading, refresh } = useRequest(
    () =>
      getRegions({
        keyword: filters.keyword,
        region_type: filters.type === 'all' ? undefined : filters.type,
      }),
    {
      refreshDeps: [filters],
      formatResult: (res) => res.data,
    },
  );

  const regions = data?.regions ?? [];
  const total = data?.total ?? 0;

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        type: values.type ?? 'all',
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
    (record: Region) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteRegion(id);
        message.success('删除成功');
        refresh();
      } catch (error) {
        message.error('删除失败，请确保该区域下没有关联点位');
      }
    },
    [refresh],
  );

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await updateRegion(editingRecord.id, values);
        message.success('区域信息已更新');
      } else {
        await createRegion(values);
        message.success('新建区域成功');
      }
      setModalVisible(false);
      refresh();
    } catch (error) {
      // Form validation error or API error
    }
  }, [editingRecord, form, refresh]);

  const columns: ColumnsType<Region> = useMemo(
    () => [
      { title: '区域 ID', dataIndex: 'id', width: 100 },
      { title: '区域名称', dataIndex: 'name', width: 200 },
      {
        title: '区域类型',
        dataIndex: 'region_type',
        width: 120,
        render: (type: string) => (
          <Tag color={type === 'checkpoint' ? 'blue' : 'green'}>
            {type === 'checkpoint' ? '卡口区域' : '场所区域'}
          </Tag>
        ),
      },
      { title: '描述', dataIndex: 'description', ellipsis: true },
      {
        title: '包含点位数量',
        dataIndex: 'point_count',
        width: 120,
        align: 'center',
      },
      {
        title: '操作',
        key: 'action',
        width: 160,
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
              title="确认删除该区域？"
              description="删除区域前请确保该区域下没有关联的点位。"
              onConfirm={() => handleDelete(record.id)}
              okText="确认"
              cancelText="取消"
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
    <PageContainer header={{ title: '区域管理' }}>
      <Card bordered={false}>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Form
            form={filterForm}
            layout="inline"
            initialValues={{ keyword: '', type: 'all' }}
            onValuesChange={handleFilterChange}
          >
            <Form.Item name="keyword">
              <Input
                placeholder="搜索区域名称 / 描述"
                allowClear
                style={{ width: 240 }}
              />
            </Form.Item>
            <Form.Item name="type">
              <Select
                style={{ width: 120 }}
                options={[
                  { label: '全部类型', value: 'all' },
                  { label: '卡口区域', value: 'checkpoint' },
                  { label: '场所区域', value: 'site' },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleFilterReset}>重置</Button>
            </Form.Item>
          </Form>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            新建区域
          </Button>
        </div>

        <Table<Region>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={regions}
          pagination={{
            total,
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑区域' : '新建区域'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="区域名称"
            name="name"
            rules={[{ required: true, message: '请输入区域名称' }]}
          >
            <Input placeholder="请输入区域名称" />
          </Form.Item>
          <Form.Item
            label="区域类型"
            name="region_type"
            rules={[{ required: true, message: '请选择区域类型' }]}
          >
            <Select
              placeholder="请选择区域类型"
              options={[
                { label: '卡口区域', value: 'checkpoint' },
                { label: '场所区域', value: 'site' },
              ]}
            />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={4} placeholder="请输入区域描述" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default RegionManagement;
