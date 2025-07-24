import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Modal, message, Spin } from 'antd';
import axios from 'axios';
import Register from './register';

const Login = ({ config, setUserDetails }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failedLogin, setFailedLogin] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Hash the password with MD5
    const hashedPassword = CryptoJS.MD5(password).toString();
    const JSONData = { email: email, passwordHash: hashedPassword };

    console.log("JSONData:", JSONData);

    try {
      const response = await axios.post(config.api + '/getLogin.php', JSONData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      console.log('Response:', data);

      // Handle the response data here
      if (data.status_code === 200) {
        const user = JSON.parse(data.message)[0]; // Parse the JSON string and get the first user object
        if (user) {
          setUserDetails(user);
          console.log('Login successful');
          setIsLoading(false);
        } else {
          console.log('User not found');
          setFailedLogin(true);
          setIsLoading(false);
        }
      } else {
        // Login failed
        console.log('Login failed');
        setFailedLogin(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert("Network error. Please try again.");
      setIsLoading(false);
      setFailedLogin(true);
    }
  };

  return (
    <>
      {isLoading && <div className="central-overlay-spinner">            
          <div className="spinner-text">&nbsp;&nbsp;
              <Spin size="large" />
              Logging in...
            </div> 
          </div>}
      {contextHolder}
      <Modal
        title="Login Failed"
        centered
        open={failedLogin}
        footer={null}
        onCancel={() => setFailedLogin(false)}
      >
        <p>Sorry, your login failed. Please try again.</p>
        <button onClick={() => setFailedLogin(false)}>OK</button>
      </Modal>

      {showRegister ? (
        <Register config={config} setShowRegister={setShowRegister} />
      ) : (
        <div className="login-container">
          <div className="login-header">
            <p>{config.appName} <span className="small">{config.appVersion}</span>
            <span className="midline"><img src="/image/codemonkey.svg" height="100" alt="developed by Simon Rundell for CodeMonkey Design Ltd" /></span></p>
          </div>
          <div className="login-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>eMail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className='form-group'>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
              <div className='form-group-button'>
                <button type="submit">Login</button>
              </div>
            </form>
            <button onClick={() => setShowRegister(true)}>Register (free)</button>
          </div>
          <p className="small">Some message here</p>
        </div>
      )}
    </>
  );
};

export default Login;