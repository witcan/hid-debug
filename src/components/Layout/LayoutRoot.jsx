import React, { useState, useEffect, useRef } from 'react';
import { useHandleDevice } from '../HID/HandleDeviceContext';
import { Button, Input, Table } from 'antd';
import { Skeleton } from "antd";
import SendArea from './SendArea';

const { TextArea } = Input;

const LayoutRoot = () => {
  const {
    device,
    handleOpenDevice,
    reportContent,
    setReportContent,
    deviceLog,
    setDeviceLog,
    setDevice, // for disconnect
    setDeviceStatus, // for disconnect
    setDeviceName, // for disconnect
    setDeviceProductId, // for disconnect
  } = useHandleDevice();

  // 新增: 用于日志自动滚动到底部
  const logTextAreaRef = useRef(null);
  const reportTextAreaRef = useRef(null);

  useEffect(() => {
    if (
      logTextAreaRef.current &&
      logTextAreaRef.current.resizableTextArea &&
      logTextAreaRef.current.resizableTextArea.textArea
    ) {
      const logTextArea = logTextAreaRef.current.resizableTextArea.textArea;
      logTextArea.scrollTop = logTextArea.scrollHeight || 0;
    }
  }, [deviceLog]);

  useEffect(() => {
    if (
      reportTextAreaRef.current &&
      reportTextAreaRef.current.resizableTextArea &&
      reportTextAreaRef.current.resizableTextArea.textArea
    ) {
      const reportTextArea = reportTextAreaRef.current.resizableTextArea.textArea;
      reportTextArea.scrollTop = reportTextArea.scrollHeight || 0;
    }
  }, [reportContent]);

  const handleConnectDevice = async () => {
    handleOpenDevice();
  };

  // 新增: 断开设备逻辑
  const handleDisconnectDevice = async () => {
    if (device && device.opened) {
      try {
        setDevice(null);
        await device.close(); // 关闭设备
        await device.forget() // 遗忘设备
      } catch (e) {
        // ignore error
      }
    }
    setDeviceStatus && setDeviceStatus('no-device');
    setDeviceName && setDeviceName(null);
    setDeviceProductId && setDeviceProductId(null);
    setDeviceLog(prev => prev ? prev + '\n' + '[SYS] 设备已断开' : '[SYS] 设备已断开');
  };

  const handleClearLog = () => {
    setDeviceLog('');
  };

  const handleClearReportContent = () => {
    setReportContent('');
  };

  return (
    <div>
      <div className='layout-root'>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className='left-panel' style={{ width: '400px' }}>
            <div className='title'>HID 网页调试工具</div>
            <div style={{ marginBottom: '16px' }}>
              {device && device.opened ? (
                <Button
                  onClick={handleDisconnectDevice}
                  type="primary"
                  danger
                  block
                >
                  断开设备
                </Button>
              ) : (
                <Button
                  onClick={handleConnectDevice}
                  type="primary"
                  block
                >
                  连接设备
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Table
                size="small"
                pagination={false}
                showHeader={false}
                style={{ marginBottom: 16 }}
                columns={[
                  { title: '属性', dataIndex: 'label', key: 'label', width: 90 },
                  { title: '值', dataIndex: 'value', key: 'value' },
                ]}
                dataSource={[
                  {
                    key: 'deviceName',
                    label: '设备名称',
                    value: (
                      <>
                        {device?.productName ? (
                          <span
                            style={{
                              display: 'inline-block',
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              verticalAlign: 'bottom',
                            }}
                            title={device.productName}
                          >
                            {device.productName}
                          </span>
                        ) : (
                          <Skeleton.Button size="small" style={{ width: 80 }} />
                        )}
                      </>
                    ),
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
                        <Skeleton.Button size="small" style={{ width: 80 }} />
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
                        <Skeleton.Button size="small" style={{ width: 80 }} />
                      ),
                  },
                ]}
              />
            </div>
            <div>
              <SendArea />
            </div>
          </div>
          <div className='right-panel' style={{ flex: 1 }}>
            <div>
              <div style={{ display: 'flex', gap: '0px', alignItems: 'center' }}>
                <div>日志区</div>
                <Button onClick={handleClearLog} type="link">清空日志区</Button>
              </div>
              <TextArea
                readOnly
                value={deviceLog}
                style={{ height: '188px' }}
                ref={logTextAreaRef}
              />
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0px', alignItems: 'center', marginTop: '12px' }}>
                <div>接收区</div>
                <Button onClick={handleClearReportContent} type="link">
                  清空接收区
                </Button>
              </div>

              <TextArea
                readOnly
                value={reportContent}
                style={{ flex: 1, height: 'calc(100vh - 350px)', resize: 'vertical' }}
                ref={reportTextAreaRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutRoot;