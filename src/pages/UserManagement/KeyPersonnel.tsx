import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useRequest } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
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
  Upload,
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
  const [facePhotoPreview, setFacePhotoPreview] = useState<string | null>(null);
  const [facePhotoValue, setFacePhotoValue] = useState<
    string | null | undefined
  >(undefined);
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
  const personUnitLabel = t('pages.userManagement.keyPersonnel.unit.person');

  useEffect(() => {
    setPersons(data?.persons ?? []);
  }, [data?.persons]);

  const summary = useMemo(() => {
    if (persons.length) {
      return {
        total: persons.length,
        inControl: persons.filter((item) => item.status === '在控').length,
        expired: persons.filter((item) => item.status === '已解除').length,
      };
    }
    return (
      data?.summary ?? {
        total: 0,
        inControl: 0,
        expired: 0,
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

  const resetFacePhoto = useCallback(() => {
    setFacePhotoPreview(null);
    setFacePhotoValue(undefined);
    form.setFieldsValue({ facePhoto: undefined });
  }, [form]);

  const openCreateModal = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      gender: '未知',
    });
    resetFacePhoto();
    setModalVisible(true);
  }, [form, resetFacePhoto]);

  const handleEdit = useCallback(
    (record: KeyPersonItem) => {
      setEditingRecord(record);
      form.setFieldsValue(record);
      setFacePhotoPreview(record.facePhotoUrl ?? null);
      setFacePhotoValue(undefined);
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
      facePhoto: facePhotoValue === undefined ? undefined : facePhotoValue,
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
      resetFacePhoto();
    } catch (_error) {
      message.error(t('pages.userManagement.keyPersonnel.messages.saveError'));
    }
  }, [editingRecord, facePhotoValue, form, refresh, resetFacePhoto, t]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    resetFacePhoto();
  }, [resetFacePhoto]);

  const handleFacePhotoUpload = useCallback(
    (file: File) => {
      if (file.size > 500 * 1024) {
        message.error('人脸照片大小不能超过500KB');
        return Upload.LIST_IGNORE;
      }

      if (!file.type.startsWith('image/')) {
        message.error('请上传图片文件');
        return Upload.LIST_IGNORE;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFacePhotoPreview(base64);
        setFacePhotoValue(base64);
        form.setFieldsValue({ facePhoto: base64 });
      };
      reader.readAsDataURL(file);

      return false;
    },
    [form],
  );

  const removeFacePhoto = useCallback(() => {
    setFacePhotoPreview(null);
    setFacePhotoValue(null);
    form.setFieldsValue({ facePhoto: null });
  }, [form]);

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
            </div>
          </div>
        ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.photo'),
        dataIndex: 'facePhotoUrl',
        width: 150,
        render: (value: string | undefined) =>
          value ? (
            <Image
              src={value}
              width={72}
              height={72}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            t('pages.common.text.none')
          ),
      },
      {
        title: t('pages.userManagement.keyPersonnel.columns.status'),
        dataIndex: 'status',
        width: 160,
        render: (value: KeyPersonItem['status'], record) => (
          <Tag color={statusColor[value]}>
            {statusLabelMap[value] ?? value ?? t('pages.common.text.unknown')}
          </Tag>
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
          loading={loading}
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
          {editingRecord && (
            <Form.Item
              label={t('pages.userManagement.keyPersonnel.form.labels.id')}
              name="id"
            >
              <Input disabled />
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
          </Row>
          <Row gutter={16}>
            <Col span={24}>
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
            <Col span={24}>
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="人脸照片"
                name="facePhoto"
                rules={[
                  {
                    required: true,
                    message: '请上传人脸照片',
                  },
                ]}
              >
                <div>
                  {!facePhotoPreview ? (
                    <Upload
                      beforeUpload={handleFacePhotoUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>上传人脸照片</Button>
                    </Upload>
                  ) : (
                    <div>
                      <Image
                        src={facePhotoPreview}
                        alt="Face Photo"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          marginBottom: 8,
                        }}
                      />
                      <br />
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={removeFacePhoto}
                        size="small"
                        danger
                      >
                        删除照片
                      </Button>
                    </div>
                  )}
                  <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                    请上传清晰的人脸照片，文件大小不超过500KB
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default KeyPersonnel;
