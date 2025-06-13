import React, { useEffect, useRef, useState } from 'react';
import { useHandleDevice } from '../HID/HandleDeviceContext';
import { Button, Table, Card, ConfigProvider, Switch, theme, Typography } from 'antd';
import { Skeleton } from "antd";
import SendArea from './SendArea';

const { Text } = Typography;

const LayoutRoot = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 检查系统主题偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const {
    device,
    handleOpenDevice,
    reportContent,
    setReportContent,
    deviceLog,
    setDeviceLog,
    setDevice,
    setDeviceStatus,
    setDeviceName,
    setDeviceProductId,
  } = useHandleDevice();

  const logTextAreaRef = useRef(null);
  const reportTextAreaRef = useRef(null);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (logTextAreaRef.current) {
      const logTextArea = logTextAreaRef.current;
      logTextArea.scrollTop = logTextArea.scrollHeight;
    }
  }, [deviceLog]);

  useEffect(() => {
    if (reportTextAreaRef.current) {
      const reportTextArea = reportTextAreaRef.current;
      reportTextArea.scrollTop = reportTextArea.scrollHeight;
    }
  }, [reportContent]);

  const handleConnectDevice = async () => {
    handleOpenDevice();
  };

  const handleDisconnectDevice = async () => {
    if (device && device.opened) {
      try {
        setDevice(null);
        await device.close();
        await device.forget()
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
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { motion: false }
      }}
    >
      <div style={{ background: isDarkMode ? '#141414' : '#ffffff', height: '100vh' }}>
        <div className='container'>
          <div className='layout-root'>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className='left-panel' style={{ width: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <Text className='title'>HID 网页调试工具</Text>
                  <Switch
                    checked={isDarkMode}
                    onChange={setIsDarkMode}
                    checkedChildren="🌙"
                    unCheckedChildren="☀️"
                  />
                </div>
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
                  <div style={{ display: 'flex', gap: '0px', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ flex: 1 }}><Text>日志区</Text></div>
                    <Button onClick={handleClearLog}>清空日志区</Button>
                  </div>
                  <Card size="small">
                    <div style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', height: '188px', overflow: 'auto' }} ref={logTextAreaRef} id="iptLog">
                      {deviceLog}
                    </div>
                  </Card>
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '0px', alignItems: 'center', marginTop: '12px', marginBottom: '6px' }}>
                    <div style={{ flex: 1 }}><Text>接收区</Text></div>
                    <Button onClick={handleClearReportContent}>清空接收区</Button>
                  </div>
                  <Card size="small" >
                    <div style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', height: 'calc(100vh - 370px)', overflow: 'auto' }} ref={reportTextAreaRef} id="iptLog">
                      {reportContent}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default LayoutRoot;