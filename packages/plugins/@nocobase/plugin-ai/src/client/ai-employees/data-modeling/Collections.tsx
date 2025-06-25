/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Generating } from '../chatbox/markdown/Generating';
import { useChatMessages } from '../chatbox/ChatMessagesProvider';
import { Card, Modal, Tabs } from 'antd';
import { DatabaseOutlined, FileTextOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { useT } from '../../locale';
import { CodeInternal } from '../chatbox/markdown/Code';
import { Diagram } from './Diagram';
import { Table } from './Table';
import { useAPIClient, useApp } from '@nocobase/client';

const TabPane: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div
      style={{
        height: '70vh',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
};

export const DataModelingModal: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
  collections: any[];
}> = ({ open, setOpen, collections }) => {
  const t = useT();
  const api = useAPIClient();
  const app = useApp();
  const fim = app.dataSourceManager.collectionFieldInterfaceManager;

  const items = [
    {
      key: 'collections',
      label: t('Collections'),
      icon: <DatabaseOutlined />,
      children: <Table collections={collections} />,
    },
    {
      key: 'graph',
      icon: <NodeIndexOutlined />,
      label: t('Diagram'),
      children: (
        <TabPane>
          <Diagram collections={collections} />
        </TabPane>
      ),
    },
    {
      key: 'definition',
      icon: <FileTextOutlined />,
      label: 'Definition',
      children: (
        <TabPane>
          <CodeInternal language="json" value={JSON.stringify(collections, null, 2)} />
        </TabPane>
      ),
    },
  ];
  return (
    <Modal
      open={open}
      width="90%"
      onCancel={() => {
        setOpen(false);
      }}
      okText={t('Finish review and apply')}
      onOk={async () => {
        await api.resource('ai').defineCollections({
          values: {
            collections,
          },
        });
        setOpen(false);
      }}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  );
};

const useCollections = (collectionsStr: string) => {
  const app = useApp();
  const fim = app.dataSourceManager.collectionFieldInterfaceManager;
  return useMemo(() => {
    const result = [];
    let collections = [];
    try {
      collections = JSON.parse(collectionsStr);
    } catch (e) {
      return [];
    }
    for (const collection of collections) {
      const fields = collection.fields.map((field: any) => {
        const fieldInterface = fim.getFieldInterface(field.interface);
        if (fieldInterface) {
          field.type = fieldInterface.default?.type || field.type;
          field.uiSchema = fieldInterface.default?.uiSchema || field.uiSchema;
        }
        field.uiSchema = {
          ...field.uiSchema,
          title: field.title,
        };
        if (field.enum) {
          field.uiSchema = {
            ...field.uiSchema,
            enum: field.enum,
          };
        }
        return field;
      });
      result.push({
        ...collection,
        fields,
      });
    }
    return result;
  }, [collectionsStr]);
};

export const Collections = (props: any) => {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const { children, className, message, index, ...rest } = props;
  const { responseLoading } = useChatMessages();
  const collectionsStr = String(children).replace(/\n$/, '');
  const collections = useCollections(collectionsStr);

  if (responseLoading && !message.messageId) {
    return <Generating />;
  }

  return (
    <>
      <Card
        style={{
          marginBottom: '16px',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(true)}
      >
        <Card.Meta
          avatar={<DatabaseOutlined />}
          title={t('Data modeling')}
          description={t('Please review and finish the process')}
        />
      </Card>
      <DataModelingModal open={open} setOpen={setOpen} collections={collections} />
    </>
  );
};
