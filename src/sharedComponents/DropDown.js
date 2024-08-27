import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Button, Input, message } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { post } from '../utility/httpService';

const ThreeDotsDropdown = ({ onEdit, onDelete, emailId, driverName, role }) => {
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendInvite = () => {
    setIsInviteModalVisible(true);
    setDescription('');
  };

  const handleCancelInvite = () => {
    setIsInviteModalVisible(false);
  };

  const handleSend = async () => {
    setLoading(true);
    await post('/auth/send-invitation-email', {
      email: emailId,
      text: description
    }).then((response) => {
      message.success('Invitation sent successfully.');
    }).catch((error) => {
      console.log(error);
    });
    setLoading(false);
    setIsInviteModalVisible(false);
  };

  const showDeleteConfirm = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsDeleteModalVisible(false);
  };


  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={() => onEdit()}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={showDeleteConfirm}>
        Delete
      </Menu.Item>
      {emailId && <Menu.Item key="send-invite" onClick={handleSendInvite}>
        Send Invitation Link
      </Menu.Item>}
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button  icon={<MoreOutlined style={{fontSize: '20px'}} />} type="text" />
      </Dropdown>

      {/* Send Invitation Modal */}
      <Modal
        title="Send Invitation Link"
        visible={isInviteModalVisible}
        onCancel={handleCancelInvite}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancelInvite}>
            Cancel
          </Button>,
          <Button key="send" type="primary" onClick={handleSend} loading={loading}>
            Send
          </Button>,
        ]}
        style={{
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <p>The invitation Will Send to the Id: {emailId}</p>
        <ol style={{ paddingLeft: '30px' }}>
          {/* <li>Review the email below or enter the correct one.</li>
          <li>Add any additional instructions in the description (optional).</li>
          <li>Click "Send" to send the invitation link to the user.</li> */}
        </ol>
        <Input.TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional instructions (optional)"
          rows={4}
          style={{
            borderRadius: '5px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            marginTop: '10px',
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        visible={isDeleteModalVisible}
        onCancel={handleDeleteCancel}
        centered
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" danger onClick={handleConfirmDelete}>
            Confirm
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete?</p>
      </Modal>
    </>
  );
};

export default ThreeDotsDropdown;
