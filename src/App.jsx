import { useState, useEffect } from 'react';
import './App.css';
import MyClasses from './myClasses';
import Login from './login';
import ClassList from './classList';
import { message } from 'antd';

function App() {
  const [userDetails, setUserDetails] = useState(null);
  const [config, setConfig] = useState(null);
  const [showClass, setShowClass] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [messageApi, contextHolder] = message.useMessage();
  const [sendSuccessMessage, setSendSuccessMessage] = useState(false);
  const [sendErrorMessage, setSendErrorMessage] = useState(false);

  useEffect(() => {
    fetch('/.config.json')
      .then(response => response.json())
      .then(data => {
        setConfig(data);
        console.log("Config loaded:", data);
      })
      .catch(error => console.error('Error fetching config:', error));
  }, []);

    useEffect(() => {
    if (sendSuccessMessage) {
       messageApi.success(sendSuccessMessage);
    }
      setSendSuccessMessage(false);
    
  }, [sendSuccessMessage]);

  useEffect(() => {
    if (sendErrorMessage) {
      messageApi.error(sendErrorMessage);
    }
  }, [sendErrorMessage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const logout = () => {
    setUserDetails(null);
    setShowClass(false);
  }

  return (
    <>
      {config && (
        <div>
          {contextHolder}
          {userDetails ? (
            <div className="App">
            <button className="logout-button" onClick={logout}>Logout</button>
            <div className="clock">{currentTime}</div>
            <img src="/image/codemonkey.svg" alt="logo" className="logo"/>
            {!showClass && (
              <MyClasses config={config} userDetails={userDetails} setShowClass={setShowClass} setSendSuccessMessage={setSendSuccessMessage} setSendErrorMessage={setSendErrorMessage} />
            )}
            {showClass && (
              <ClassList config={config} userDetails={userDetails} showClass={showClass} setShowClass={setShowClass} setSendSuccessMessage={setSendSuccessMessage} setSendErrorMessage={setSendErrorMessage} />
            )}
            </div>
          ) : (
            <div className="App">
              <Login config={config} setUserDetails={setUserDetails} />
            </div>
          )}
          
        </div>
      )}
    </>
  );
}

export default App;