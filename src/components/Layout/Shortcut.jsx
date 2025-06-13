import { useEffect, useState } from "react";
import { Form, Input, Modal, Space, Tooltip, Button, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

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

const Shortcut = ({outputData, setOutputData}) => {
  const [shortcuts, setShortcuts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setShortcuts(loadShortcuts());
  }, [])

  const openShortcutModal = (index = null) => {
    setEditingIndex(index);
    if (index === null) {
      form.setFieldsValue({ name: '', command: outputData });
    } else {
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
        newShortcuts.push({
          name: values.name,
          command: values.command,
        });
      } else {
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
    <Card
      title="快捷指令"
      size="small"
      style={{ maxWidth: 420, margin: '0 auto', padding: 8 }}
      extra={<Tooltip title="新建快捷指令">
        <Button
          icon={<PlusOutlined />}
          size="small"
          onClick={() => openShortcutModal(null)}
        />
      </Tooltip>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {shortcuts.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
          destroyOnHide
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
      </Space>
    </Card>
  );
};

export default Shortcut;