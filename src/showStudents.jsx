import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ShowStudents({ config, setNewStudent }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentID, setSelectedStudentID] = useState(""); // Track the selected student ID

  useEffect(() => {
    setLoading(true);
    console.log('Fetching students from:', `${config.api}/getStudents.php`);
    axios
      .get(`${config.api}/getStudents.php`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        console.log('Raw response data:', response.data);
        if (Array.isArray(response.data)) {
          setStudents(response.data); // Directly use the response data if it's an array
          console.log('Students set successfully:', response.data);
        } else {
          console.error('Unexpected response format:', response.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
        setLoading(false);
      });
  }, [config.api]);

  const handleSelectionChange = (e) => {
    const studentID = e.target.value;
    setSelectedStudentID(studentID); // Update the selected student ID
    if (studentID) {
      const selectedStudent = students.find((student) => student.studentID === studentID);
      setNewStudent(selectedStudent); // Pass the selected student object
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Sort students by studentLastName ASC before rendering
  const sortedStudents = [...students].sort((a, b) =>
    a.studentLastName.localeCompare(b.studentLastName)
  );

  return (
    <div>
      {sortedStudents.length === 0 ? (
        <div>No students found.</div>
      ) : (
        <select value={selectedStudentID} onChange={handleSelectionChange}>
          <option value="">Select a student</option>
          {sortedStudents.map((student) => (
            <option key={student.studentID} value={student.studentID}>
              {student.studentFirstName} {student.studentLastName} {student.studentID}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default ShowStudents;

