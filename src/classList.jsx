import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import axios from 'axios';
import { message, Spin } from 'antd';

const returnDiscipline = (discValue) => {
  switch (discValue) {
    case 0:
      return ' ';
    case 1:
      return 'Least Invasive Intervention';
    case 2:
      return 'Level 1 Warning';
    case 3:
      return 'Level 2 Warning';
    case 4:
      return 'Remove from Class';
    default:
      return 'Unknown';
  }
}

const disciplineColour = (discValue) => {
  switch (discValue) {
    case 0:
      return 'green';
    case 1:
      return 'yellow';
    case 2:
      return 'amber';
    case 3:
      return 'red';
    case 4:
      return 'red';
    default:
      return 'green';
  }
}

function ClassList({config, userDetails, showClass, setShowClass}) {
  const [students, setStudents] = useState([]);
  const [groupedStudents, setGroupedStudents] = useState([]);
  const [sliderValue, setSliderValue] = useState(4); // Default value set to 4
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isSaving, setIsSaving] = useState(false);
  const [showImage1, setShowImage1] = useState(false);
  const [showImage2, setShowImage2] = useState(false);

  useEffect(() => {
    // Parse the class data and ensure credits, discipline, timesCalled, and notes are initialized
    console.log('Show class:', showClass);
    const initialStudents = JSON.parse(showClass.classData).map(student => ({
      ...student,
      credits: 0,
      discipline: 0,
      timesCalled: 0,
      notes: student.notes || ''
    }));
    setStudents(initialStudents);
    setCurrentClass(showClass.Id);
    if (initialStudents.length > 0) {
      setSelectedStudent(initialStudents[0]);
    }
  }, [showClass]);



  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleAddCredit = (firstName, lastName) => {
    console.log('Adding credit for ' + firstName + ' ' + lastName);
    const updatedStudents = students.map(student => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, credits: student.credits + 1 };
      }
      return student;
    });
   
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, credits: selectedStudent.credits + 1 });
    }

    saveChanges(updatedStudents);

  };

  const handleSubtractCredit = (firstName, lastName) => {
    console.log('Subtracting credit for ' + firstName + ' ' + lastName);
    const updatedStudents = students.map(student => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, credits: student.credits - 1 };
      }
      return student;
    });
   
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, credits: selectedStudent.credits - 1 });
    }

    saveChanges(updatedStudents);

  };

  const handleCallStudent = (firstName, lastName) => {
    console.log('Calling student ' + firstName + ' ' + lastName);
    const updatedStudents = students.map(student => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, timesCalled: student.timesCalled + 1 };
      }
      return student;
    });

    const calledStudent = updatedStudents.find(student => student.firstName === firstName && student.lastName === lastName);
    const remainingStudents = updatedStudents.filter(student => student.firstName !== firstName || student.lastName !== lastName);

    setStudents([...remainingStudents, calledStudent]);

    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, timesCalled: selectedStudent.timesCalled + 1 });
    }

    setSelectedStudent(remainingStudents[0]); // Ensure selectedStudent is set to the first student

    saveChanges([...remainingStudents, calledStudent]);

  };

  const handleNotesChange = (event, firstName, lastName) => {
    console.log('Updating notes for ' + firstName + ' ' + lastName);
    const updatedStudents = students.map(student => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, notes: event.target.value };
      }
      return student;
    });
   
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, notes: event.target.value });
    }
  };

  const selectDiscipline = (firstName, lastName) => {
    console.log('Disciplinary action for ' + firstName + ' ' + lastName);
    const updatedStudents = students.map(student => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, discipline: (student.discipline + 1) % 5 };
      }
      return student;
    });
   
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, discipline: (selectedStudent.discipline + 1) % 5 });
    }

    saveChanges(updatedStudents);

  };

  const generateReport = () => {
    const reportWindow = window.open('', '', 'width=800,height=600');
    const reportContent = `
      <html>
      <head>
      <title>Lesson Summary Report</title>
      <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid black; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      </style>
      </head>
      <body>
      <h2>Lesson Summary: ${showClass.classNamen}</h2>
      <p>Report: ${new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} &nbsp;&nbsp;
      Lesson: ${new Date(showClass.dateTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      <table>
      <thead>
        <tr>
        <th>Student</th>
        <th>Times Called</th>
        <th>Credits</th>
        <th>Discipline</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(student => `
        <tr>
        <td>${student.firstName} ${student.lastName}</td>
        <td>${student.timesCalled}</td>
        <td>${student.credits}</td>
        <td><span class="times-called ${disciplineColour(student.discipline)}">${returnDiscipline(student.discipline)}</span></td>
        </tr>
        `).join('')}
      </tbody>
      </table>
      </body>
      </html>
    `;
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.print();
  };

  const saveChanges = async (updatedStudents) => {
    setIsSaving(true);
    const jsonData = {
      classData: JSON.stringify(updatedStudents),
      Id: currentClass
    };
    console.log('Save data:', jsonData);
    try {
      const response = await axios.post(config.api + '/updateClass.php', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Save response:', response.data);
      messageApi.success('Changes saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      messageApi.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const moveStudentUp = (index) => {
    if (index === 0) return; // Already at the top
    const updatedStudents = [...students];
    const temp = updatedStudents[index - 1];
    updatedStudents[index - 1] = updatedStudents[index];
    updatedStudents[index] = temp;
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudents[0]);
  };

  const moveStudentDown = (index) => {
    if (index === students.length - 1) return; // Already at the bottom
    const updatedStudents = [...students];
    const temp = updatedStudents[index + 1];
    updatedStudents[index + 1] = updatedStudents[index];
    updatedStudents[index] = temp;
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudents[0]);
  };

  return (
    <>
    {isSaving && <div className="central-overlay-spinner">
      <div className="spinner-text">
        <Spin size="large" />&nbsp;&nbsp;
          Saving...
        </div>
      </div>}
    {contextHolder}
    {students.length === 0 && <div className="loading">Loading...</div>}
    {students.length > 0 && (
      <>
    <div className="header topgap">
      <button onClick={generateReport}>Generate Report</button>
      <button className="leftgap" onClick={()=>setShowImage1(true)}>Seating Plan 1</button>
      <button className="leftgap" onClick={()=>setShowImage2(true)}>Seating Plan 2</button>
      <button className="leftgap" onClick={()=>setShowClass(null)}>Close</button>
    </div>
    <div className="classlist-container">
      <div className="container">
        <h2>Student List</h2>

        <ul className="student-list">
          {students.map((student, index) => (
            <li
              key={index}
              className="student-item"
              onClick={() => handleStudentClick(student)}
            >
              <span className="called-container">
                <span className="student-list-name">{student.firstName} {student.lastName}</span>
                <span className="up-down">
                  <span className="up-down">
                    <button className="arrow-button" onClick={(e) => { e.stopPropagation(); moveStudentUp(index); }}>
                      &#9650;
                    </button>
                    <button className="arrow-button" onClick={(e) => { e.stopPropagation(); moveStudentDown(index); }}>
                      &#9660;
                    </button>
                  </span>
                </span>
                <span className="times-called"> {student.timesCalled}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="container">
        <h2>Student Details</h2>
        {selectedStudent && (
          <div className="student-info">
            <h3>{selectedStudent.firstName} {selectedStudent.lastName}</h3>
            <ul className="student-details">
              <li><span className="label">Credits:</span> <span className="value">{selectedStudent.credits}</span></li>
              <li><span className="label">Discipline:</span> <span onClick={()=>selectDiscipline(selectedStudent.firstName, selectedStudent.lastName)} className="value"><span className={`times-called click-me ${disciplineColour(selectedStudent.discipline)}`}>{returnDiscipline(selectedStudent.discipline)}</span></span></li>
              <li><span className="label">Support:</span> <span className="value">{selectedStudent.support ? 'Yes' : 'No'}</span></li>
              <li><span className="label">Times Called:</span> <span className="value">{selectedStudent.timesCalled}</span></li>
            </ul>
            <div className="notes-section">
              <h4>Notes:</h4>
              <textarea
                value={selectedStudent.notes}
                onChange={(e) => handleNotesChange(e, selectedStudent.firstName, selectedStudent.lastName)}
                className="notes"
              />
            </div>
            <div className="buttons-together">
              <button onClick={()=>handleAddCredit(selectedStudent.firstName, selectedStudent.lastName)}>+</button>
              <button onClick={()=>handleSubtractCredit(selectedStudent.firstName, selectedStudent.lastName)}>-</button>
              <button className="button-wide" onClick={()=>handleCallStudent(selectedStudent.firstName, selectedStudent.lastName)}>Call</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
)}
      {showImage1 && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowImage1(false)}>&times;</span>
            {showClass.classPicture1 ? (
              <img src={showClass.classPicture1} alt="Image 1" style={{ width: '100%' }} />
            ) : (
              <div>No image available</div>
            )}
          </div>
        </div>
      )}
      {showImage2 && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowImage2(false)}>&times;</span>
            {showClass.classPicture2 ? (
              <img src={showClass.classPicture2} alt="Image 2" style={{ width: '100%' }} />
            ) : (
              <div>No image available</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ClassList;