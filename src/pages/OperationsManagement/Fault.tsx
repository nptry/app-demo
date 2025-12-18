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
import type { FaultOrderItem, FaultResponse } from '@/services/operations';
import { getFaultOverview } from '@/services/operations';

const levelColor: Record<FaultOrderItem['level'], string> = {
  '紧急（1 小时）': 'red',
  '重要（4 小时）': 'orange',
  '一般（24 小时）': 'blue',
};

const statusMap: Record<
  FaultOrderItem['status'],
  {
    status: 'processing' | 'warning' | 'success' | 'default' | 'error';
    text: string;
  }
> = {
  待派单: { status: 'default', text: '待派单' },
  待处理: { status: 'warning', text: '待处理' },
  处理中: { status: 'processing', text: '处理中' },
  已解决: { status: 'success', text: '已解决' },
  '无法解决（需升级）': { status: 'error', text: '需升级' },
};

type FilterState = {
  keyword: string;
  status: FaultOrderItem['status'] | 'all';
  level: FaultOrderItem['level'] | 'all';
};

const levelOptions: FaultOrderItem['level'][] = [
  '紧急（1 小时）',
  '重要（4 小时）',
  '一般（24 小时）',
];
const statusOptions: FaultOrderItem['status'][] = [
  '待派单',
  '待处理',
  '处理中',
  '已解决',
  '无法解决（需升级）',
];
const LEVEL_LABEL_IDS: Record<FaultOrderItem['level'], string> = {
  '紧急（1 小时）': 'pages.operations.fault.level.emergency',
  '重要（4 小时）': 'pages.operations.fault.level.important',
  '一般（24 小时）': 'pages.operations.fault.level.normal',
};
const STATUS_LABEL_IDS: Record<FaultOrderItem['status'], string> = {
  待派单: 'pages.operations.fault.status.pendingAssign',
  待处理: 'pages.operations.fault.status.pending',
  处理中: 'pages.operations.fault.status.processing',
  已解决: 'pages.operations.fault.status.resolved',
  '无法解决（需升级）': 'pages.operations.fault.status.upgrade',
};

