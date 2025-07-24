import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { DatePicker, Modal, message, Spin, Switch } from 'antd';
import axios from 'axios';
import { Card, Button } from 'antd';

function MyClasses({ config, userDetails, setShowClass }) {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showClassModal, setShowClassModal] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [classRecord, setClassRecord] = useState(null);
  const [currRecordId, setCurrRecordId] = useState(null);
  const [updatedData, setUpdatedData] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [editMode, setEditMode] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (userDetails) {
        setIsLoading(true);
        const jsonData = { teacherCode: userDetails.teacherCode };
        console.log('jsonData:', jsonData);
        try {
          const response = await axios.post(config.api + '/getMyClasses.php', jsonData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Response:', response.data);
          const classesData = JSON.parse(response.data.message);
          setClasses(classesData);
        } catch (error) {
          console.error('Error:', error);
          messageApi.error('Failed to fetch classes');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [config, userDetails, updatedData]);

  const editClass = (item) => {
    console.log(item);
    setShowClassModal(true);
    const classData = item.classData ? JSON.parse(item.classData) : [];
    setCurrentClass(classData);
    setClassRecord(item);
    setCurrRecordId(item.Id);
  }

  const handleOrderChange = (direction, index) => {
    const newClasses = [...currentClass];
    if (direction === 'up' && index > 0) {
      [newClasses[index - 1], newClasses[index]] = [newClasses[index], newClasses[index - 1]];
    } else if (direction === 'down' && index < newClasses.length - 1) {
      [newClasses[index + 1], newClasses[index]] = [newClasses[index], newClasses[index + 1]];
    }
    setCurrentClass(newClasses);
  };

  const handleNotesChange = (index, value) => {
    const updatedClass = [...currentClass];
    updatedClass[index].notes = value;
    setCurrentClass(updatedClass);
  };

  const saveChanges = async (item) => {
    const jsonData = {
      classData: JSON.stringify(currentClass || []), // Ensure currentClass is stringified and not null
      Id: item.Id,
      classPicture1: image1 || item.classPicture1,
      classPicture2: image2 || item.classPicture2,
      classNamen: item.classNamen,
      teacher: item.teacher,
      dateTime: item.dateTime,
      dateTimeUntil: item.dateTimeUntil,
      location: item.location,
    };
    console.log('Save data:', jsonData);
    try {
      const response = await axios.post(config.api + '/insertClass.php', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Save response:', response.data);
      messageApi.success('Changes saved successfully');
      setUpdatedData(!updatedData);
      setShowClassModal(false);
      setEditMode(false);
    } catch (error) {
      console.error('Save error:', error);
      messageApi.error('Failed to save changes');
    }
  };

  const showClass = (item) => {
    setShowClass(item);
  }

  const addNewStudent = () => {
    const newStudent = {
      firstName: '',
      lastName: '',
      support: false,
      notes: '',
    };
    setCurrentClass(prevClass => {
      const updatedClass = [...prevClass, newStudent];
      setClassRecord({ ...classRecord, classData: JSON.stringify(updatedClass) }); // Update classRecord
      return updatedClass;
    });
  };

  const deleteStudent = (index) => {
    setCurrentClass(prevClass => {
      const newClass = [...prevClass];
      newClass.splice(index, 1);
      setClassRecord({ ...classRecord, classData: JSON.stringify(newClass) }); // Update classRecord
      return newClass;
    });
  };

  const handleFirstNameChange = (index, value) => {
    const updatedClass = [...currentClass];
    updatedClass[index].firstName = value;
    setCurrentClass(updatedClass);
  };

  const handleLastNameChange = (index, value) => {
    const updatedClass = [...currentClass];
    updatedClass[index].lastName = value;
    setCurrentClass(updatedClass);
  }

  const handleImageUpload1 = (event, imageSetter) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          setImage1(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload2 = (event, imageSetter) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          setImage2(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewClass = () => {
    const newClass = {
      classNamen: '',
      teacher: '',
      location: '',
      dateTime: new Date().toISOString(),
      dateTimeUntil: new Date().toISOString(),
      classPicture1: null,
      classPicture2: null,
      classData: JSON.stringify([])
    };
    setClasses(prevClasses => [...prevClasses, newClass]);
    setEditMode(classes.length);
  };

  return (
    <>
      {isLoading && (
        <div className="central-overlay-spinner">
          <div className="spinner-text">
            <Spin size="large" />&nbsp;&nbsp;
            Loading classes for {userDetails.teacherName} ({userDetails.teacherCode})
          </div>
        </div>
      )}
  
      {contextHolder}
      {classes.length > 0 && (
        <div>
          <h1>Classes for {userDetails.teacherName} ({userDetails.teacherCode})</h1>
          <button className="bottomgap" onClick={addNewClass}>Add Class</button>
          <table className="classes-table">
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Class Name</th>
                <th>Teacher</th>
                <th>Classroom</th>
                <th>From</th>
                <th>To</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item, index) => (
                <tr key={index} className="class-card">
                  <td>{editMode === index ? <button onClick={()=>saveChanges(item)}>Save Class</button> : <button onClick={()=>setEditMode(index)}>Edit Class</button>}
                  </td>
                  <td>
                    {editMode === index ? (
                      <input
                        type="text"
                        value={item.classNamen}
                        onChange={(e) => {
                          const updatedClasses = [...classes];
                          updatedClasses[index].classNamen = e.target.value;
                          setClasses(updatedClasses);
                        }}
                      />
                    ) : (
                      item.classNamen
                    )}
                    
                    <div>
                    {editMode === index ? (
                      <>
                        <input
                          type="file"
                          id={`image1-${index}`}
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload1(e, setImage1)}
                        />
                        <label htmlFor={`image1-${index}`} className="smalltopgap">
                          Upload Image 1&nbsp;&nbsp;
                        </label>
                        {image1 && <img src={image1} alt="Image 1 Preview" style={{ width: '50px', height: '50px' }} />}
                        {item.classPicture1 && <img src={item.classPicture1} alt="Class Picture 1" style={{ width: '50px', height: '50px' }} />}
                        <input
                          type="file"
                          id={`image2-${index}`}
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload2(e, setImage2)}
                        />
                        <label htmlFor={`image2-${index}`} className="leftgap">
                          Upload Image 2&nbsp;&nbsp;
                        </label>
                        {image2 && <img src={image2} alt="Image 2 Preview" style={{ width: '50px', height: '50px' }} />}
                        {item.classPicture2 && <img src={item.classPicture2} alt="Class Picture 2" style={{ width: '50px', height: '50px' }} />}
                      </>
                    ) : (
                      <>
                        {item.classPicture1 && <img src={item.classPicture1} alt="Class Picture 1" style={{ width: '50px', height: '50px' }} />}&nbsp;&nbsp;&nbsp;
                        {item.classPicture2 && <img src={item.classPicture2} alt="Class Picture 2" style={{ width: '50px', height: '50px' }} />}
                      </>
                    )}
                    </div>
                  </td>
                  <td>
                  {editMode === index ? (
                      <>
                    <input
                      type="text"
                      value={item.teacher}
                      onChange={(e) => {
                        const updatedClasses = [...classes];
                        updatedClasses[index].teacher = e.target.value;
                        setClasses(updatedClasses);
                      }}
                      style={{ width: '5ch' }}
                    />
                    </>
                    ) : (
                      <>
                      {item.teacher}
                      </>
                      )}
                  </td>
                  <td>
                  {editMode === index ? (
                      <>
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) => {
                        const updatedClasses = [...classes];
                        updatedClasses[index].location = e.target.value;
                        setClasses(updatedClasses);
                      }}
                      style={{ width: '5ch' }}
                    />
                    </>
                    ) : (
                      <>
                      {item.location}
                      </>
                      )}
                  </td>
                  <td>
                  {editMode === index ? (
                      <>
                    <DatePicker
                      value={moment(item.dateTime)}
                      onChange={(date) => {
                        const updatedClasses = [...classes]; 
                        updatedClasses[index].dateTime = date.toISOString();
                        setClasses(updatedClasses);
                        }}
                        showTime
                        format="DD/MM/YYYY HH:mm"
                      />
                      </>
                      ) : (
                        <>
                        {moment(item.dateTime).format('DD/MM/YYYY HH:mm')}
                        </>
                      )}
                      </td>
                      <td>
                      {editMode === index ? (
                        <>
                      <DatePicker
                        value={moment(item.dateTimeUntil)}
                        onChange={(date) => {
                        const updatedClasses = [...classes];
                        updatedClasses[index].dateTimeUntil = date.toISOString();
                        setClasses(updatedClasses);
                      }}
                      showTime
                      format="HH:mm"
                    />
                    </>
                    ) : (
                      <>
                      {moment(item.dateTimeUntil).format('HH:mm')}
                      </>
                      )}
                  </td>
                  <td>{Math.floor((new Date(item.dateTimeUntil) - new Date(item.dateTime)) / 60000)} minutes</td>
                  <td>
                    <div><button onClick={() => editClass(item)}>Students ({item.classData ? JSON.parse(item.classData).length : 0})</button></div>
                    <div><button className="smalltopgap" onClick={() => showClass(item)}>Show Class</button></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
            
      {showClassModal && currentClass && (
        <div className="modal">
          <div className="modal-content">      
            <div className="modal-buttons">
              <button onClick={addNewStudent}>Add New</button>
              <button onClick={() => saveChanges(classRecord)}>Save Changes</button>
              <button onClick={() => setShowClassModal(false)}>Cancel</button>
            </div>
            {currentClass.map((student, index) => (
              <Card key={index}>
                <div className="modal-line">
                  <span className="label name">
                    <input type="text" onChange={(e) => handleFirstNameChange(index, e.target.value)} value={student.firstName}></input>
                    <input type="text" onChange={(e) => handleLastNameChange(index, e.target.value)} value={student.lastName}></input></span>
                  <span className="label">
                    Support:
                    <Switch
                      checked={student.support}
                      onChange={(checked) => {
                        const updatedClass = [...currentClass];
                        updatedClass[index].support = checked;
                        setCurrentClass(updatedClass);
                        setClassRecord({ ...classRecord, classData: JSON.stringify(updatedClass) }); // Update classRecord
                      }}
                    />
                  </span>
                </div>
                <div className="modal-line">
                  <span className="label">Notes:</span>
                  <textarea
                    value={student.notes}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    style={{ width: '100%', minHeight: '100px' }}
                  />
                </div>
                <div className="modal-line">
                  <Button onClick={() => handleOrderChange('up', index)}>Move Up</Button>
                  <Button onClick={() => handleOrderChange('down', index)}>Move Down</Button>
                  <Button onClick={() => deleteStudent(index)}>Delete Student</Button>
                </div>
              </Card>
            ))}
            <div className="modal-buttons">
              <button onClick={addNewStudent}>Add New</button>
              <button onClick={() => saveChanges(classRecord)}>Save Changes</button>
              <button onClick={() => setShowClassModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
  
    </>
  );
}

export default MyClasses;