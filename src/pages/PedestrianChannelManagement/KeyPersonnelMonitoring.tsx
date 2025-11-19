import React, { useMemo } from 'react';
import { useRequest } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import { Card, Col, List, Row, Statistic, Table, Tag } from 'antd';
import type { ChannelFocusItem, ChannelWatchEvent, ChannelWatchResponse } from '@/services/pedestrian';
import { getChannelWatch } from '@/services/pedestrian';

const statusColor: Record<ChannelFocusItem['status'], string> = {
  待核查: 'orange',
  跟踪中: 'blue',
  已处理: 'green',
};

const KeyPersonnelMonitoring: React.FC = () => {
  const { data, loading } = useRequest(getChannelWatch, {
    formatResult: (res: ChannelWatchResponse | { data: ChannelWatchResponse }) =>
      (res as { data?: ChannelWatchResponse })?.data ?? (res as ChannelWatchResponse),
  });

  const metrics = data?.metrics ?? {
    watchlist: 0,
    hitsToday: 0,
    onlineTasks: 0,
    lastPush: '--',
  };
  const persons = data?.persons ?? [];
  const events = data?.events ?? [];

  const columns: ColumnsType<ChannelFocusItem> = useMemo(
    () => [
      {
        title: '姓名',
        dataIndex: 'personName',
        width: 160,
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
              {record.gender} · {record.age} 岁
            </div>
          </div>
        ),
      },
      { title: '标签', dataIndex: 'tags', width: 220, render: (tags: string[]) => (
        <span>
          {tags.map((tag) => (
            <Tag color="purple" key={tag}>
              {tag}
            </Tag>
          ))}
        </span>
      ) },
      { title: '通道', dataIndex: 'channelName', width: 200 },
      { title: '最近出现', dataIndex: 'lastSeen', width: 180 },
      { title: '状态', dataIndex: 'status', width: 140, render: (value: ChannelFocusItem['status']) => <Tag color={statusColor[value]}>{value}</Tag> },
    ],
    [],
  );

  return (
    <PageContainer header={{ title: '重点人员监控' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="重点库人员" value={metrics.watchlist} suffix="人" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="今日命中" value={metrics.hitsToday} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="跟进任务" value={metrics.onlineTasks} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic title="最新推送" value={metrics.lastPush} />
          </Card>
        </Col>
      </Row>

      <Card title="重点人员列表" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 8 }}>
        <Table<ChannelFocusItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={persons}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Card title="事件记录" style={{ marginTop: 24 }}>
        <List
          dataSource={events}
          renderItem={(event: ChannelWatchEvent) => (
            <List.Item key={event.id}>
              <List.Item.Meta
                title={`${event.personName} · ${event.eventType}`}
                description={`时间：${event.time} · 动作：${event.action}`}
              />
              <Tag>{event.operator}</Tag>
            </List.Item>
          )}
        />
        {!events.length && <div style={{ textAlign: 'center', padding: 16 }}>暂无事件</div>}
      </Card>
    </PageContainer>
  );
};

export default KeyPersonnelMonitoring;
