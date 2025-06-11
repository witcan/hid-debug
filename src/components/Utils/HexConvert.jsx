import React, { useState } from 'react';
import { Input, Row, Col, Card, Typography, message, Space, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
const { Text } = Typography;

const HexConvert = () => {
  const [hex, setHex] = useState('');
  const [dec, setDec] = useState('');
  const [lastEdit, setLastEdit] = useState('hex'); // 'hex' or 'dec'

  // Helper: validate and format hex string
  const formatHex = (value) => {
    let v = value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    // Remove leading 0x if present
    if (v.startsWith('0X')) v = v.slice(2);
    return v;
  };

  // When hex input changes
  const onHexChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    setHex(value);
    setLastEdit('hex');
    if (value === '') {
      setDec('');
      return;
    }
    try {
      const decValue = parseInt(value, 16);
      if (isNaN(decValue)) {
        setDec('');
      } else {
        setDec(decValue.toString(10));
      }
    } catch {
      setDec('');
    }
  };

  // When dec input changes
  const onDecChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    setDec(value);
    setLastEdit('dec');
    if (value === '') {
      setHex('');
      return;
    }
    try {
      const hexValue = parseInt(value, 10).toString(16).toUpperCase();
      setHex(hexValue);
    } catch {
      setHex('');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      message.success(`${label} 已复制`);
    });
  };

  return (
    <Card
      title="进制转换工具"
      size="small"
      style={{ maxWidth: 420, margin: '0 auto' }}
      bodyStyle={{ padding: 18 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Row align="middle" gutter={8}>
          <Col flex="80px">
            <Text strong>16进制</Text>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="如：1A2B"
              value={hex}
              onChange={onHexChange}
              maxLength={16}
              allowClear
              autoComplete="off"
              spellCheck={false}
              onFocus={e => e.target.select()}
            />
          </Col>
          <Col>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(hex, '16进制')}
              disabled={!hex}
            />
          </Col>
        </Row>
        <Row align="middle" gutter={8}>
          <Col flex="80px">
            <Text strong>10进制</Text>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="如：6699"
              value={dec}
              onChange={onDecChange}
              maxLength={20}
              allowClear
              autoComplete="off"
              spellCheck={false}
              onFocus={e => e.target.select()}
            />
          </Col>
          <Col>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(dec, '10进制')}
              disabled={!dec}
            />
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default HexConvert;