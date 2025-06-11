import { useState } from 'react';
import { Button, Input } from 'antd';
import { useHandleDevice } from '../HID/HandleDeviceContext';

const { TextArea } = Input;

const SendArea = () => {
  const [outputData, setOutputData] = useState('F5 05 31 2E 30 2E 32 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ');
  const { addToQueue } = useHandleDevice();

  const sendData = async () => {
    addToQueue(outputData);
  };

  return (
    <div>
      <div>发送区</div>
      <TextArea
        value={outputData}
        onChange={(e) => setOutputData(e.target.value)}
        autoSize={{ minRows: 5 }}
        style={{ minHeight: 60, resize: 'vertical' }}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
        <Button
          id="btnSend"
          style={{ width: '100px' }}
          onClick={sendData}
          type="primary"
        >
          发送数据
        </Button>
      </div>
    </div>
  )
};

export default SendArea;