const Fault: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading } = useRequest(getFaultOverview, {
    formatResult: (res: FaultResponse | { data: FaultResponse }) =>
      (res as { data?: FaultResponse })?.data ?? (res as FaultResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [orders, setOrders] = useState<FaultOrderItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    status: 'all',
    level: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FaultOrderItem | null>(
    null,
  );
  const [form] = Form.useForm<FaultOrderItem>();
  const [filterForm] = Form.useForm();
  const levelSelectOptions = useMemo(
    () =>
      levelOptions.map((level) => ({
        value: level,
        label: t(LEVEL_LABEL_IDS[level]),
      })),
    [t],
  );
  const statusSelectOptions = useMemo(
    () =>
      statusOptions.map((status) => ({
        value: status,
        label: t(STATUS_LABEL_IDS[status]),
      })),
    [t],
  );
  const faultUnit = t('pages.operations.fault.unit.count');
  const orderUnit = t('pages.operations.fault.unit.order');

  useEffect(() => {
    if (data?.orders && !initialized) {
      setOrders(data.orders);
      setInitialized(true);
    }
  }, [data?.orders, initialized]);

  const stats = useMemo(() => {
    if (orders.length) {
      return {
        todayFaults: orders.length,
        inProgress: orders.filter((item) => item.status === '处理中').length,
        waiting: orders.filter(
          (item) => item.status === '待派单' || item.status === '待处理',
        ).length,
      };
    }
    return (
      data?.stats ?? {
        todayFaults: 0,
        inProgress: 0,
        waiting: 0,
      }
    );
  }, [data?.stats, orders]);

  const filteredOrders = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return orders.filter((item) => {
      const matchKeyword = keyword
        ? [item.deviceName, item.faultType, item.owner]
            .filter(Boolean)
            .some((field) => field?.toLowerCase().includes(keyword))
        : true;
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
      const matchLevel =
        filters.level === 'all' || item.level === filters.level;
      return matchKeyword && matchStatus && matchLevel;
    });
  }, [filters.keyword, filters.level, filters.status, orders]);

  const handleFilterChange = useCallback(
    (_: unknown, values: Record<string, string>) => {
      setFilters({
        keyword: values.keyword ?? '',
        status: (values.status ?? 'all') as FilterState['status'],
        level: (values.level ?? 'all') as FilterState['level'],
      });
    },
    [],
  );

  const handleFilterReset = useCallback(() => {
    filterForm.resetFields();
    setFilters({ keyword: '', status: 'all', level: 'all' });
  }, [filterForm]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      level: '一般（24 小时）',
      status: '待派单',
    });
    setModalVisible(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: FaultOrderItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setModalVisible(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setOrders((prev) => prev.filter((item) => item.id !== id));
      message.success(t('pages.common.messages.deleteSuccess'));
    },
    [t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    if (editingRecord) {
      setOrders((prev) =>
        prev.map((item) => (item.id === editingRecord.id ? values : item)),
      );
      message.success(t('pages.operations.fault.messages.updateSuccess'));
    } else {
      const newItem: FaultOrderItem = {
        ...values,
        id: values.id?.trim() ? values.id : `FAULT-${Date.now()}`,
      };
      setOrders((prev) => [newItem, ...prev]);
      message.success(t('pages.operations.fault.messages.createSuccess'));
    }
    setModalVisible(false);
  }, [editingRecord, form, t]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<FaultOrderItem> = useMemo(
    () => [
      {
        title: t('pages.operations.fault.table.columns.id'),
        dataIndex: 'id',
        width: 180,
      },
      {
        title: t('pages.operations.fault.table.columns.device'),
        dataIndex: 'deviceName',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              ID：{record.deviceId}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.operations.fault.table.columns.faultType'),
        dataIndex: 'faultType',
        width: 160,
      },
      {
        title: t('pages.operations.fault.table.columns.description'),
        dataIndex: 'description',
        width: 260,
      },
      {
        title: t('pages.operations.fault.table.columns.level'),
        dataIndex: 'level',
        width: 160,
        render: (value: FaultOrderItem['level']) => (
          <Tag color={levelColor[value]}>{t(LEVEL_LABEL_IDS[value])}</Tag>
        ),
      },
      {
        title: t('pages.operations.fault.table.columns.status'),
        dataIndex: 'status',
        width: 140,
        render: (value: FaultOrderItem['status']) => {
          const map = statusMap[value];
          return map ? (
            <Badge status={map.status} text={t(STATUS_LABEL_IDS[value])} />
          ) : (
            value
          );
        },
      },
      {
        title: t('pages.operations.fault.table.columns.dispatch'),
        dataIndex: 'dispatchTime',
        width: 180,
      },
      {
        title: t('pages.operations.fault.table.columns.owner'),
        dataIndex: 'owner',
        width: 140,
      },
      {
        title: t('pages.operations.fault.table.columns.solution'),
        dataIndex: 'solution',
        width: 260,
      },
      {
        title: t('pages.operations.fault.table.columns.finishTime'),
        dataIndex: 'finishTime',
        width: 180,
      },
      {
        title: t('pages.operations.fault.table.columns.result'),
        dataIndex: 'result',
        width: 160,
      },
      {
        title: t('pages.operations.fault.table.columns.remark'),
        dataIndex: 'remark',
      },
      {
        title: t('pages.operations.fault.table.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.operations.fault.popconfirm.deleteTitle')}
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
    <PageContainer header={{ title: t('pages.operations.fault.pageTitle') }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.fault.card.today')}
              value={stats.todayFaults}
              suffix={faultUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.fault.card.inProgress')}
              value={stats.inProgress}
              suffix={orderUnit}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.operations.fault.card.waiting')}
              value={stats.waiting}
              suffix={orderUnit}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.operations.fault.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.operations.fault.button.create')}
          </Button>
        }
      >
        <Form
          form={filterForm}
          layout="inline"
          initialValues={{ keyword: '', status: 'all', level: 'all' }}
          onValuesChange={handleFilterChange}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="keyword">
            <Input
              allowClear
              placeholder={t(
                'pages.operations.fault.filter.keyword.placeholder',
              )}
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="level">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.operations.fault.filter.level.all'),
                },
                ...levelSelectOptions,
              ]}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              style={{ width: 200 }}
              options={[
                {
                  value: 'all',
                  label: t('pages.operations.fault.filter.status.all'),
                },
                ...statusSelectOptions,
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
          </Form.Item>
        </Form>
        <Table<FaultOrderItem>
          rowKey="id"
          loading={loading && !initialized}
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.operations.fault.modal.editTitle')
            : t('pages.operations.fault.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={840}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={t('pages.operations.fault.form.labels.id')}
            name="id"
          >
            <Input
              disabled={!!editingRecord}
              placeholder={
                editingRecord
                  ? undefined
                  : t('pages.operations.fault.form.placeholders.id')
              }
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.deviceName')}
                name="deviceName"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.fault.form.validations.deviceName',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.deviceName',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.deviceId')}
                name="deviceId"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.fault.form.validations.deviceId',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.deviceId',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.operations.fault.form.labels.faultType')}
            name="faultType"
            rules={[
              {
                required: true,
                message: t('pages.operations.fault.form.validations.faultType'),
              },
            ]}
          >
            <Input
              placeholder={t(
                'pages.operations.fault.form.placeholders.faultType',
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.operations.fault.form.labels.description')}
            name="description"
            rules={[
              {
                required: true,
                message: t(
                  'pages.operations.fault.form.validations.description',
                ),
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder={t(
                'pages.operations.fault.form.placeholders.description',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.level')}
                name="level"
                rules={[
                  {
                    required: true,
                    message: t('pages.operations.fault.form.validations.level'),
                  },
                ]}
              >
                <Select
                  options={levelSelectOptions}
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.level',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.status')}
                name="status"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.fault.form.validations.status',
                    ),
                  },
                ]}
              >
                <Select
                  options={statusSelectOptions}
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.status',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.reportedAt')}
                name="reportedAt"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.fault.form.validations.reportedAt',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.reportedAt',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.dispatchTime')}
                name="dispatchTime"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.operations.fault.form.validations.dispatchTime',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.dispatchTime',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.operations.fault.form.labels.owner')}
            name="owner"
            rules={[
              {
                required: true,
                message: t('pages.operations.fault.form.validations.owner'),
              },
            ]}
          >
            <Input
              placeholder={t('pages.operations.fault.form.placeholders.owner')}
            />
          </Form.Item>
          <Form.Item
            label={t('pages.operations.fault.form.labels.solution')}
            name="solution"
          >
            <Input.TextArea
              rows={2}
              placeholder={t(
                'pages.operations.fault.form.placeholders.solution',
              )}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.finishTime')}
                name="finishTime"
              >
                <Input
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.finishTime',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('pages.operations.fault.form.labels.result')}
                name="result"
              >
                <Select
                  allowClear
                  options={[
                    {
                      label: t('pages.operations.fault.result.full'),
                      value: '完全解决',
                    },
                    {
                      label: t('pages.operations.fault.result.partial'),
                      value: '部分解决',
                    },
                    {
                      label: t('pages.operations.fault.result.unresolved'),
                      value: '未解决（需换硬件）',
                    },
                  ]}
                  placeholder={t(
                    'pages.operations.fault.form.placeholders.result',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('pages.operations.fault.form.labels.remark')}
            name="remark"
          >
            <Input
              placeholder={t('pages.operations.fault.form.placeholders.remark')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Fault;
