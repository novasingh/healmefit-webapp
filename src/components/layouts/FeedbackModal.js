// FeedbackModal.js
import React, { useState } from 'react';
import { Modal, Rate, Input, message } from 'antd';
import emailjs from 'emailjs-com';

const FeedbackModal = ({ isModalOpen, handleOk, handleCancel }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRateChange = (value) => {
    setRating(value);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const submitFeedback = () => {
    if (rating === 0) {
      message.error('Please provide a rating before submitting.');
      return;
    }

    const templateParams = {
      rating: rating,
      feedback: feedback,
    };

    emailjs.send(
      'your_service_id',    // Replace with your EmailJS service ID
      'your_template_id',   // Replace with your EmailJS template ID
      templateParams,
      'your_user_id'        // Replace with your EmailJS user ID
    )
    .then(response => {
      message.success('Thank you for your feedback!');
      handleOk();
      setRating(0);
      setFeedback('');
    })
    .catch(error => {
      message.error('Failed to send feedback. Please try again later.');
    });
  };

  return (
    <Modal
      title="Rate Us"
      open={isModalOpen}
      onOk={submitFeedback}
      onCancel={handleCancel}
    >
      <Rate allowHalf defaultValue={0} onChange={handleRateChange} />
      <Input.TextArea
        placeholder="Optional: Leave your feedback here..."
        value={feedback}
        onChange={handleFeedbackChange}
        rows={4}
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default FeedbackModal;
