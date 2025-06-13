import { Button, Upload, Tooltip, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';

const UploadFile = ({ totalBytes, setOutputData }) => {
  const [uploading, setUploading] = useState(false);

  // 解析文件为十六进制字符串数组
  function fileToHexChunks(file, totalBytes, cb) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const buffer = new Uint8Array(e.target.result);
      let hexArr = [];
      for (let i = 0; i < buffer.length; i++) {
        hexArr.push(buffer[i].toString(16).toUpperCase().padStart(2, '0'));
      }
      const chunks = [];
      for (let i = 0; i < hexArr.length; i += totalBytes) {
        let chunk = hexArr.slice(i, i + totalBytes);
        if (chunk.length < totalBytes) {
          chunk = chunk.concat(Array(totalBytes - chunk.length).fill('00'));
        }
        chunks.push(chunk.join(' ') + ' ');
      }
      cb(chunks);
    };
    reader.onerror = function () {
      message.error('文件读取失败');
    };
    reader.readAsArrayBuffer(file);
  }

  // 文件上传处理
  const handleFileUpload = (file) => {
    setUploading(true);
    fileToHexChunks(file, totalBytes, (chunks) => {
      setOutputData(chunks.join('\n'));
      setUploading(false);
      message.success('文件已解析为十六进制并填充到发送区');
    });
    return false; // 阻止自动上传
  };

  return <div>
    <Upload
      beforeUpload={handleFileUpload}
      showUploadList={false}
      accept=".bin,.hex,.uf2"
      disabled={uploading}
    >
      <Tooltip title="上传文件并按总字节数分包">
        <Button
          icon={<UploadOutlined />}
          size="small"
          loading={uploading}
          style={{ marginLeft: 8 }}
        >
          上传文件
        </Button>
      </Tooltip>
    </Upload>
  </div>;
};

export default UploadFile;