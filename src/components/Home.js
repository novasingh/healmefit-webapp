import React, { useContext, useEffect, useState } from "react";
import { Input, Button, Form, notification } from "antd";
import Header from "./Header";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { get, update, updatePatch } from "../utility/httpService";


const Home = (props) => {
  const [form] = Form.useForm();
  const { userData} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(userData);

  useEffect(() => {
    // Fetch updated user data from the API
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await get(`/users/${userData.id}`);
        setProfileData(response.data); 
        sessionStorage.setItem('user', JSON.stringify(response.data))// Update the userData in context
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.id) {
      fetchUserData();
    }
  }, [userData.id]);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const data = {
        firstName: values.firstName.split(' ').length > 0 ? values.firstName.split(' ')[0] : 'N/A',
        lastName: values.firstName.split(' ').length > 0 ? values.firstName.split(' ')[1] : 'N/A',
        email: values.email,
        phone: values.phone ? values.phone : 'N/A', 
        truckN: values.truckN ? values.truckN : 'N/A', 
        driverN: values.driverN ? values.driverN : 'N/A', 
        licensePlate: values.licensePlate ? values.licensePlate : 'N/A'
      }
      // Sending the PATCH request to update user data
      const response = await updatePatch(`/users/${userData.id}`, data );

        console.log(response

        )
      // Fetch the updated user data after the PATCH request
      // const response = await axios.get(`/users/${userData.id}`);
      setProfileData(response.data);
      sessionStorage.setItem('user', JSON.stringify(response.data)
      )
      notification.success({ message: "Profile updated successfully!" });
    } catch (error) {
      console.error("Failed to update profile", error.response?.data || error.message);
      notification.error({ message: `Failed to update profile: ${error.response?.data?.message || error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={props.class}>
      <Header />
      <div
        style={{
          marginTop: "30px",
          background: "#C8F6653D",
          width: "100%",
          padding: "1%",
        }}
      >
        <p style={{ color: "#88C43E", margin: "auto" }}>
          Welcome {userData?.firstName}! Don’t forget to enter all missing
          information on your profile.
        </p>
      </div>
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="search_bar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              border: "0.4px solid #d9d9d9",
              background: "#f2f2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#BBBBBB",
              borderRadius: "50%",
              fontSize: "32px",
            }}
          >
            {profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}
          </div>
          <div>
            <p style={{ margin: "auto", fontWeight: "600", fontSize: "24px" }}>
              {profileData.firstName} {profileData?.lastName}
            </p>
            {/* <span
              style={{ fontSize: "10px", color: "#1FA6E0", fontWeight: "600" }}
            >
              Edit Photo
            </span> */}
          </div>
        </div>
        <div>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h4 style={{ color: "#0B5676" }}>Personal Info</h4>
        <Form
          form={form}
          initialValues={{
            firstName: profileData?.firstName,
            email: profileData?.email,
            phone: profileData?.phone || "N/A",
            truckN: profileData.truckN || "",
            driverN: profileData?.driverN || "",
            licensePlate: profileData?.licensePlate || "",
          }}
          layout="vertical"
          style={{
            justifyContent: "space-between",
            display: "flex",
            gap: "20px",
          }}
        >
          <Form.Item
            label={<div style={{ color: "#BBBBBB" }}>Full Name</div>}
            name="firstName"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              style={{ width: "300px" }}
              placeholder="Enter Name"
            />
          </Form.Item>
          <Form.Item
            label={<div style={{ color: "#BBBBBB" }}>Email</div>}
            name="email"
            rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}
          >
            <Input
              style={{ width: "300px" }}
              placeholder="Enter Email"
            />
          </Form.Item>
          <Form.Item
            label={<div style={{ color: "#BBBBBB" }}>Phone</div>}
            name="phone"
          >
            <Input
              style={{ width: "300px" }}
              placeholder="Enter Phone Number"
            />
          </Form.Item><br/>
          <Form.Item
            label={<div style={{ color: "#BBBBBB" }}>Truck Number</div>}
            name="truckN"
          >
            <Input
              style={{ width: "300px" }}
              placeholder="Enter Truck Number"
            />
          </Form.Item>
          <Form.Item
            label={<div style={{ color: "#BBBBBB" }}>Driver Number</div>}
            name="driverN"
          >
            <Input
              style={{ width: "300px" }}
              placeholder="Enter Driver Number"
            />
          </Form.Item>
          <Form.Item
            label={<div style={{ color: "#BBBBBB" }}>License Plate</div>}
            name="licensePlate"
          >
            <Input
              style={{ width: "300px" }}
              placeholder="Enter License Plate"
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Home;
