import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
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

const KeyPersonnel: React.FC = () => {
  const { data, loading } = useRequest(getKeyPersons, {
    formatResult: (res: KeyPersonResponse | { data: KeyPersonResponse }) =>
      (res as { data?: KeyPersonResponse })?.data ?? (res as KeyPersonResponse),
  });

  const summary = data?.summary ?? {
    total: 0,
    inControl: 0,
    expired: 0,
    highRisk: 0,
  };
  const persons = data?.persons ?? [];

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
        render: (value: KeyPersonItem['personType']) => (
          <Tag color={typeColor[value]}>{value}</Tag>
        ),
      },
      {
        title: '布控区域',
        dataIndex: 'controlAreas',
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
    ],
    [],
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

      <Card title="重点人员列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<KeyPersonItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={persons}
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
          scroll={{ x: 1400 }}
        />
      </Card>
    </PageContainer>
  );
};

export default KeyPersonnel;
