import React, { useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;

function ManagerRequestModal({ isVisible, onClose, onSubmit }) {
  const [form] = Form.useForm();

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Request Document"
      visible={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleFormSubmit}>
          Request
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="documentType"
          label="Document Type"
          rules={[{ required: true, message: "Please select a document type!" }]}
        >
          <Select placeholder="Select document type">
            <Option value="ID">ID</Option>
            <Option value="Driver License">Driver License</Option>
            <Option value="Resume">Resume</Option>
            <Option value="Vaccination Proof">Vaccination Proof</Option>
            <Option value="HR Form">HR Form</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: "Please enter a message!" }]}
        >
          <Input.TextArea rows={4} placeholder="Enter message" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ManagerRequestModal;
