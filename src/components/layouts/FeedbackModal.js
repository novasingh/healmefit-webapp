// FeedbackModal.js
import React, { useContext, useState } from 'react';
import { Modal, Rate, Input, message } from 'antd';
import { AuthContext } from '../../contexts/AuthContext';
import { post } from '../../utility/httpService';

const FeedbackModal = ({ isModalOpen, handleOk, handleCancel }) => {
  const { userData, setUserData } = useContext(AuthContext);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRateChange = (value) => {
    setRating(value);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      message.error('Please provide a rating before submitting.');
      return;
    }

    const data = {
      userId: userData.id,
      rating: rating,
      feedback: feedback ? feedback : 'N/A',
    };

    await post(`/rating`, data)
      .then((response) => {
        if(response?.status === 201){
          userData.ratingBefore = true;
          setUserData(userData)
          sessionStorage?.setItem('user', JSON.stringify(userData))
          message.success('Thank you for your feedback!');
          handleOk();
        }else {
          message.error('You already gave feedback.');
        }
      }) 
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
        placeholder="Leave your feedback here..."
        value={feedback}
        onChange={handleFeedbackChange}
        rows={4}
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default FeedbackModal;
