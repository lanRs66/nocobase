/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { DatabaseOutlined, ExclamationCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { useT } from '../../../locale';
import { useToken } from '@nocobase/client';
import { useChatToolsStore } from '../../chatbox/stores/chat-tools';
import { ToolCall } from '../../types';
import { CollectionDataType } from '../types';
import { useChatMessagesStore } from '../../chatbox/stores/chat-messages';

export const DataModelingCard: React.FC<{
  messageId: string;
  tool: ToolCall<{
    collections: CollectionDataType[];
  }>;
}> = ({ messageId, tool }) => {
  const t = useT();
  const { token } = useToken();

  const responseLoading = useChatMessagesStore.use.responseLoading();
  const messages = useChatMessagesStore.use.messages();
  const setOpen = useChatToolsStore.use.setOpenToolModal();
  const setActiveTool = useChatToolsStore.use.setActiveTool();
  const setActiveMessageId = useChatToolsStore.use.setActiveMessageId();
  const toolsByMessageId = useChatToolsStore.use.toolsByMessageId();
  const version = toolsByMessageId[messageId]?.[tool.id]?.version;
  const generating = responseLoading && messages[length - 1]?.content.messageId === messageId;

  let description = <>{t('Please review and finish the process')}</>;
  if (generating) {
    description = (
      <>
        <Spin indicator={<LoadingOutlined spin />} size="small" /> {t('Generating...')}
      </>
    );
  }
  if (!tool.args.collections) {
    console.error('Invalid definition', tool.args);
    description = (
      <>
        <ExclamationCircleTwoTone twoToneColor="#eb2f96" /> {t('Invalid definition')}
      </>
    );
  }

  return (
    <>
      <Card
        style={{
          marginBottom: '16px',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (generating || !tool.args.collections) {
            return;
          }
          setActiveTool(tool);
          setActiveMessageId(messageId);
          setOpen(true);
        }}
      >
        <Card.Meta
          avatar={<DatabaseOutlined />}
          title={
            <>
              {t('Data modeling')}
              {version && version > 1 ? (
                <span
                  style={{
                    marginLeft: '8px',
                    color: token.colorTextDescription,
                    // fontSize: token.fontSizeSM,
                    fontWeight: 'normal',
                    fontStyle: 'italic',
                  }}
                >
                  {t('Version')} {version}
                </span>
              ) : null}
            </>
          }
          description={description}
        />
      </Card>
    </>
  );
};
