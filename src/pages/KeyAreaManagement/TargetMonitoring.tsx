import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, List, Row, Statistic, Table, Tag, Timeline } from 'antd';
import type {
  FocusPersonItem,
  KeyAreaTargetResponse,
  PatrolRecordItem,
  TargetEventItem,
} from '@/services/keyArea';
import { getKeyAreaTargets } from '@/services/keyArea';

const statusColor: Record<FocusPersonItem['status'], string> = {
  跟踪中: 'orange',
  已核查: 'green',
  待核查: 'blue',
};

const riskColor: Record<FocusPersonItem['riskLevel'], string> = {
  低: 'default',
  中: 'orange',
  高: 'red',
};

const TargetMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getKeyAreaTargets, {
    formatResult: (res: KeyAreaTargetResponse | { data: KeyAreaTargetResponse }) =>
      (res as { data?: KeyAreaTargetResponse })?.data ?? (res as KeyAreaTargetResponse),
  });

  const metrics = data?.metrics ?? {
    watchlist: 0,
    hitsToday: 0,
    activeTracking: 0,
    lastPush: '--',
  };
  const focusPersons = data?.focusPersons ?? [];
  const events = data?.events ?? [];
  const patrols = data?.patrols ?? [];

  const columns: ColumnsType<FocusPersonItem> = useMemo(
    () => [
      {
        title: '姓名',
        dataIndex: 'name',
        width: 160,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{record.gender} · {record.age} 岁</div>
          </div>
        ),
      },
      {
        title: '标记标签',
        dataIndex: 'tags',
        width: 220,
        render: (tags: string[]) => (
          <span>
            {tags.map((tag) => (
              <Tag color="purple" key={tag}>
                {tag}
              </Tag>
            ))}
          </span>
        ),
      },
      {
        title: '最近出现',
        dataIndex: 'lastSeen',
        width: 180,
      },
      {
        title: '所在场所',
        dataIndex: 'areaName',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 140,
        render: (value: FocusPersonItem['status']) => <Tag color={statusColor[value]}>{value}</Tag>,
      },
      {
        title: '风险等级',
        dataIndex: 'riskLevel',
        width: 140,
        render: (value: FocusPersonItem['riskLevel']) => <Tag color={riskColor[value]}>{value}</Tag>,
      },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '重点人员监测' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="在册重点人员" value={metrics.watchlist} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日命中" value={metrics.hitsToday} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="跟踪处理中" value={metrics.activeTracking} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="最新推送" value={metrics.lastPush} />
          </Card>
        </Col>
      </Row>

      <Card title="重点人员列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<FocusPersonItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={focusPersons}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="事件时间线" bodyStyle={{ paddingTop: 16 }}>
            <Timeline
              items={events.map((event: TargetEventItem) => ({
                color: 'purple',
                children: (
                  <div>
                    <div style={{ fontWeight: 600 }}>{event.personName}</div>
                    <div style={{ color: 'rgba(0,0,0,0.65)' }}>{event.eventType} · {event.areaName}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>时间：{event.matchedAt}</div>
                    <div style={{ fontSize: 12 }}>处置：{event.action} · 责任人：{event.handler}</div>
                  </div>
                ),
              }))}
            />
            {!events.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无事件</div>}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="巡查记录" bodyStyle={{ paddingTop: 16 }}>
            <List
              dataSource={patrols}
              renderItem={(record: PatrolRecordItem) => (
                <List.Item key={record.id}>
                  <List.Item.Meta
                    title={`${record.areaName} · ${record.task}`}
                    description={
                      <div>
                        <div>{record.result}</div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>时间：{record.time}</div>
                      </div>
                    }
                  />
                  <Tag>{record.operator}</Tag>
                </List.Item>
              )}
            />
            {!patrols.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无巡查记录</div>}
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default TargetMonitoring;
