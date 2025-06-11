import React, { useState } from 'react';
import { useHandleDevice } from '../HID/HandleDeviceContext';
import { Button, Spin } from 'antd';

const LayoutRoot = () => {
  const { device, deviceStatus, deviceName, handleOpenDevice } = useHandleDevice();

  const [log, setLog] = useState('');
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('F5');

  const handleConnectDevice = () => {
    console.log('连接设备');
    // 你的连接设备逻辑
  };

  const handleClearLog = () => {
    setLog('');
  };

  const handleClearInput = () => {
    setInputData('');
  };

  const handleSendData = () => {
    console.log('发送数据:', outputData);
    // 你的发送逻辑
  };

  const handleEnterBootloader = () => {
    console.log('进入Bootloader');
    // 进入Bootloader逻辑
  };
  return (
    <div className="">
      {!device && <div id="device-connect">
          <Button color="#1668dc" style={{cursor: "pointer"}} onClick={handleOpenDevice}>连接设备</Button>
      </div>}
      {device && <div>
        <div>{deviceName}</div>
      </div>}

      <div style="margin-top:2rem;font-size:2rem;font-weight:700;color:var(--primary);letter-spacing:0.01em;text-align:center;">HID 网页调试工具</div>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 日志面板 */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '200px' }}>
          <div className="panel-header">发送日志</div>
          <div className="panel-actions" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button id="btnOpen" onClick={handleConnectDevice}>连接设备</button>
            <button id="btnClearLog" onClick={handleClearLog}>清空日志</button>
          </div>
          <textarea
            id="iptLog"
            readOnly
            value={log}
            style={{ flex: 1 }}
          />
        </div>

        {/* 数据与操作面板 */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="panel-header">发送数据与操作</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="panel-header">已接收数据</div>
            <div id="btnClear" onClick={handleClearInput} style={{ cursor: 'pointer' }}>清空接收区</div>
          </div>
          <textarea
            id="iptInput"
            readOnly
            value={inputData}
            style={{ flex: 1 }}
          />

          <div className="panel-header">发送区</div>
          <textarea
            id="iptOutput"
            value={outputData}
            onChange={(e) => setOutputData(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button id="btnSend" style={{ width: '100px' }} onClick={handleSendData}>
              发送数据
            </button>
            <button id="bootloader" onClick={handleEnterBootloader}>
              进入Bootloader
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutRoot;