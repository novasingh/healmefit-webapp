import React, { useState } from "react";
import { Input, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";
import facebookicon from "../assets/facebook-hmf.webp";
import emailicon from "../assets/email-hmf.webp";
import healmefitlogo from "../assets/HealMeFit-Logo.webp";
import checkmarkicon from "../assets/ResetLogin.webp";
import { post } from "../utility/httpService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [isMatch, setIsMatch] = useState(true);
  const [searchData] = useSearchParams();
  const token = searchData.get("token");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    const repassword = e.target.value;
    setConfirmPassword(repassword);

    // Check if passwords match
    if (repassword === password) {
      setIsMatch(true);
    } else {
      setIsMatch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isMatch) {
      await post(`/auth/reset-password?token=${token}`, {
        password
       }).then((res) => {
          if(res.status === 204){
            message.success('New Password Saved Successfully.')
            navigate('/')
          }
       }, error => {
        console.log(error)
       })
    } else {
      message.error("Password do not match.")
    }
  };

  return (
    <div className="login-container">
      <div className="login-info">
        <div className="circle">
          <div>
            {" "}
            <a href="#">
              <img src={checkmarkicon} alt="Facebook" />
            </a>
          </div>
        </div>
        <h3>
          We aim to improve the safety and compliance issues in trucking
          companies and the well-being of truckers.
        </h3>
      </div>
      <div className="login-box">
        <div style={{ width: "320px", textAlign: "center" }}>
          <div className="login-logo">
            <img src={healmefitlogo} alt="Heal Me Fit Logo" />
          </div>
          <h4>Create a New Password and Remember while login next Time!</h4>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <Input.Password
                placeholder="New Password"
                required
                value={password.password}
                onChange={(e) => handlePasswordChange(e)}
              />
            </div>
            <div className="input-box">
              <Input.Password
                placeholder="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e)}
              />
            </div>
            {password.length > 0 && !isMatch && (
              <p className="error-message">Passwords do not match</p>
            )}
            <div className="input-box">
              <input type="submit" value="Reset Password" />
            </div>
          </form>
          <div className="login-footer">
            <a href="/">Log In Now!</a>
          </div>
          <footer>
            <p>&copy; 2024 Heal Me Fit</p>
            <p>3104 E. Camelback Rd, Ste 2634, Phoenix, AZ 85016</p>
            <br></br>
            <div className="social-links">
              <a href="https://www.facebook.com/HealMeFit">
                <img src={facebookicon} alt="Facebook" />
              </a>
              <a href="mailto:support@healmefit.com">
                <img src={emailicon} alt="Email" />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
