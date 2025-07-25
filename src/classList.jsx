import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import axios from 'axios';
import ShowStudents from './showStudents';
import { Spin } from 'antd';
import NotesTable from './notesTable';


const returnDiscipline = (discValue) => {
  switch (discValue) {
    case 0:
      return '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'; // Non-breaking spaces for empty discipline
    case 1:
      return 'Least Invasive Intervention';
    case 2:
      return 'Level 1 Warning';
    case 3:
      return 'Level 2 Warning';
    case 4:
      return 'Exclusion from Class';
    default:
      return 'Unknown';
  }
};

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
};

function ClassList({ config, userDetails, showClass, setShowClass, setSendErrorMessage, setSendSuccessMessage }) {
  const [students, setStudents] = useState([]);
  const [groupedStudents, setGroupedStudents] = useState([]);
  const [sliderValue, setSliderValue] = useState(4); // Default value set to 4
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [showEditClass, setShowEditClass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImage1, setShowImage1] = useState(false);
  const [showImage2, setShowImage2] = useState(false);
  const [studentDetailsfromRecord, setStudentDetailsfromRecord] = useState([]);


  useEffect(() => {
    const initialStudents = JSON.parse(showClass.classData).map((student) => ({
      ...student,
      credits: student.credits || 0,
      discipline: student.discipline || 0,
      timesCalled: student.timesCalled || 0,
      notes: student.notes || '',
    }));
    setStudents(initialStudents);
    if (initialStudents.length > 0) {
      setSelectedStudent(initialStudents[0]);
    }
  }, [showClass]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleAddCredit = (firstName, lastName) => {
    const updatedStudents = students.map((student) => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, credits: student.credits + 1 };
      }
      return student;
    });
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, credits: selectedStudent.credits + 1 });
    }
  };

  const handleSubtractCredit = (firstName, lastName) => {
    const updatedStudents = students.map((student) => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, credits: student.credits - 1 };
      }
      return student;
    });
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, credits: selectedStudent.credits - 1 });
    }
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
    const updatedStudents = students.map((student) => {
      if (student.firstName === firstName && student.lastName === lastName) {
        return { ...student, discipline: (student.discipline + 1) % 5 };
      }
      return student;
    });
    setStudents(updatedStudents);
    if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
      setSelectedStudent({ ...selectedStudent, discipline: (selectedStudent.discipline + 1) % 5 });
    }
  };

    const setNewStudent = (newStudent) => {
    if (newStudent) {
      // Check if the student already exists in the list
      const isDuplicate = students.some(
        (student) =>
          student.firstName === newStudent.studentFirstName &&
          student.lastName === newStudent.studentLastName
      );
  
      if (isDuplicate) {
        console.warn('Student already exists in the list:', newStudent);
        setSendErrorMessage('Student already exists in the class list');
        return; // Exit the function to prevent adding the duplicate
      }
  
      const mappedStudent = {
        firstName: newStudent.studentFirstName,
        lastName: newStudent.studentLastName,
        studentID: newStudent.studentID || '',
        newNote: '',
        support: newStudent.studentSupport || false,
        studentImage: newStudent.studentImage || '',
        notes: newStudent.studentNotes || '',
        credits: 0,
        discipline: 0,
        timesCalled: 0,
      };
  
      setIsSaving(true);
  
      // Fetch student details and update state after the API call
      getStudentDetailsfromRecord(newStudent, (details) => {
        if (details) {
          Object.assign(mappedStudent, details);
        } else {
          console.error('Failed to fetch student details');
        }
  
        console.log('Adding new student:', mappedStudent);
  
        const updatedStudents = [...students, mappedStudent];
        setStudents(updatedStudents);
        if (!selectedStudent) {
          setSelectedStudent(mappedStudent);
        }
  
        setIsSaving(false); // Ensure this is called after the API call
      });
    }
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
      setSendSuccessMessage('Changes saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      setSendErrorMessage('Failed to save changes');
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

  const updateStudentNotes = async (studentID, notes) => {
    setIsSaving(true);
    const jsonData = {
      studentNotes: JSON.stringify(notes),
      studentID: studentID
    };
    console.log('Save data:', jsonData);
    try {
      const response = await axios.post(config.api + '/updateNote.php', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Save response:', response.data);
      setSendSuccessMessage('Notes updated successfully');
    } catch (error) {
      console.error('Save error:', error);
      setSendErrorMessage('Failed to update notes');
    } finally {
      setIsSaving(false);
    }
  };

  const getStudentDetailsfromRecord = (student, callback) => {
    axios
      .get(`${config.api}/getStudentDetails.php`, {
        params: { studentID: student.studentID },
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        console.log('Student details response:', response.data);
        setStudentDetailsfromRecord(response.data);
        if (typeof callback === 'function') {
          callback(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching student details:', error);
        if (typeof callback === 'function') {
          callback(null);
        }
      });
  };

  const saveClass = async (students) => {
    setIsSaving(true);
    const jsonData = {
      classData: JSON.stringify(students),
      Id: showClass.Id
    };
    console.log('Save data:', jsonData);
    try {
      const response = await axios.post(config.api + '/updateClass.php', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Save response:', response.data);
      setSendSuccessMessage('Class saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      setSendErrorMessage('Failed to save class');
    } finally {
      setIsSaving(false);
    }
  };  

  return (
    <>
    {isSaving && <div className="central-overlay-spinner">
      <div className="spinner-text">
        <Spin size="large" />&nbsp;&nbsp;
          Saving...
        </div>
      </div>}
    {students.length === 0 && (
      <div className="loading">
        <h1>Please add students to this class.</h1>
          <button onClick={()=>setShowEditClass(true)}>Edit Class</button>
          <button className="leftgap" onClick={()=>setShowClass(null)}>Close</button>
      </div>
    )}
    {students.length > 0 && (
      <>
    <div className="header topgap">
      <button onClick={generateReport}>Generate Report</button>
      <button className="leftgap" onClick={()=>setShowImage1(true)}>Seating Plan 1</button>
      <button className="leftgap" onClick={()=>setShowImage2(true)}>Seating Plan 2</button>
      <button className="leftgap" onClick={()=>setShowEditClass(true)}>Edit Class</button>
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
            <span className="small">Student ID:{selectedStudent.studentID}</span>
            <div className="buttons-together">
              <button onClick={()=>handleAddCredit(selectedStudent.firstName, selectedStudent.lastName)}>+</button>
              <button onClick={()=>handleSubtractCredit(selectedStudent.firstName, selectedStudent.lastName)}>-</button>
              <button className="button-wide" onClick={()=>handleCallStudent(selectedStudent.firstName, selectedStudent.lastName)}>Call</button>
            </div>
            <div className="details-image">
                      
                       <img
                       className="student-image-thumb"
                      src={
                        selectedStudent.studentImage
                          ? selectedStudent.studentImage.startsWith('data:image')
                            ? selectedStudent.studentImage // Already a data URL
                            : `data:image/png;base64,${selectedStudent.studentImage}` // Assume base64 string
                          : "/image/user.png"
                      }
                      alt="Student Picture"
                    />
                      
                    </div>
            <div className="status-container">
            <ul className="student-details">
              <li><span className="label">Credits:</span> <span className="value">{selectedStudent.credits}</span></li>
              <li><span className="label">Discipline:</span> <span onClick={()=>selectDiscipline(selectedStudent.firstName, selectedStudent.lastName)} className="value"><span className={`times-called click-me ${disciplineColour(selectedStudent.discipline)}`}>{returnDiscipline(selectedStudent.discipline)}</span></span></li>
              <li><span className="label">Support:</span> <span className="value">{selectedStudent.support ? 'Yes' : 'No'}</span></li>
              <li><span className="label">Times Called:</span> <span className="value">{selectedStudent.timesCalled}</span></li>
            </ul>
            </div>
            <div className="notes-section">
              <div className="classlist-container">
                <h4>Notes:</h4>
                <button
      className="add-note-button"
      onClick={(e) => {
        e.preventDefault(); // Prevent default form submission
        if (selectedStudent.newNote?.trim()) {
          const newNoteEntry = {
            dateTime: Date.now(), // Current timestamp in epoch format
            note: selectedStudent.newNote.trim(),
          };
          setSelectedStudent((prevStudent) => ({
            ...prevStudent,
            studentNotes: [...(prevStudent.studentNotes || []), newNoteEntry], // Append new note
            newNote: "", // Clear the textarea
          }));
          updateStudentNotes(selectedStudent.studentID, [...(selectedStudent.studentNotes || []), newNoteEntry]);
        }
      }}
    >
      Add Note
    </button>
              </div>
                    <textarea
                      value={selectedStudent.newNote || ""} // Temporary field for new note
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          newNote: e.target.value, // Store the new note separately
                        })
                      }
                      rows={2}
                    />    
              <NotesTable
                key={selectedStudent?.studentID}
                notes={(() => {
                  let parsedNotes = [];
                  if (selectedStudent?.studentNotes) {
                    const rawNotes = selectedStudent.studentNotes;
                    if (Array.isArray(rawNotes)) {
                      parsedNotes = rawNotes;
                    } else if (typeof rawNotes === "string" && rawNotes.trim().length > 0) {
                      try {
                        parsedNotes = JSON.parse(rawNotes);
                      } catch (e) {
                        console.error("Failed to parse studentNotes JSON:", e);
                        parsedNotes = [];
                      }
                    }
                  }
                  return parsedNotes;
                })()}
              />
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
  
      {showEditClass && (
        <div className="modal">
          <div className="edit-class-container">
          <h2>Edit Class</h2>
          <button onClick={() => setShowEditClass(false)}>Close</button>
          <button className="leftgap" onClick={() => saveClass(students)}>Save Class</button>
          <p>Add Student: <ShowStudents config={config} setNewStudent={setNewStudent} /></p>
          <ul className="student-list-edit">
            {[...students]
              .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || '')) // Provide fallback for lastName
              .map((student, index) => (
                <li
                  key={index}
                  className="student-item"
                >
                  {student.firstName} {student.lastName}{' '}
                  <span
                    className="delete-student"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStudents(students.filter((s) => s !== student));
                      if (
                        selectedStudent &&
                        selectedStudent.firstName === student.firstName &&
                        selectedStudent.lastName === student.lastName
                      ) {
                        setSelectedStudent(null);
                      }
                    }}
                    title="Delete"
                  >
                    {/* Trashcan SVG icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </span>
                </li>
              ))}
          </ul>
          
          </div>
        </div>
      )}  

    </>
  );
}

export default ClassList;