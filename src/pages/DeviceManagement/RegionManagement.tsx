import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
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

const REGION_TYPE_OPTIONS = [
  {
    value: 'checkpoint',
    labelId: 'pages.deviceManagement.region.types.checkpoint',
  },
  {
    value: 'site',
    labelId: 'pages.deviceManagement.region.types.site',
  },
] as const;

const RegionManagement: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
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
        message.success(t('pages.common.messages.deleteSuccess'));
        refresh();
      } catch (error) {
        message.error(t('pages.deviceManagement.region.messages.deleteFailed'));
      }
    },
    [refresh, t],
  );

  const handleModalOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (editingRecord) {
        await updateRegion(editingRecord.id, values);
        message.success(
          t('pages.deviceManagement.region.messages.updateSuccess'),
        );
      } else {
        await createRegion(values);
        message.success(
          t('pages.deviceManagement.region.messages.createSuccess'),
        );
      }
      setModalVisible(false);
      refresh();
    } catch (error) {
      // Form validation error or API error
    }
  }, [editingRecord, form, refresh, t]);

  const regionTypeOptions = useMemo(
    () =>
      REGION_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelId),
        color: option.value === 'checkpoint' ? 'blue' : 'green',
      })),
    [t],
  );

  const columns: ColumnsType<Region> = useMemo(
    () => [
      {
        title: t('pages.deviceManagement.region.table.columns.id'),
        dataIndex: 'id',
        width: 100,
      },
      {
        title: t('pages.deviceManagement.region.table.columns.name'),
        dataIndex: 'name',
        width: 200,
      },
      {
        title: t('pages.deviceManagement.region.table.columns.type'),
        dataIndex: 'region_type',
        width: 120,
        render: (type: string) => {
          const option = regionTypeOptions.find((item) => item.value === type);
          return (
            <Tag color={option?.color ?? 'blue'}>{option?.label ?? type}</Tag>
          );
        },
      },
      {
        title: t('pages.deviceManagement.region.table.columns.description'),
        dataIndex: 'description',
        ellipsis: true,
      },
      {
        title: t('pages.deviceManagement.region.table.columns.pointCount'),
        dataIndex: 'point_count',
        width: 120,
        align: 'center',
      },
      {
        title: t('pages.deviceManagement.region.table.columns.action'),
        key: 'action',
        width: 180,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.deviceManagement.region.popconfirm.deleteTitle')}
              description={t(
                'pages.deviceManagement.region.popconfirm.deleteDesc',
              )}
              onConfirm={() => handleDelete(record.id)}
              okText={t('pages.common.actions.confirm')}
              cancelText={t('pages.common.actions.cancel')}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {t('pages.common.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit, regionTypeOptions, t],
  );

  return (
    <PageContainer
      header={{ title: t('pages.deviceManagement.region.pageTitle') }}
    >
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
                placeholder={t(
                  'pages.deviceManagement.region.filter.keyword.placeholder',
                )}
                allowClear
                style={{ width: 240 }}
              />
            </Form.Item>
            <Form.Item name="type">
              <Select
                style={{ width: 160 }}
                options={[
                  {
                    label: t('pages.deviceManagement.region.filter.type.all'),
                    value: 'all',
                  },
                  ...regionTypeOptions.map((option) => ({
                    label: option.label,
                    value: option.value,
                  })),
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleFilterReset}>
                {t('pages.common.buttons.resetFilters')}
              </Button>
            </Form.Item>
          </Form>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            {t('pages.deviceManagement.region.button.create')}
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
            showTotal: (t) => t('pages.common.table.total', { total: t }),
          }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.deviceManagement.region.modal.editTitle')
            : t('pages.deviceManagement.region.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t('pages.deviceManagement.region.form.labels.name')}
            name="name"
            rules={[
              {
                required: true,
                message: t(
                  'pages.deviceManagement.region.form.validations.name',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.deviceManagement.region.form.placeholders.name',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.region.form.labels.type')}
            name="region_type"
            rules={[
              {
                required: true,
                message: t(
                  'pages.deviceManagement.region.form.validations.type',
                ),
              },
            ]}
          >
            <Select
              placeholder={t(
                'pages.deviceManagement.region.form.placeholders.type',
              )}
              options={regionTypeOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.deviceManagement.region.form.labels.description')}
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder={t(
                'pages.deviceManagement.region.form.placeholders.description',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default RegionManagement;
