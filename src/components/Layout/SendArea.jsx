import { useState, useEffect } from 'react';
import { Button, Input, Tooltip, InputNumber, Typography } from 'antd';
import { useHandleDevice } from '../HID/HandleDeviceContext';
import HexConvert from '../Utils/HexConvert';
import BulkSend from './BulkSend';
import UploadFile from './UploadFile';
import Shortcut from './Shortcut';

const { Text } = Typography;

const { TextArea } = Input;

const LOCAL_TOTALBYTES_KEY = 'hid_sendarea_totalbytes';

function loadTotalBytes() {
  try {
    const data = localStorage.getItem(LOCAL_TOTALBYTES_KEY);
    if (data) {
      const n = parseInt(data, 10);
      if (!isNaN(n) && n > 0) return n;
    }
  } catch (e) {}
  return 32; // 默认32
}

function saveTotalBytes(n) {
  localStorage.setItem(LOCAL_TOTALBYTES_KEY, String(n));
}

const defaultValue = 'F5 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ';

function padBytes(str, totalBytes) {
  // 以空格分割，过滤空字符串
  let arr = str.trim().split(/\s+/).filter(Boolean);
  if (arr.length >= totalBytes) {
    return arr.slice(0, totalBytes).join(' ') + ' ';
  }
  // 补全
  let padded = arr.concat(Array(totalBytes - arr.length).fill('00'));
  return padded.join(' ') + ' ';
}

const SendArea = () => {
  const [outputData, setOutputData] = useState(defaultValue);
  const { send_data } = useHandleDevice();

  // 新增：补全字节功能
  const [totalBytes, setTotalBytes] = useState(() => loadTotalBytes());

  useEffect(() => {
    // 如果 localStorage 没有 totalBytes，则自动根据默认值推断字节数并存储
    const arr = defaultValue.trim().split(/\s+/).filter(Boolean);
    if (!localStorage.getItem(LOCAL_TOTALBYTES_KEY)) {
      setTotalBytes(arr.length);
      saveTotalBytes(arr.length);
    }
  }, []);

  // 一键补全按钮事件
  const handlePadBytes = () => {
    setOutputData(prev => padBytes(prev, totalBytes));
  };

  // 处理总字节数变化
  const handleTotalBytesChange = (v) => {
    const n = v || 1;
    setTotalBytes(n);
    saveTotalBytes(n);
  };

  const sendData = async () => {
    send_data(outputData);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <Text style={{ flex: 1 }}>发送区</Text>
        <UploadFile totalBytes={totalBytes} setOutputData={setOutputData} />
      </div>

      <TextArea
        value={outputData}
        onChange={(e) => setOutputData(e.target.value)}
        autoSize={{ minRows: 5 }}
        style={{ minHeight: 60, maxHeight: 600, resize: 'vertical' }}
        placeholder="支持粘贴/上传十六进制数据，多个包可用换行分隔"
      />
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            id="btnSend"
            style={{ width: '100px' }}
            onClick={sendData}
            type="primary"
          >
            发送数据
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
          <Text>总字节数:</Text>
          <InputNumber
            min={1}
            max={256}
            value={totalBytes}
            onChange={handleTotalBytesChange}
            style={{ width: 70 }}
            size="small"
          />
          <Tooltip title="用00补全到指定字节数">
            <Button
              size="small"
              onClick={handlePadBytes}
              style={{ marginLeft: 4 }}
            >
              一键补全
            </Button>
          </Tooltip>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <BulkSend outputData={outputData} totalBytes={totalBytes} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <Shortcut outputData={outputData} setOutputData={setOutputData} />
      </div>

      <div style={{ marginTop: '20px' }}>
        <HexConvert />
      </div>
    </div>
  )
};

export default SendArea;