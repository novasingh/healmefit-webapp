import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Button, Input, message } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { post, remove } from '../utility/httpService';

const ThreeDotsDropdown = ({ onEdit, onDelete, emailId }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [loading , setLoading] = useState(false);

  const handleSendInvite = () => {
    setIsModalVisible(true);
    setDescription('');
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSend = async () => {
    console.log(emailId)
   setLoading(true)
   await post('/auth/send-invitation-email', {
      email : emailId,
      text: description
    }).then((response) => {
      message.success('Send Invitation Successfully.')
    }, error => {
      console.log(error)
    }) 
    setLoading(false)
    setIsModalVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={onEdit}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => onDelete()}>
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
          <Button key="send" type="primary" onClick={handleSend} loading={loading} >
            Send
          </Button>,
        ]}
        style={{
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Box shadow for depth
        }}
      >
        <p>Please follow the steps below to activate the account:</p>
        <ol style={{paddingLeft: '30px'}}>
          <li>Review the email below or enter the correct one.</li>
          <li>Add any additional instructions in the description (optional).</li>
          <li>Click "Send" to send the invitation link to the user.</li>
        </ol>
        <Input.TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional instructions (optional)"
          rows={4}
          style={{
            borderRadius: '5px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            marginTop: '10px'
          }}
        />
      </Modal>
    </>
  );
};

export default ThreeDotsDropdown;
