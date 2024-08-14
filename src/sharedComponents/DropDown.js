import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Button, Input } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

const ThreeDotsDropdown = ({ onEdit, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const handleSendInvite = () => {
    setIsModalVisible(true);
    setEmail(''); // Reset email field when modal is opened
    setDescription(''); // Reset description field when modal is opened
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSend = () => {
    console.log('Sending invitation to:', email);
    console.log('Description:', description);
    // Implement the send functionality here (e.g., API call)
    setIsModalVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={onEdit}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={onDelete}>
        Delete
      </Menu.Item>
      <Menu.Item key="send-invite" onClick={handleSendInvite}>
        Send Invitation Link
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']}>
        <EllipsisOutlined style={{ fontSize: '24px', cursor: 'pointer', transform: 'rotate(90deg)' }} />
      </Dropdown>

      <Modal
        title="Send Invitation Link"
        visible={isModalVisible}
        onCancel={handleCancel}
        centered // Center the modal
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="send" type="primary" onClick={handleSend}>
            Send
          </Button>,
        ]}
        bodyStyle={{
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Box shadow for depth
        }}
      >
        <p>Please follow the steps below to activate the account:</p>
        <ol>
          <li>Review the email below or enter the correct one.</li>
          <li>Add any additional instructions in the description (optional).</li>
          <li>Click "Send" to send the invitation link to the user.</li>
        </ol>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user's email"
          style={{
            marginBottom: '10px',
            borderRadius: '5px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Input.TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional instructions (optional)"
          rows={4}
          style={{
            borderRadius: '5px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        />
      </Modal>
    </>
  );
};

export default ThreeDotsDropdown;
