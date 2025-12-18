import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import {
  Badge,
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
import type {
  FacilityItem,
  InfrastructureResponse,
} from '@/services/operations';
import { getInfrastructureOverview } from '@/services/operations';

const statusColor: Record<
  FacilityItem['status'],
  'success' | 'warning' | 'error'
> = {
  正常运行: 'success',
  待维护: 'warning',
  停用: 'error',
};

type FilterState = {
  keyword: string;
  status: FacilityItem['status'] | 'all';
  type: FacilityItem['type'] | 'all';
};

const facilityTypes: FacilityItem['type'][] = [
  '监测区域',
  '交通卡口',
  '行人通道点位',
  '智慧灯杆',
];
const facilityStatus: FacilityItem['status'][] = ['正常运行', '待维护', '停用'];
const FACILITY_TYPE_LABEL_IDS: Record<FacilityItem['type'], string> = {
  监测区域: 'pages.operations.infrastructure.types.region',
  交通卡口: 'pages.operations.infrastructure.types.checkpoint',
  行人通道点位: 'pages.operations.infrastructure.types.pedestrian',
  智慧灯杆: 'pages.operations.infrastructure.types.lamp',
};
const FACILITY_STATUS_LABEL_IDS: Record<FacilityItem['status'], string> = {
  正常运行: 'pages.operations.infrastructure.status.normal',
  待维护: 'pages.operations.infrastructure.status.maintenance',
  停用: 'pages.operations.infrastructure.status.stop',
};

const Infrastructure: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getInfrastructureOverview, {
    formatResult: (
      res: InfrastructureResponse | { data: InfrastructureResponse },
    ) =>
      (res as { data?: InfrastructureResponse })?.data ??
      (res as InfrastructureResponse),
  });
  const typeOptions = useMemo(
    () =>
      facilityTypes.map((type) => ({
        value: type,
        label: t(FACILITY_TYPE_LABEL_IDS[type]),
      })),
    [t],
  );
  const statusOptions = useMemo(
    () =>
      facilityStatus.map((status) => ({
        value: status,
        label: t(FACILITY_STATUS_LABEL_IDS[status]),
      })),
    [t],
  );
  const countUnit = t('pages.operations.infrastructure.unit.count');
  const poleUnit = t('pages.operations.infrastructure.unit.pole');

  const [initialized, setInitialized] = useState(false);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    status: 'all',
    type: 'all',
  });
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
        checkpoints: facilities.filter((item) => item.type === '交通卡口')
          .length,
        pedestrianPoints: facilities.filter(
          (item) => item.type === '行人通道点位',
        ).length,
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
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
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

  const handleDelete = useCallback(
    (id: string) => {
      setFacilities((prev) => prev.filter((item) => item.id !== id));
      message.success(t('pages.common.messages.deleteSuccess'));
    },
    [t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setFacilities((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? values : item)),
      );
      message.success(
        t('pages.operations.infrastructure.messages.updateSuccess'),
      );
    } else {
      const newItem: FacilityItem = {
        ...values,
        id: values.id?.trim() ? values.id : `FAC-${Date.now()}`,
      };
      setFacilities((prev) => [newItem, ...prev]);
      message.success(
        t('pages.operations.infrastructure.messages.createSuccess'),
      );
    }
    setModalVisible(false);
  }, [editingRecord, form, t]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<FacilityItem> = useMemo(
    () => [
      {
        title: t('pages.operations.infrastructure.table.columns.id'),
        dataIndex: 'id',
        width: 140,
      },
      {
        title: t('pages.operations.infrastructure.table.columns.name'),
        dataIndex: 'name',
        width: 220,
        render: (value: string) => <strong>{value}</strong>,
      },
      {
        title: t('pages.operations.infrastructure.table.columns.type'),
        dataIndex: 'type',
        width: 160,
        render: (value: FacilityItem['type']) => (
          <Tag color="blue">{t(FACILITY_TYPE_LABEL_IDS[value])}</Tag>
        ),
      },
      {
        title: t('pages.operations.infrastructure.table.columns.region'),
        dataIndex: 'region',
        width: 220,
      },
      {
        title: t('pages.operations.infrastructure.table.columns.address'),
        dataIndex: 'address',
        width: 240,
      },
      {
        title: t('pages.operations.infrastructure.table.columns.coordinates'),
        dataIndex: 'coordinates',
        width: 180,
      },
      {
        title: t('pages.operations.infrastructure.table.columns.owner'),
        dataIndex: 'owner',
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
        title: t('pages.operations.infrastructure.table.columns.status'),
        dataIndex: 'status',
        width: 140,
        render: (value: FacilityItem['status']) => (
          <Badge
            status={statusColor[value]}
            text={t(FACILITY_STATUS_LABEL_IDS[value])}
          />
        ),
      },
      {
        title: t('pages.operations.infrastructure.table.columns.buildDate'),
        dataIndex: 'buildDate',
        width: 140,
      },
      {
        title: t('pages.operations.infrastructure.table.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t(
                'pages.operations.infrastructure.popconfirm.deleteTitle',
              )}
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
      header={{ title: t('pages.operations.infrastructure.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.infrastructure.card.regions')}
              value={summary.regions}
              suffix={countUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.infrastructure.card.checkpoints')}
              value={summary.checkpoints}
              suffix={countUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.infrastructure.card.pedestrian')}
              value={summary.pedestrianPoints}
              suffix={countUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.infrastructure.card.lampPoles')}
              value={summary.lampPoles}
              suffix={poleUnit}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.operations.infrastructure.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.operations.infrastructure.button.create')}
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
            <Input
              allowClear
              placeholder={t(
                'pages.operations.infrastructure.filter.keyword.placeholder',
              )}
              style={{ width: 240 }}
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.operations.infrastructure.filter.type.all'),
                },
                ...typeOptions,
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 180 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.operations.infrastructure.filter.status.all'),
                },
                ...statusOptions,
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
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
        title={
          editingRecord
            ? t('pages.operations.infrastructure.modal.editTitle')
            : t('pages.operations.infrastructure.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={760}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('pages.operations.infrastructure.form.labels.id')}
            name="id"
          >
            <Input
              disabled={!!editingRecord}
              placeholder={
                editingRecord
                  ? undefined
                  : t('pages.operations.infrastructure.form.placeholders.id')
              }
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.name',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.name',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.type')}
                name="type"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.type',
                    ),
                  },
                ]}
              >
                <Select
                  options={typeOptions}
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.type',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.region')}
                name="region"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.region',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.region',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.status')}
                name="status"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.status',
                    ),
                  },
                ]}
              >
                <Select
                  options={statusOptions}
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.status',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.operations.infrastructure.form.labels.address')}
            name="address"
            rules={[
              {
                required: true,
                message: t(
                  'pages.operations.infrastructure.form.validations.address',
                ),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.operations.infrastructure.form.placeholders.address',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.operations.infrastructure.form.labels.coordinates')}
            name="coordinates"
          >
            <Input
              placeholder={t(
                'pages.operations.infrastructure.form.placeholders.coordinates',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.owner')}
                name="owner"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.owner',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.owner',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.phone')}
                name="phone"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.phone',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.phone',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.operations.infrastructure.form.labels.buildDate',
                )}
                name="buildDate"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.infrastructure.form.validations.buildDate',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.buildDate',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.infrastructure.form.labels.remark')}
                name="remark"
              >
                <Input
                  placeholder={t(
                    'pages.operations.infrastructure.form.placeholders.remark',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Infrastructure;
