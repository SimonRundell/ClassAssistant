import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Switch} from 'antd';
import NotesTable from './notesTable';

function ManageStudents({ config, setShowManageStudents, setSendErrorMessage, setSendSuccessMessage }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerUpdate, setTriggerUpdate] = useState(false);

  useEffect(() => {
    const fetchStudents = () => {
        setLoading(true);
        axios.get(`${config.api}/getStudents.php`, {
        headers: {
            'Content-Type': 'application/json',
        },
        })
        .then(response => {
        if (Array.isArray(response.data)) {
            setStudents(response.data);
        } else {
            console.error('Unexpected response format:', response.data);
        }
        setLoading(false);
        })
        .catch(error => {
        console.error('Error fetching students:', error);
        setSendErrorMessage('Failed to fetch students');
        setLoading(false);
        });
    };

    fetchStudents();
    }, [config.api, triggerUpdate]);

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure studentImage is base64-encoded
    const updatedStudent = {
        ...selectedStudent,
        studentImage: selectedStudent.studentImage
            ? selectedStudent.studentImage.startsWith('data:image')
                ? selectedStudent.studentImage.split(',')[1] // Extract base64 if already encoded
                : selectedStudent.studentImage // Use as-is if already base64
            : null, // Set to null if no image is provided
    };

    console.log('Updating student:', updatedStudent);

    try {
        const response = await axios.post(
            `${config.api}/insertStudent.php`,
            updatedStudent,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Insert response:', response.data);
        if (response.data.message === "Update successful") {
            setSendSuccessMessage('Student updated successfully');
            setTriggerUpdate(!triggerUpdate); // Trigger re-fetch of students
            setShowEditStudent(false); // Close the edit modal
        } else {
            setSendErrorMessage('Failed to update student');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        setSendErrorMessage('Failed to update student');
    } finally {
        setLoading(false);
    }
};

const filteredStudents = students.filter(student =>
  student.studentFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  student.studentLastName.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
    <>
    <div>
        {loading ? <div>Loading...</div> : (
            <div>
                <h2>Manage Students</h2>
                <button onClick={() => setSendErrorMessage("Not there yet")}>Add Student</button>
                <button className="leftgap" onClick={() => setShowManageStudents(false)}>Close</button>
                <div className="topgap">
                <input
                  type="text"
                  placeholder="Search by first or last name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
                />
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...filteredStudents].reverse().map(student => {
                            // When a row is clicked, ensure that the student's notes are in array form.
                            // Some back‑end APIs store notes as a JSON string, so attempt to parse it here.
                            const handleRowClick = () => {
                                let parsedNotes = [];
                                if (student.hasOwnProperty('studentNotes')) {
                                    const rawNotes = student.studentNotes;
                                    if (Array.isArray(rawNotes)) {
                                        parsedNotes = rawNotes;
                                    } else if (typeof rawNotes === 'string' && rawNotes.trim().length > 0) {
                                        try {
                                            parsedNotes = JSON.parse(rawNotes);
                                        } catch (e) {
                                            console.error('Failed to parse studentNotes JSON:', e);
                                            parsedNotes = [];
                                        }
                                    }
                                }
                                // Pass a copy of the student with parsed notes into state
                                setSelectedStudent({ ...student, studentNotes: parsedNotes });
                                setShowEditStudent(true);
                            };
                            return (
                                <tr key={student.id} onClick={handleRowClick}>
                                    <td>{student.studentID}</td>
                                    <td>{student.studentFirstName}</td>
                                    <td>{student.studentLastName}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            </div>
        )}
    </div>
    { showEditStudent && (
        <div className="modal">
            <div className="modal-content">
            <h2>Edit Student</h2>

            {selectedStudent && (
                <form onSubmit={handleUpdateStudent} className="form-layout">
                  <div className="form-row">
                    <label className="form-label">First Name:</label>
                    <input
                      type="text"
                      value={selectedStudent.studentFirstName}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          studentFirstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Last Name:</label>
                    <input
                      type="text"
                      value={selectedStudent.studentLastName}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          studentLastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Student ID:</label>
                    <input
                      type="text"
                      value={selectedStudent.studentID}
                      className="small-width"
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          studentID: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Tutor Initials:</label>
                    <input
                      type="text"
                      className="small-width"
                      value={selectedStudent.studentTutor}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          studentTutor: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Student Support:</label>
                    <Switch
                      checked={!!selectedStudent.studentSupport}
                      className="small-width"
                      onChange={(checked) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          studentSupport: checked ? "Yes" : "",
                        })
                      }
                      checkedChildren="Yes"
                      unCheckedChildren="No"
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Student Picture:</label>
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
                          setSelectedStudent({
                            ...selectedStudent,
                            studentImage: reader.result, // Use the full base64 data URL for immediate display
                          });
                        };
                        reader.readAsDataURL(file); // Read the file as a base64 data URL
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label"></label>
                    <img
                      src={
                        selectedStudent.studentImage
                          ? selectedStudent.studentImage.startsWith('data:image')
                            ? selectedStudent.studentImage // Already a data URL
                            : `data:image/png;base64,${selectedStudent.studentImage}` // Assume base64 string
                          : "/image/user.png"
                      }
                      alt="Student Picture"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Notes:</label>
                    <textarea
                      value={selectedStudent.newNote || ""} // Temporary field for new note
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          newNote: e.target.value, // Store the new note separately
                        })
                      }
                      rows={2}
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label"></label>
                    <button
                      onClick={() => {
                        if (selectedStudent.newNote?.trim()) {
                          const newNoteEntry = {
                            dateTime: Date.now(), // Current timestamp in epoch format
                            note: selectedStudent.newNote.trim(),
                          };
                          setSelectedStudent({
                            ...selectedStudent,
                            studentNotes: [...(selectedStudent.studentNotes || []), newNoteEntry], // Append new note
                            newNote: "", // Clear the textarea
                          });
                        }
                      }}
                    >
                      Add Note
                    </button>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Existing Notes:</label>
                    <div>
                      {/* Log selectedStudent.studentNotes for debugging */}
                      {console.log('Selected student notes:', selectedStudent?.studentNotes)}
                      {/* Add a unique key to NotesTable to force re-render */}
                      <NotesTable key={selectedStudent?.studentID} notes={selectedStudent?.studentNotes} />
                    </div>
                  </div>
                  <div className="form-buttons">
                    <button onClick={() => setShowEditStudent(false)}>Cancel</button>
                    <button className="leftgap" type="submit">
                      Save
                    </button>
                  </div>
                </form>
            )}
        </div>
        </div>
    )}

    </>
);
}

export default ManageStudents;