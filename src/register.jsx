import { useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import CryptoJS from 'crypto-js';

function Register({ config, setShowRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentName, setStudentName] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [classNamen, setClassNamen] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Hash the password with MD5

        if (email === '' || password === '' || studentName === '') {
            message.error('Please fill in all fields');
            return;
        }

        const hashedPassword = CryptoJS.MD5(password).toString();

        const jsonData = { email: email, passwordHash: hashedPassword, studentName: studentName, classNamen: classNamen, schoolName: schoolName };
        console.log("JSONData:", jsonData);
        const response = await axios.post(config.api + '/insertUser.php', jsonData);
        const data = response.data;
        message.success(data.message);
        setShowRegister(false);

    };

    return (
        <>
        {contextHolder}
            <div className="login-container">
                <div className="login-header">
                    <p>{config.appName}</p>
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
                        <div className='form-group'>
                            <label>Student Name</label>
                            <input
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Student Name"
                            />
                        </div>
                        <div className='form-group'>
                            <label>School</label>
                            <input
                                type="text"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                placeholder="School Name"
                            />
                        </div>
                        <div className='form-group'>
                            <label>Class</label>
                            <input
                                type="text"
                                value={classNamen}
                                onChange={(e) => setClassNamen(e.target.value)}
                                placeholder="Class"
                            />
                        </div>
                        <div className='form-group-button'>
                            <button type="submit">Register</button>
                            <button type="button" className="smalltop" onClick={() => setShowRegister(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div> 
        </>
    );
}

export default Register;