import { useState, useEffect } from 'react';
import { Button, Input, Modal, Form, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useHandleDevice } from '../HID/HandleDeviceContext';

const { TextArea } = Input;

const LOCAL_KEY = 'hid_sendarea_shortcuts';

function loadShortcuts() {
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

function saveShortcuts(shortcuts) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(shortcuts));
}

const defaultValue = 'F5 05 31 2E 30 2E 32 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ';

const SendArea = () => {
  const [outputData, setOutputData] = useState(defaultValue);
  const { addToQueue } = useHandleDevice();

  // 快捷指令相关
  const [shortcuts, setShortcuts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // null: 新增, number: 编辑
  const [form] = Form.useForm();

  useEffect(() => {
    setShortcuts(loadShortcuts());
  }, []);

  const sendData = async () => {
    addToQueue(outputData);
  };

  // 新增/编辑快捷指令
  const openShortcutModal = (index = null) => {
    setEditingIndex(index);
    if (index === null) {
      // 新增
      form.setFieldsValue({ name: '', command: outputData });
    } else {
      // 编辑
      form.setFieldsValue({
        name: shortcuts[index].name,
        command: shortcuts[index].command,
      });
    }
    setShowModal(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      let newShortcuts = [...shortcuts];
      if (editingIndex === null) {
        // 新增
        newShortcuts.push({
          name: values.name,
          command: values.command,
        });
      } else {
        // 编辑
        newShortcuts[editingIndex] = {
          name: values.name,
          command: values.command,
        };
      }
      setShortcuts(newShortcuts);
      saveShortcuts(newShortcuts);
      setShowModal(false);
      setEditingIndex(null);
    });
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setEditingIndex(null);
  };

  const handleDeleteShortcut = (index) => {
    Modal.confirm({
      title: '删除快捷指令',
      content: `确定要删除 "${shortcuts[index].name}" 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const newShortcuts = shortcuts.filter((_, i) => i !== index);
        setShortcuts(newShortcuts);
        saveShortcuts(newShortcuts);
      }
    });
  };

  const handleUseShortcut = (index) => {
    setOutputData(shortcuts[index].command);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ flex: 1 }}>发送区</span>
        <Tooltip title="添加快捷指令">
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => openShortcutModal(null)}
            style={{ marginLeft: 8 }}
          />
        </Tooltip>
      </div>
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

      {/* 快捷指令按钮区 */}
      {shortcuts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '10px 0' }}>
          {shortcuts.map((item, idx) => (
            <Space key={idx} size={0}>
              <Button
                size="small"
                style={{ minWidth: 80 }}
                onClick={() => handleUseShortcut(idx)}
                title={item.command}
              >
                {item.name}
              </Button>
              <Tooltip title="编辑">
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  type="text"
                  onClick={() => openShortcutModal(idx)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  type="text"
                  danger
                  onClick={() => handleDeleteShortcut(idx)}
                />
              </Tooltip>
            </Space>
          ))}
        </div>
      )}

      <Modal
        title={editingIndex === null ? '添加快捷指令' : '编辑快捷指令'}
        open={showModal}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingIndex === null ? '添加' : '保存'}
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name: '', command: outputData }}
        >
          <Form.Item
            label="按钮名称"
            name="name"
            rules={[{ required: true, message: '请输入按钮名称' }]}
          >
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item
            label="指令内容"
            name="command"
            rules={[{ required: true, message: '请输入指令内容' }]}
          >
            <TextArea autoSize={{ minRows: 2 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
};

export default SendArea;