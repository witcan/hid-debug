import React, { useState, useEffect, useRef } from 'react';
import { useHandleDevice } from '../HID/HandleDeviceContext';
import { Button, Input, Table } from 'antd';

const { TextArea } = Input;

const LayoutRoot = () => {
  const {
    device,
    deviceStatus,
    deviceName,
    handleOpenDevice,
    addToQueue,
    reportContent,
    setReportContent,
    deviceLog,
    setDeviceLog,
  } = useHandleDevice();

  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('F5');
  const [isSending, setIsSending] = useState(false);
  const [isBootloader, setIsBootloader] = useState(false);

  // 新增: 用于日志自动滚动到底部
  const logTextAreaRef = useRef(null);

  useEffect(() => {
    if (
      logTextAreaRef.current &&
      logTextAreaRef.current.resizableTextArea &&
      logTextAreaRef.current.resizableTextArea.textArea
    ) {
      const textArea = logTextAreaRef.current.resizableTextArea.textArea;
      textArea.scrollTop = textArea.scrollHeight || 0;
    }
  }, [deviceLog]);

  const handleConnectDevice = async () => {
    handleOpenDevice()
  };

  const handleClearLog = () => {
    setDeviceLog('');
  };

  const handleClearReportContent = () => {
    setReportContent('');
  };

  const sendData = async () => {
    addToQueue(outputData);
  };

  return (
    <div className='layout-root'>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className='left-panel' style={{ width: '400px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Button
              id="btnOpen"
              onClick={handleConnectDevice}
              disabled={deviceStatus === 'connecting'}
              type="primary"
              block
            >
              连接设备
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {/*
              使用 antd 的 Table 组件来展示设备信息
            */}
            <Table
              size="small"
              pagination={false}
              showHeader={false}
              bordered
              style={{ marginBottom: 16 }}
              columns={[
                { title: '属性', dataIndex: 'label', key: 'label', width: 90 },
                { title: '值', dataIndex: 'value', key: 'value' },
              ]}
              dataSource={[
                {
                  key: 'deviceName',
                  label: '设备名称',
                  value: deviceName || '-',
                },
                {
                  key: 'pid',
                  label: 'PID',
                  value:
                    device && device.productId !== undefined ? (
                      <>
                        <span>
                          0x{device.productId.toString(16).toUpperCase().padStart(4, '0')}
                        </span>
                        <span style={{ margin: '0 6px' }}>/</span>
                        <span>
                          {device.productId}
                        </span>
                      </>
                    ) : (
                      '-'
                    ),
                },
                {
                  key: 'vid',
                  label: 'VID',
                  value:
                    device && device.vendorId !== undefined ? (
                      <>
                        <span>
                          0x{device.vendorId.toString(16).toUpperCase().padStart(4, '0')}
                        </span>
                        <span style={{ margin: '0 6px' }}>/</span>
                        <span>
                          {device.vendorId}
                        </span>
                      </>
                    ) : (
                      '-'
                    ),
                },
              ]}
            />
          </div>
          <div>
            <div>设备日志</div>
            <div>
              <Button onClick={handleClearLog} type="default">
                清空日志
              </Button>
            </div>
            <TextArea
              readOnly
              value={deviceLog}
              autoSize={{ minRows: 5 }}
              style={{ flex: 1, maxHeight: 320, resize: 'vertical' }}
              ref={logTextAreaRef}
            />
          </div>
        </div>
        <div className='right-panel' style={{ flex: 1 }}>
        <div>
          <div className="panel-header">接收区</div>
            <Button onClick={handleClearReportContent} type="default">
                清空接收区
              </Button>
            <TextArea
              readOnly
              value={reportContent}
              autoSize={{ minRows: 5 }}
              style={{ flex: 1, maxHeight: 320, resize: 'vertical' }}
            />
          </div>
          <div>
            <div className="panel-header">发送区</div>
            <TextArea
              value={outputData}
              onChange={(e) => setOutputData(e.target.value)}
              autoSize={{ minRows: 3 }}
              style={{ minHeight: 60, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <Button
                id="btnSend"
                style={{ width: '100px' }}
                onClick={sendData}
                type="primary"
                loading={isSending}
              >
                {isSending ? '发送中...' : '发送数据'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutRoot;