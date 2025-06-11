import React, { useState, useEffect, createContext, useContext } from 'react';

export const HandleDeviceContext = createContext({
  device: null,
  deviceStatus: 'no-device',
  deviceName: null,
  deviceProductId: null,
  reportContent: null,
  setReportContent: () => {},
  deviceLog: null,
  setDeviceLog: () => {},
  setDevice: () => {},
  setDeviceStatus: () => {},
  setDeviceName: () => {},
  setDeviceProductId: () => {},
  handleOpenDevice: () => {},
  addToQueue: () => {},
  dataQueue: () => {},
});

class DataQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.send_data = null;
  }

  setSendData(sendDataFn) {
    this.send_data = sendDataFn;
  }

  addToQueue(data) {
    let cleanString = data.replace(/\s+/g, '');

    // 计算现有字符串的字节数
    const currentLength = cleanString.length / 2; // 每两个字符是一个字节

    // 计算需要补充的字节数
    const neededLength = 32 - currentLength;

    // 如果需要补充字节，填充 '00' 到剩余长度
    if (neededLength > 0) {
        cleanString += '00'.repeat(neededLength); // 补充 '00'
    }

    this.queue.push(cleanString.match(/.{2}/g).join(' '));
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    if (this.queue.length > 0 && this.send_data) {
      const data = this.queue.shift();
      await this.send_data(data);
    }
  }

  continueProcessing() {
    if (this.queue.length > 0) {
      this.processQueue();
    } else {
      this.isProcessing = false;
    }
  }

  reset() {
    this.queue = [];
    this.isProcessing = false;
  }
}

export function HandleDeviceProvider({ children }) {
  const [device, setDevice] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('no-device');
  const [deviceName, setDeviceName] = useState(null);
  const [deviceProductId, setDeviceProductId] = useState(null);
  const [reportContent, setReportContent] = useState('');
  const [deviceLog, setDeviceLog] = useState('');
  const [dataQueue] = useState(() => new DataQueue());

  const send_data = async (iptOutput) => {
    try {
      if (!device?.opened) {
        setDeviceLog(prev => prev ? prev + '\n' + '[INFO] 未发现设备' : '[INFO] 未发现设备');
        throw "Device not opened";
      }
      let outputData;
      let outputDatastr = iptOutput.replace(/\s+/g, "");

      if (outputDatastr.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(outputDatastr)) {
        const byteLength = outputDatastr.length / 2;
        outputData = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
          outputData[i] = parseInt(outputDatastr.substr(i * 2, 2), 16);
        }
      } else {
        throw "Data is not even or 0-9、a-f、A-F";
      }
      await device.sendReport(0, outputData);
      setDeviceLog(prev => prev ? prev + '\n' + '[INFO] 数据发送成功' : '[INFO] 数据发送成功');
    } catch (error) {
      setDeviceLog(prev => prev ? prev + '\n' + '[ERROR] 数据发送失败: ' + error : '[ERROR] 数据发送失败: ' + error);
      dataQueue.reset(); // Reset queue on error
    }
  };

  useEffect(() => {
    dataQueue.setSendData(send_data);
    const initializeDevice = async () => {
      try {
        const devices = await navigator.hid.getDevices();

        if (devices.length === 0) {
          console.log("No device paired");
          return;
        }

        devices.forEach((tmp_device) => {
          if (tmp_device.collections[0].outputReports && tmp_device.collections[0].outputReports.length > 0) {
            setDevice(tmp_device);
          }
        });

        if (device && !device.opened) {
          try {
            await device.open();
            setDeviceStatus('connected-device');
            setDeviceName(`${device.productName}`);
            device_oninputreport(device);
          } catch (error) {
            if (error.name === 'InvalidStateError') {
              console.log('Device state change already in progress, skipping...');
            } else {
              console.error(error);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    initializeDevice();

    navigator.hid.onconnect = (event) => {
      console.log("HID connected: ", event.device);
      if (event.device.collections[0].outputReports && event.device.collections[0].outputReports.length > 0) {
        dataQueue.reset(); // Reset queue on new connection
        setDevice(event.device);
        event.device.open().then(() => {
          setDeviceStatus('connected-device');
          setDeviceName(`${event.device.productName}`);
          device_oninputreport(event.device);
          setDeviceLog(prev => prev ? prev + '\n' : '') + '[INFO] 设备自动连接成功';
        });
      }
    };

    navigator.hid.ondisconnect = (event) => {
      if (event.device.collections[0].outputReports && event.device.collections[0].outputReports.length > 0) {
        dataQueue.reset(); // Reset queue on disconnect
        setDevice(null);
        setDeviceStatus('no-device');
        setDeviceName(null);
        setDeviceProductId(null);
        setDeviceLog(prev => prev ? prev + '\n' : '') + '[INFO] 已断开连接';
      }
    };
  }, [device]);

  const handleOpenDevice = async () => {
    console.log("handleOpenDevice");
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [
          { // EZ80 自研新固件
            usagePage: 0xff60,
            usage: 0x61,
            productId: 9010,
            vendorId: 13495,
          },
          { // EZ80 自研新固件更新状态
            usagePage: 0xff60,
            usage: 0x61,
            productId: 4660,
            vendorId: 13495,
          },
          { // EZ75 自研新固件
            usagePage: 0xff60,
            usage: 0x61,
            productId: 29952,
            vendorId: 117,
          },
          { // EZ75 自研新固件更新状态
            usagePage: 0xff60,
            usage: 0x61,
            productId: 29953,
            vendorId: 117,
          },
          { // 新EZ60
            usagePage: 0xff60,
            usage: 0x61,
            productId: 36880,
            vendorId: 51966,
          },
          { // 新EZ63 新固件
            usagePage: 0xff60,
            usage: 0x61,
            productId: 36869,
            vendorId: 51966,
          },
          { // EZ63 老固件
            usagePage: 0xff60,
            usage: 0x61,
            productId: 32773,
            vendorId: 51966,
          },
          { // EZ63 自研新固件
            usagePage: 0xff60,
            usage: 0x61,
            productId: 25344,
            vendorId: 99,
          },
          { // EZ63 自研新固件更新状态
            usagePage: 0xff60,
            usage: 0x61,
            productId: 25345,
            vendorId: 99,
          },
          { // EZ60
            usagePage: 0xff60,
            usage: 0x61,
            productId: 32784,
            vendorId: 51966,
          }
        ]
      });

      if (devices.length === 0) {
        console.log("No device selected");
        return;
      }

      const selectedDevice = devices[0];
      dataQueue.reset(); // Reset queue before setting new device
      setDevice(selectedDevice);

      if (!selectedDevice.opened) {
        await selectedDevice.open();
        setDeviceStatus('connected-device');
        setDeviceName(`${selectedDevice.productName}`);
        setDeviceLog(prev => prev ? prev + '\n' : '') + '[INFO] 设备连接成功';
        const waitForDeviceOpen = () => {
          if (selectedDevice.opened) {
            device_oninputreport(selectedDevice);
          } else {
            setTimeout(waitForDeviceOpen, 100);
          }
        };
        waitForDeviceOpen();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const device_oninputreport = (selectedDevice) => {
    console.log(selectedDevice);
    if (selectedDevice) {
      setDeviceProductId(selectedDevice.productId);
      selectedDevice.oninputreport = (event) => {
        let array = new Uint8Array(event.data.buffer);
        let hexstr = "";
        for (const data of array) {
          hexstr += (Array(2).join(0) + data.toString(16).toUpperCase()).slice(-2) + " ";
        }

        setReportContent(prev => prev ? prev + "\n" + hexstr : hexstr);

        if (dataQueue.isProcessing) {
          dataQueue.isProcessing = false;
          dataQueue.continueProcessing();
        }
      };
    }
  };

  return (
    <HandleDeviceContext.Provider value={{
      device,
      deviceStatus,
      deviceName,
      deviceProductId,
      reportContent,
      deviceLog,
      setDeviceLog,
      setReportContent,
      setDevice,
      setDeviceStatus,
      setDeviceName,
      setDeviceProductId,
      handleOpenDevice,
      addToQueue: (data) => dataQueue.addToQueue(data),
      send_data,
      dataQueue,
    }}>
      {children}
    </HandleDeviceContext.Provider>
  );
}

export function useHandleDevice() {
  return useContext(HandleDeviceContext);
}