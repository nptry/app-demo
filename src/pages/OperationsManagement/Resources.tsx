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
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ResourceItem, ResourceResponse } from '@/services/operations';
import { getResourceOverview } from '@/services/operations';

const statusTagColor = (status: string) => {
  if (status.includes('任务中') || status.includes('执行')) return 'red';
  if (status.includes('待命')) return 'blue';
  if (status.includes('可用') || status.includes('充足')) return 'green';
  if (
    status.includes('不足') ||
    status.includes('休假') ||
    status.includes('停用')
  )
    return 'orange';
  return 'default';
};

type FilterState = {
  keyword: string;
  resourceType: ResourceItem['resourceType'] | 'all';
  status: string | 'all';
};

const RESOURCE_TYPE_LABEL_IDS: Record<ResourceItem['resourceType'], string> = {
  运维车辆: 'pages.operations.resources.types.vehicle',
  运维人员: 'pages.operations.resources.types.engineer',
  设备配件: 'pages.operations.resources.types.spare',
};
const resourceTypeOptions: ResourceItem['resourceType'][] = [
  '运维车辆',
  '运维人员',
  '设备配件',
];

const Resources: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getResourceOverview, {
    formatResult: (res: ResourceResponse | { data: ResourceResponse }) =>
      (res as { data?: ResourceResponse })?.data ?? (res as ResourceResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    resourceType: 'all',
    status: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ResourceItem | null>(null);
  const [form] = Form.useForm<ResourceItem>();
  const [filterForm] = Form.useForm();
  const vehicleUnit = t('pages.operations.resources.unit.vehicle');
  const engineerUnit = t('pages.operations.resources.unit.engineer');
  const spareUnit = t('pages.operations.resources.unit.spare');

  useEffect(() => {
    if (data?.resources && !initialized) {
      setResources(data.resources);
      setInitialized(true);
    }
  }, [data?.resources, initialized]);

  const typeOptions = useMemo(
    () =>
      resourceTypeOptions.map((type) => ({
        value: type,
        label: t(RESOURCE_TYPE_LABEL_IDS[type]),
      })),
    [t],
  );
  const summary = useMemo(() => {
    if (resources.length) {
      return {
        vehicles: resources.filter((item) => item.resourceType === '运维车辆')
          .length,
        engineers: resources.filter((item) => item.resourceType === '运维人员')
          .length,
        spareParts: resources.filter((item) => item.resourceType === '设备配件')
          .length,
      };
    }
    return (
      data?.summary ?? {
        vehicles: 0,
        engineers: 0,
        spareParts: 0,
      }
    );
  }, [data?.summary, resources]);

  const statusOptions = useMemo(() => {
    const source = resources.length ? resources : (data?.resources ?? []);
    return Array.from(new Set(source.map((item) => item.status)));
  }, [data?.resources, resources]);

  const filteredResources = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return resources.filter((item) => {
      const matchKeyword = keyword
        ? [item.name, item.department, item.contact, item.detail]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchType =
        filters.resourceType === 'all' ||
        item.resourceType === filters.resourceType;
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
      return matchKeyword && matchType && matchStatus;
    });
  }, [filters.keyword, filters.resourceType, filters.status, resources]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        resourceType: (values.resourceType ??
          'all') as FilterState['resourceType'],
        status: (values.status ?? 'all') as FilterState['status'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', resourceType: 'all', status: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      resourceType: '运维车辆',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: ResourceItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setResources((prev) => prev.filter((item) => item.id !== id));
      message.success(t('pages.common.messages.deleteSuccess'));
    },
    [t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setResources((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? values : item)),
      );
      message.success(t('pages.operations.resources.messages.updateSuccess'));
    } else {
      const newItem: ResourceItem = {
        ...values,
        id: values.id?.trim() ? values.id : `RES-${Date.now()}`,
      };
      setResources((prev) => [newItem, ...prev]);
      message.success(t('pages.operations.resources.messages.createSuccess'));
    }
    setModalVisible(false);
  }, [editingRecord, form, t]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<ResourceItem> = useMemo(
    () => [
      {
        title: t('pages.operations.resources.table.columns.id'),
        dataIndex: 'id',
        width: 140,
      },
      {
        title: t('pages.operations.resources.table.columns.type'),
        dataIndex: 'resourceType',
        width: 160,
        render: (value: ResourceItem['resourceType']) => (
          <Tag color="blue">{t(RESOURCE_TYPE_LABEL_IDS[value])}</Tag>
        ),
      },
      {
        title: t('pages.operations.resources.table.columns.name'),
        dataIndex: 'name',
        width: 200,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: t('pages.operations.resources.table.columns.department'),
        dataIndex: 'department',
        width: 200,
      },
      {
        title: t('pages.operations.resources.table.columns.status'),
        dataIndex: 'status',
        width: 140,
        render: (value: string) => (
          <Tag color={statusTagColor(value)}>{value}</Tag>
        ),
      },
      {
        title: t('pages.operations.resources.table.columns.contact'),
        dataIndex: 'contact',
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
        title: t('pages.operations.resources.table.columns.detail'),
        dataIndex: 'detail',
        width: 240,
      },
      {
        title: t('pages.operations.resources.table.columns.lastDispatch'),
        dataIndex: 'lastDispatch',
        width: 180,
      },
      {
        title: t('pages.operations.resources.table.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.operations.resources.popconfirm.deleteTitle')}
              okText={t('pages.common.actions.confirm')}
              cancelText={t('pages.common.actions.cancel')}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button type="link" danger>
                {t('pages.common.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit, t],
  );

  return (
    <PageContainer
      header={{ title: t('pages.operations.resources.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.resources.card.vehicles')}
              value={summary.vehicles}
              suffix={vehicleUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.resources.card.engineers')}
              value={summary.engineers}
              suffix={engineerUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.resources.card.spareParts')}
              value={summary.spareParts}
              suffix={spareUnit}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.operations.resources.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.operations.resources.button.create')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', resourceType: 'all', status: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t(
                'pages.operations.resources.filter.keyword.placeholder',
              )}
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="resourceType">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.operations.resources.filter.type.all'),
                },
                ...typeOptions,
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.operations.resources.filter.status.all'),
                },
                ...statusOptions.map((status) => ({
                  label: status,
                  value: status,
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
        <Table<ResourceItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredResources}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.operations.resources.modal.editTitle')
            : t('pages.operations.resources.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={720}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('pages.operations.resources.form.labels.id')}
            name="id"
          >
            <Input
              disabled={!!editingRecord}
              placeholder={
                editingRecord
                  ? undefined
                  : t('pages.operations.resources.form.placeholders.id')
              }
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.resources.form.labels.type')}
                name="resourceType"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.resources.form.validations.type',
                    ),
                  },
                ]}
              >
                <Select
                  options={typeOptions}
                  placeholder={t(
                    'pages.operations.resources.form.placeholders.type',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.resources.form.labels.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.resources.form.validations.name',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.resources.form.placeholders.name',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.resources.form.labels.department')}
                name="department"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.resources.form.validations.department',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.resources.form.placeholders.department',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.resources.form.labels.status')}
                name="status"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.resources.form.validations.status',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.resources.form.placeholders.status',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.resources.form.labels.contact')}
                name="contact"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.resources.form.validations.contact',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.resources.form.placeholders.contact',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.resources.form.labels.phone')}
                name="phone"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.resources.form.validations.phone',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.resources.form.placeholders.phone',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.operations.resources.form.labels.detail')}
            name="detail"
            rules={[
              {
                required: true,
                message: t(
                  'pages.operations.resources.form.validations.detail',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.operations.resources.form.placeholders.detail',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.operations.resources.form.labels.lastDispatch')}
            name="lastDispatch"
          >
            <Input
              placeholder={t(
                'pages.operations.resources.form.placeholders.lastDispatch',
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Resources;
