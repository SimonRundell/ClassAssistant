import { useState, useEffect } from 'react';
import './App.css';
import MyClasses from './myClasses';
import Login from './login';
import ClassList from './ClassList';
import ManageStudents from './manageStudents';
import Report from './report';
import { message } from 'antd';

function App() {
  const [userDetails, setUserDetails] = useState(null);
  const [config, setConfig] = useState(null);
  const [showClass, setShowClass] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [messageApi, contextHolder] = message.useMessage();
  const [sendSuccessMessage, setSendSuccessMessage] = useState(false);
  const [sendErrorMessage, setSendErrorMessage] = useState(false);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showReport, setShowReport] = useState(false);

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
            <button className="view-report-button" onClick={() => setShowReport(true)}>Progress Report</button>
            { userDetails.admin && (
              <button className="close-button" onClick={() => setShowManageStudents(true)}>Manage Students</button>
            )}
            <div className="clock">{currentTime}</div>
            <img src="/image/codemonkey.svg" alt="logo" className="logo"/>
            {showReport && (
              <Report config={config} setShowReport={setShowReport} setSendSuccessMessage={setSendSuccessMessage} setSendErrorMessage={setSendErrorMessage} />
            )}
            {!showReport && showManageStudents && (
              <ManageStudents config={config} setShowManageStudents={setShowManageStudents} setSendSuccessMessage={setSendSuccessMessage} setSendErrorMessage={setSendErrorMessage} />
            )}
            {!showReport && !showClass && (
              <MyClasses config={config} userDetails={userDetails} setShowClass={setShowClass} setSendSuccessMessage={setSendSuccessMessage} setSendErrorMessage={setSendErrorMessage} />
            )}
            {!showReport && showClass && (
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