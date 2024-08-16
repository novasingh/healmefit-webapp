import React, { useState } from 'react';
import { Dropdown, Menu, Modal, Button, Input, message } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { post } from '../utility/httpService';

const ThreeDotsDropdown = ({ onEdit, onDelete, emailId, driverName, role }) => {
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

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

  const handleEdit = () => {
    setCurrentRole(role);
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
  };

  const renderEditFields = () => {
    switch (currentRole) {
      case 'Driver':
        return (
          <>
            <Input placeholder="Driver Name" defaultValue={driverName} />
            <Input placeholder="License Number" />
            {/* Add more driver-specific fields here */}
          </>
        );
      case 'Manager':
        return (
          <>
            <Input placeholder="Manager Name" />
            <Input placeholder="Department" />
            {/* Add more manager-specific fields here */}
          </>
        );
      case 'Admin':
        return (
          <>
            <Input placeholder="Admin Name" />
            <Input placeholder="Permissions" />
            {/* Add more admin-specific fields here */}
          </>
        );
      case 'Company':
        return (
          <>
            <Input placeholder="Company Name" />
            <Input placeholder="Company Address" />
            {/* Add more company-specific fields here */}
          </>
        );
      default:
        return null;
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={handleEdit}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={showDeleteConfirm}>
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
        <p>Please follow the steps below to activate the account:</p>
        <ol style={{ paddingLeft: '30px' }}>
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
            marginTop: '10px',
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${currentRole}`}
        visible={isEditModalVisible}
        onCancel={handleCancelEdit}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => message.success('Saved successfully!')}>
            Save
          </Button>,
        ]}
      >
        {renderEditFields()}
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
