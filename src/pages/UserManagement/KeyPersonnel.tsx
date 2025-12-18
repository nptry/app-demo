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
import type {
  KeyPersonItem,
  KeyPersonResponse,
} from '@/services/userManagement';
import {
  createKeyPerson,
  deleteKeyPerson,
  getKeyPersons,
  updateKeyPerson,
} from '@/services/userManagement';

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

const typeOptions: KeyPersonItem['personType'][] = [
  '黑名单人员',
  '重点关注人员',
  '限制进入人员',
];
const statusOptions: KeyPersonItem['status'][] = ['在控', '失控', '已解除'];

const KeyPersonnel: React.FC = () => {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, React.ReactNode>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const { data, loading, refresh } = useRequest(getKeyPersons, {
    formatResult: (res: KeyPersonResponse | { data: KeyPersonResponse }) =>
      (res as { data?: KeyPersonResponse })?.data ?? (res as KeyPersonResponse),
  });

  const [initialized, setInitialized] = useState(false);
  const [persons, setPersons] = useState<KeyPersonItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    personType: 'all',
    status: 'all',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<KeyPersonItem | null>(
    null,
  );
  const [form] = Form.useForm<KeyPersonItem>();
  const [filterForm] = Form.useForm();
  const typeLabelMap = useMemo(
    () => ({
      黑名单人员: t('pages.userManagement.keyPersonnel.personTypes.blacklist'),
      重点关注人员: t('pages.userManagement.keyPersonnel.personTypes.keyWatch'),
      限制进入人员: t(
        'pages.userManagement.keyPersonnel.personTypes.restricted',
      ),
    }),
    [t],
  );
  const statusLabelMap = useMemo(
    () => ({
      在控: t('pages.userManagement.keyPersonnel.status.inControl'),
      失控: t('pages.userManagement.keyPersonnel.status.outOfControl'),
      已解除: t('pages.userManagement.keyPersonnel.status.released'),
    }),
    [t],
  );
  const genderLabelMap = useMemo(
    () => ({
      男: t('pages.userManagement.keyPersonnel.gender.male'),
      女: t('pages.userManagement.keyPersonnel.gender.female'),
      未知: t('pages.userManagement.keyPersonnel.gender.unknown'),
    }),
    [t],
  );
  const typeSelectOptions = useMemo(
    () => [
      {
        value: 'all',
        label: t('pages.userManagement.keyPersonnel.filter.allTypes'),
      },
      ...typeOptions.map((type) => ({
        value: type,
        label: typeLabelMap[type] ?? type,
      })),
    ],
    [t, typeLabelMap],
  );
  const statusSelectOptions = useMemo(
    () => [
      {
        value: 'all',
        label: t('pages.userManagement.keyPersonnel.filter.allStatus'),
      },
      ...statusOptions.map((status) => ({
        value: status,
        label: statusLabelMap[status] ?? status,
      })),
    ],
    [statusLabelMap, t],
  );
  const genderSelectOptions = useMemo(
    () => [
      { label: genderLabelMap.男, value: '男' },
      { label: genderLabelMap.女, value: '女' },
      { label: genderLabelMap.未知, value: '未知' },
    ],
    [genderLabelMap],
  );
  const typeFormOptions = useMemo(
    () =>
      typeOptions.map((type) => ({
        value: type,
        label: typeLabelMap[type] ?? type,
      })),
    [typeLabelMap],
  );
  const statusFormOptions = useMemo(
    () =>
      statusOptions.map((status) => ({
        value: status,
        label: statusLabelMap[status] ?? status,
      })),
    [statusLabelMap],
  );
  const personUnitLabel = t('pages.userManagement.keyPersonnel.unit.person');

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
        highRisk: persons.filter((item) => item.personType === '黑名单人员')
          .length,
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
      const matchType =
        filters.personType === 'all' || item.personType === filters.personType;
      const matchStatus =
        filters.status === 'all' || item.status === filters.status;
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

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteKeyPerson(id);
        message.success(t('pages.common.messages.deleteSuccess'));
        refresh();
      } catch (_error) {
        message.error(
          t('pages.userManagement.keyPersonnel.messages.deleteError'),
        );
      }
    },
    [refresh, t],
  );

  const handleModalOk = useCallback(async () => {
    const values = await form.validateFields();
    const payload: Partial<KeyPersonItem> = {
      ...values,
      controlAreas: values.controlAreas?.length ? values.controlAreas : [],
    };
    try {
      if (editingRecord) {
        await updateKeyPerson(editingRecord.id, payload);
        message.success(
          t('pages.userManagement.keyPersonnel.messages.updateSuccess'),
        );
      } else {
        await createKeyPerson(payload);
        message.success(
          t('pages.userManagement.keyPersonnel.messages.createSuccess'),
        );
      }
      setModalVisible(false);
      refresh();
    } catch (_error) {
      message.error(t('pages.userManagement.keyPersonnel.messages.saveError'));
    }
  }, [editingRecord, form, refresh, t]);

  const handleModalCancel = useCallback(() => setModalVisible(false), []);

  const columns: ColumnsType<KeyPersonItem> = useMemo(
    () => [
      {
        title: t('pages.userManagement.keyPersonnel.columns.id'),
        dataIndex: 'id',
        width: 160,
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.basicInfo'),
        dataIndex: 'name',
        width: 220,
        render: (value: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>
              {value ?? t('pages.common.text.unknown')}
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {genderLabelMap[record.gender ?? ''] ??
                record.gender ??
                t('pages.common.text.unknown')}
              {` · ${t('pages.userManagement.keyPersonnel.text.birthLabel')}${
                record.birthDate ?? '—'
              }`}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.personType'),
        dataIndex: 'personType',
        width: 160,
        render: (value: KeyPersonItem['personType']) => (
          <Tag color={typeColor[value]}>
            {typeLabelMap[value] ?? value ?? t('pages.common.text.unknown')}
          </Tag>
        ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.controlAreas'),
        dataIndex: 'controlAreas',
        width: 240,
        render: (areas: string[]) =>
          areas?.length
            ? areas.map((area) => (
                <Tag key={area} color="purple" style={{ marginBottom: 4 }}>
                  {area}
                </Tag>
              ))
            : t('pages.common.text.none'),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.duration'),
        dataIndex: 'startTime',
        width: 260,
        render: (value: string, record) => (
          <div>
            <div>
              {t('pages.userManagement.keyPersonnel.text.startLabel', {
                time: value ?? '—',
              })}
            </div>
            <div>
              {t('pages.userManagement.keyPersonnel.text.endLabel', {
                time: record.endTime ?? '—',
              })}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.status'),
        dataIndex: 'status',
        width: 160,
        render: (value: KeyPersonItem['status'], record) => (
          <div>
            <Tag color={statusColor[value]}>
              {statusLabelMap[value] ?? value ?? t('pages.common.text.unknown')}
            </Tag>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {t('pages.userManagement.keyPersonnel.text.statusUpdatedAt', {
                time: record.statusUpdatedAt ?? '—',
              })}
            </div>
          </div>
        ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.contact'),
        dataIndex: 'contactName',
        width: 200,
        render: (value: string | undefined, record) =>
          value ? (
            <div>
              <div>{value}</div>
              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                {record.contactPhone ?? '—'}
              </div>
            </div>
          ) : (
            t('pages.common.text.none')
          ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.operator'),
        dataIndex: 'operator',
        width: 140,
        render: (value: string | undefined) => value ?? '—',
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.remark'),
        dataIndex: 'remark',
        width: 150,
        render: (value: string | undefined) =>
          value ?? t('pages.common.text.none'),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.action'),
        dataIndex: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Button type="link" onClick={() => handleEdit(record)}>
              {t('pages.common.actions.edit')}
            </Button>
            <Popconfirm
              title={t('pages.userManagement.keyPersonnel.popconfirm.delete')}
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
    [genderLabelMap, handleDelete, handleEdit, statusLabelMap, t, typeLabelMap],
  );

  return (
    <PageContainer
      header={{ title: t('pages.userManagement.keyPersonnel.pageTitle') }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.userManagement.keyPersonnel.stats.total')}
              value={summary.total}
              suffix={personUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.userManagement.keyPersonnel.stats.inControl')}
              value={summary.inControl}
              suffix={personUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.userManagement.keyPersonnel.stats.expired')}
              value={summary.expired}
              suffix={personUnitLabel}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title={t('pages.userManagement.keyPersonnel.stats.highRisk')}
              value={summary.highRisk}
              suffix={personUnitLabel}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={t('pages.userManagement.keyPersonnel.table.title')}
        style={{ marginTop: 24 }}
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" onClick={openCreateModal}>
            {t('pages.userManagement.keyPersonnel.button.add')}
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
            <Input
              allowClear
              placeholder={t(
                'pages.userManagement.keyPersonnel.filter.keyword',
              )}
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="personType">
            <Select style={{ width: 200 }} options={typeSelectOptions} />
          </Form.Item>
          <Form.Item name="status">
            <Select style={{ width: 180 }} options={statusSelectOptions} />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleFilterReset}>
              {t('pages.common.buttons.resetFilters')}
            </Button>
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
                <div>
                  {t('pages.userManagement.keyPersonnel.detail.idNumber', {
                    value: record.idNumber ?? '—',
                  })}
                </div>
                <div>
                  {t('pages.userManagement.keyPersonnel.detail.reason', {
                    value: record.reason ?? '—',
                  })}
                </div>
                <div>
                  {t('pages.userManagement.keyPersonnel.detail.faceLibrary', {
                    value: record.faceLibrary ?? '—',
                  })}
                </div>
              </div>
            ),
          }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? t('pages.userManagement.keyPersonnel.modal.editTitle')
            : t('pages.userManagement.keyPersonnel.modal.createTitle')
        }
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={t('pages.common.actions.save')}
        destroyOnClose
        width={900}
      >
        <Form layout="vertical" form={form}>
          {editingRecord ? (
            <Form.Item
              label={t('pages.userManagement.keyPersonnel.form.labels.id')}
              name="id"
            >
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item
              label={t('pages.userManagement.keyPersonnel.form.labels.id')}
              name="id"
            >
              <Input
                placeholder={t('pages.common.form.placeholder.autoGenerate')}
              />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t('pages.userManagement.keyPersonnel.form.labels.name')}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.name',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.name',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.gender',
                )}
                name="gender"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.gender',
                    ),
                  },
                ]}
              >
                <Select
                  options={genderSelectOptions}
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.gender',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.birthDate',
                )}
                name="birthDate"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.birthDate',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.birthDate',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.idNumber',
                )}
                name="idNumber"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.idNumber',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.idNumber',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.personType',
                )}
                name="personType"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.personType',
                    ),
                  },
                ]}
              >
                <Select
                  options={typeFormOptions}
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.personType',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t(
              'pages.userManagement.keyPersonnel.form.labels.controlAreas',
            )}
            name="controlAreas"
            rules={[
              {
                required: true,
                message: t(
                  'pages.userManagement.keyPersonnel.form.validations.controlAreas',
                ),
              },
            ]}
          >
            <Select
              mode="tags"
              placeholder={t(
                'pages.userManagement.keyPersonnel.form.placeholders.controlAreas',
              )}
              options={Array.from(
                new Set(persons.flatMap((item) => item.controlAreas)),
              ).map((area) => ({
                label: area,
                value: area,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.startTime',
                )}
                name="startTime"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.startTime',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.startTime',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.endTime',
                )}
                name="endTime"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.endTime',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.endTime',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.reason',
                )}
                name="reason"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.reason',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.reason',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.faceLibrary',
                )}
                name="faceLibrary"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.faceLibrary',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.faceLibrary',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.contactName',
                )}
                name="contactName"
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.contactName',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.contactPhone',
                )}
                name="contactPhone"
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.contactPhone',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.status',
                )}
                name="status"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.status',
                    ),
                  },
                ]}
              >
                <Select
                  options={statusFormOptions}
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.status',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.statusUpdatedAt',
                )}
                name="statusUpdatedAt"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.statusUpdatedAt',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.statusUpdatedAt',
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.operator',
                )}
                name="operator"
                rules={[
                  {
                    required: true,
                    message: t(
                      'pages.userManagement.keyPersonnel.form.validations.operator',
                    ),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.operator',
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t(
                  'pages.userManagement.keyPersonnel.form.labels.remark',
                )}
                name="remark"
              >
                <Input
                  placeholder={t(
                    'pages.userManagement.keyPersonnel.form.placeholders.remark',
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

export default KeyPersonnel;
