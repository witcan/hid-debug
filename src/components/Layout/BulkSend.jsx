import { Button, InputNumber, Space, Typography } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { CaretRightOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useHandleDevice } from '../HID/HandleDeviceContext';

const { Text } = Typography;

const BulkSend = ({ outputData, totalBytes }) => {
  // 批量发送区块
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [isBatchPaused, setIsBatchPaused] = useState(false);
  const [batchInterval, setBatchInterval] = useState(10); // ms
  const [batchList, setBatchList] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const { send_data } = useHandleDevice();
  const batchTimerRef = useRef(null);
  // 批量发送定时器
  useEffect(() => {
    if (isBatchSending && !isBatchPaused && batchList.length > 0) {
      batchTimerRef.current = setTimeout(async () => {
        if (batchIndex < batchList.length) {
          send_data(batchList[batchIndex]);
          setBatchIndex(idx => idx + 1);
        } else {
          setIsBatchSending(false);
          setBatchIndex(0);
          setBatchList([]);
        }
      }, batchInterval);
    } else {
      clearTimeout(batchTimerRef.current);
    }
    return () => clearTimeout(batchTimerRef.current);
    // eslint-disable-next-line
  }, [isBatchSending, isBatchPaused, batchIndex, batchList, batchInterval]);

  // 将字符串转为按字节分组的数组
  function splitToChunks(str, totalBytes) {
    let arr = str.trim().split(/\s+/).filter(Boolean);
    let chunks = [];
    for (let i = 0; i < arr.length; i += totalBytes) {
      let chunk = arr.slice(i, i + totalBytes);
      if (chunk.length < totalBytes) {
        chunk = chunk.concat(Array(totalBytes - chunk.length).fill('00'));
      }
      chunks.push(chunk.join(' ') + ' ');
    }
    return chunks;
  }


  // 批量发送：将当前内容按总字节数分割后批量发送
  const handleBatchSend = () => {
    const chunks = splitToChunks(outputData, totalBytes);
    if (chunks.length === 0) {
      message.warning('没有可发送的数据');
      return;
    }
    setBatchList(chunks);
    setBatchIndex(0);
    setIsBatchSending(true);
    setIsBatchPaused(false);
  };

  // 停止批量发送
  const handleBatchStop = () => {
    setIsBatchSending(false);
    setBatchIndex(0);
    setBatchList([]);
    setIsBatchPaused(false);
  };

  // 暂停/继续批量发送
  const handleBatchPauseResume = () => {
    setIsBatchPaused(paused => !paused);
  };

  const renderBatchControls = () => {
    if (!isBatchSending) {
      return (
        <>
          <Button
            onClick={handleBatchSend}
            type="dashed"
            style={{ width: '100px' }}
          >
            批量发送
          </Button>
          <Text style={{ marginLeft: 8 }}>
            间隔(ms):
            <InputNumber
              min={10}
              max={10000}
              step={10}
              value={batchInterval}
              onChange={setBatchInterval}
              size="small"
              style={{ width: 80, marginLeft: 4 }}
              disabled={isBatchPaused}
            />
          </Text>
        </>
      );
    }
    return (
      <Space>
        <Button
          icon={isBatchPaused ? <CaretRightOutlined /> : <PauseCircleOutlined />}
          onClick={handleBatchPauseResume}
        >
          {isBatchPaused ? '继续' : '暂停'}
        </Button>
        <Button
          icon={<StopOutlined />}
          danger
          onClick={handleBatchStop}
        >
          停止
        </Button>
        <Text>
          进度: {batchIndex}/{batchList.length}
        </Text>
        <Text>
          间隔(ms):
          <InputNumber
            min={10}
            max={10000}
            step={10}
            value={batchInterval}
            onChange={setBatchInterval}
            size="small"
            style={{ width: 80, marginLeft: 4 }}
            disabled={isBatchPaused}
          />
        </Text>
      </Space>
    );
  };
  return (
    <div>
      {renderBatchControls()}
    </div>
  );
};

export default BulkSend;