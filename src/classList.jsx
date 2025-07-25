import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import axios from 'axios';
import ShowStudents from './showStudents';
import { Spin } from 'antd';
import NotesTable from './notesTable';


const returnDiscipline = (discValue) => {
  switch (discValue) {
    case 0:
      return 'None'; 
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
  const [showCloseDialog, setShowCloseDialog] = useState(false);


  useEffect(() => {
    const fetchStudentDetails = async () => {
      const initialStudents = JSON.parse(showClass.classData).map((student) => ({
        ...student,
        credits: 0, // Initialize to zero
        discipline: 0, // Initialize to zero
        timesCalled: 0, // Initialize to zero
        notes: student.notes || '',
      }));

      // Overwrite each record in initialStudents with data from the student record, excluding credits, discipline, and timesCalled
      await Promise.all(
        initialStudents.map(async (student, idx) => {
          try {
            const details = await axios
              .get(`${config.api}/getStudentDetails.php`, {
                params: { studentID: student.studentID },
                headers: { 'Content-Type': 'application/json' },
              })
              .then((res) => res.data);

            if (details) {
              Object.assign(initialStudents[idx], {
                ...details,
                credits: 0, // Ensure credits remain zero
                discipline: 0, // Ensure discipline remains zero
                timesCalled: 0, // Ensure timesCalled remains zero
              });
            }
          } catch (error) {
            console.error('Failed to fetch student details for', student.studentID, error);
          }
        })
      );

      setStudents(initialStudents);
      if (initialStudents.length > 0) {
        setSelectedStudent(initialStudents[0]);
      }
    };

    fetchStudentDetails();
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

  // const handleNotesChange = (event, firstName, lastName) => {
  //   console.log('Updating notes for ' + firstName + ' ' + lastName);
  //   const updatedStudents = students.map(student => {
  //     if (student.firstName === firstName && student.lastName === lastName) {
  //       return { ...student, notes: event.target.value };
  //     }
  //     return student;
  //   });
   
  //   setStudents(updatedStudents);
  //   if (selectedStudent && selectedStudent.firstName === firstName && selectedStudent.lastName === lastName) {
  //     setSelectedStudent({ ...selectedStudent, notes: event.target.value });
  //   }
  // };

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

      // Reload notes from the database to ensure consistency
      const updatedNotes = await axios.get(`${config.api}/getStudentDetails.php`, {
        params: { studentID },
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.data.studentNotes);

      setStudents(prevStudents => prevStudents.map(student => {
        if (student.studentID === studentID) {
          return {
            ...student,
            studentNotes: updatedNotes,
            notes: JSON.stringify(updatedNotes),
          };
        }
        return student;
      }));

      if (selectedStudent?.studentID === studentID) {
        setSelectedStudent(prev => ({
          ...prev,
          studentNotes: updatedNotes,
          notes: JSON.stringify(updatedNotes),
        }));
      }
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
      classNamen: showClass.classNamen,
      classSemester: showClass.classSemester,
      classPeriod: showClass.classPeriod,
      classDay: showClass.classDay,
      classPicture1: showClass.classPicture1,
      classPicture2: showClass.classPicture2,
      teacher: showClass.teacher,
      location: showClass.location,
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

  const saveNotes = async (studentID, notes) => {
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
  
  const closeOutClass = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB'); // dd/mm/yyyy
  const lessonName = showClass.classNamen || '';
  const updatedStudents = students.map(student => {
    const noteEntry = {
      dateTime: Date.now(),
      note: `${formattedDate} - ${lessonName}: Credits: ${student.credits}, Discipline: ${returnDiscipline(student.discipline)}, Times Called: ${student.timesCalled}`
    };

    // Parse existing notes if needed
    let existingNotes = [];
    if (Array.isArray(student.studentNotes)) {
      existingNotes = student.studentNotes;
    } else if (typeof student.studentNotes === "string" && student.studentNotes.trim().length > 0) {
      try {
        existingNotes = JSON.parse(student.studentNotes);
      } catch {
        existingNotes = [];
      }
    }

    // Merge existing notes with the new note entry
    const mergedNotes = [...existingNotes, noteEntry];

    return {
      ...student,
      studentNotes: mergedNotes, // Update studentNotes with merged data
      notes: JSON.stringify(mergedNotes) // Ensure notes field is consistent
    };
  });

  // Update state and backend
  setStudents(updatedStudents);
  if (selectedStudent) {
    const updatedSelected = updatedStudents.find(s => s.studentID === selectedStudent.studentID);
    setSelectedStudent(updatedSelected);
  }
  updatedStudents.forEach(student => {
    updateStudentNotes(student.studentID, student.studentNotes);
  });
  setShowClass(null);

  };
    

  const handleCloseClass = () => {
    setShowCloseDialog(true);
  };

  const confirmCloseClass = (saveChanges) => {
    if (saveChanges) {
      saveClass(students); // Save the class data
    }
    setShowCloseDialog(false); // Close the dialog
    setShowClass(null); // Close the class view
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
          <button className="leftgap" onClick={()=>closeOutClass()}>Close</button>
      </div>
    )}
    {students.length > 0 && (
      <>
      <div className="classname-title">{showClass.classNamen}</div>
    <div className="header topgap">
      <button onClick={generateReport}>Generate Report</button>
      <button className="leftgap" onClick={()=>setShowImage1(true)}>Seating Plan 1</button>
      <button className="leftgap" onClick={()=>setShowImage2(true)}>Seating Plan 2</button>
      <button className="leftgap" onClick={()=>setShowEditClass(true)}>Edit Class</button>
      <button className="leftgap" onClick={handleCloseClass}>Close</button>
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

          // Ensure notes is a proper array of objects
          const existingNotes = (() => {
            if (Array.isArray(selectedStudent.studentNotes)) {
              return selectedStudent.studentNotes;
            } else if (typeof selectedStudent.studentNotes === "string" && selectedStudent.studentNotes.trim().length > 0) {
              try {
                return JSON.parse(selectedStudent.studentNotes);
              } catch (err) {
                console.error("Failed to parse studentNotes JSON:", err);
                return [];
              }
            }
            return [];
          })();

          // Append the new note
          const updatedNotes = [...existingNotes, newNoteEntry];

          // Update the state
          setSelectedStudent((prevStudent) => ({
            ...prevStudent,
            studentNotes: updatedNotes, // Store as an array
            newNote: "", // Clear the textarea
          }));

          // Optionally update the backend
          updateStudentNotes(selectedStudent.studentID, updatedNotes);
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
              <div className="topgap">
                <span>
                  Semester:
                  <span className='leftgap'>
                  <select
                    value={showClass.classSemester || 1}
                    onChange={e => {
                      setShowClass({
                        ...showClass,
                        classSemester: Number(e.target.value)
                      });
                    }}
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  </span>
                </span>
                <span className="leftgap">
                  Day:
                  <span className='leftgap'>
                  <select
                    value={showClass.classDay || 1}
                    onChange={e => {
                      setShowClass({
                        ...showClass,
                        classDay: Number(e.target.value)
                      });
                    }}
                  >
                    {[
                      { value: 1, label: "Monday" },
                      { value: 2, label: "Tuesday" },
                      { value: 3, label: "Wednesday" },
                      { value: 4, label: "Thursday" },
                      { value: 5, label: "Friday" }
                    ].map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  </span>
                </span>
                <span className="leftgap">
                  Period:
                  <span className='leftgap'>
                  <select
                    value={showClass.classPeriod || 1}
                    onChange={e => {
                      setShowClass({
                        ...showClass,
                        classPeriod: Number(e.target.value)
                      });
                    }}
                    >
                    {Array.from({ length: config.periods }, (_, i) => i + 1).map(period => (
                      <option key={period} value={period}>
                      {period}
                      </option>
                    ))}
                    </select>
                    </span>
                    </span>
                    </div>
                    <div className="form-layout">
                      <div className="form-row">
                        <label>Class Name:</label>
                        <input
                          type="text"
                          style={{ width: '50%' }}
                          value={showClass.classNamen || ""}
                          onChange={e =>
                            setShowClass({
                              ...showClass,
                              classNamen: e.target.value
                            })
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>Teacher:</label>
                        <input
                          type="text"
                          className="small-width"
                          value={showClass.teacher || ""}
                          onChange={e =>
                            setShowClass({
                              ...showClass,
                              teacher: e.target.value
                            })
                          }
                        />
                      </div>
                      <div className="form-row">
                        <label>Location:</label>
                        <input
                          type="text"
                          className="small-width"
                          value={showClass.location || ""}
                          onChange={e =>
                            setShowClass({
                              ...showClass,
                              location: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="form-row seating-plan">
                      <label>Seating Plan 1:</label>
                      <div className="seating-plan-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              setSendErrorMessage("Image must be less than 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setShowClass({
                                ...showClass,
                                classPicture1: reader.result
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {showClass.classPicture1 && (
                          <img
                            src={showClass.classPicture1}
                            alt="Seating Plan 1"
                            className="thumbnail"
                          />
                        )}
                      </div>
                    </div>
                    <div className="form-row seating-plan">
                      <label>Seating Plan 2:</label>
                      <div className="seating-plan-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              setSendErrorMessage("Image must be less than 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setShowClass({
                                ...showClass,
                                classPicture2: reader.result
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {showClass.classPicture2 && (
                          <img
                            src={showClass.classPicture2}
                            alt="Seating Plan 2"
                            className="thumbnail"
                          />
                        )}
                      </div>
                    </div>

                      
                    <p>Add Student: <ShowStudents config={config} setNewStudent={setNewStudent} /></p>
                    <div className="form-layout">
              <ul className="student-list-edit">
                {[...students]
                  .sort((a, b) => (a.lastName || '').localeCompare(b.lastName || '')) // Provide fallback for lastName
                  .map((student, index) => (
                    <li
                      key={index}
                      className="student-item form-row"
                    >
                      <span className="leftgap">
                        {student.firstName} {student.lastName}
                      </span>
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
                        style={{ marginLeft: "10px", cursor: "pointer" }}
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
        </div>
      )}

      {showCloseDialog && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Action</h3>
            <p>Do you want to save the data before closing?</p>
            <button onClick={() => confirmCloseClass(true)}>Save and Close</button>
            <button className="leftgap" onClick={() => confirmCloseClass(false)}>Close Without Saving</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ClassList;