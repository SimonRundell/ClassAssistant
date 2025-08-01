import React, { useState, useEffect } from 'react';
import { Spin, } from 'antd';
import axios from 'axios';
import ShowStudents from './showStudents';


function MyClasses({ config, userDetails, setShowClass, setSendErrorMessage, setSendSuccessMessage}) {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedData, setUpdatedData] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentDetailsfromRecord, setStudentDetailsfromRecord] = useState([]);

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

  

  const showClass = (item) => {
    console.log('showClass called with item:', item);
    setShowClass(item);
  }

  

  const groupClassesBySemester = () => {
    const grouped = {};
    classes.forEach((classItem) => {
      const { classSemester, classDay, classPeriod } = classItem;
      if (!grouped[classSemester]) {
        grouped[classSemester] = Array(config.periods).fill(null).map(() => Array(5).fill(null)); // config.periods, 5 days
      }
      grouped[classSemester][classPeriod - 1][classDay - 1] = classItem; // Map class to the correct period and day
    });
    return grouped;
  };

  const groupedClasses = groupClassesBySemester();

  if (isLoading) {
    return (
      <div className="central-overlay-spinner">
        <div className="spinner-text">
          <Spin size="large" />&nbsp;&nbsp;
          Loading classes for {userDetails.teacherName} ({userDetails.teacherCode})
        </div>
      </div>
    );
  }

const handleCellClick = (periodIndex, dayIndex, classItem) => {
    console.log(`Clicked cell at Period ${periodIndex + 1}, Day ${dayIndex + 1}`);
    if (classItem) {
      showClass(classItem); // Show class details
    } else {
      setShowClass({
        classSemester: 1, // Default semester
        classDay: dayIndex + 1, // Pre-populate day
        classPeriod: periodIndex + 1, // Pre-populate period
      });
      setShowEditClass(true); // Open edit class modal
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
      {Object.keys(groupedClasses).length > 0 ? (
        <div>
          <h1>Timetable for {userDetails.teacherName} ({userDetails.teacherCode})</h1>
          {Object.entries(groupedClasses).map(([semester, timetable]) => (
            <div key={semester} className="semester-container">
              <h2>Semester {semester}</h2>
              <table className="timetable-grid">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                  </tr>
                </thead>
                <tbody>
                  {timetable.map((period, periodIndex) => (
                    <tr key={periodIndex}>
                      <td>Period {periodIndex + 1}</td>
                      {period.map((classItem, dayIndex) => (
                        <td
                          key={dayIndex}
                          onClick={() => handleCellClick(periodIndex, dayIndex, classItem)}
                        >
                          {classItem ? (
                            <div className="class-item">
                              <strong>{classItem.classNamen}</strong>
                              <br />
                              {classItem.location}
                              <br />
                              {classItem.teacher}
                            </div>
                          ) : (
                            <div className="free-period" onClick={() => setShowEditClass(true)}>Free</div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div>No classes found.</div>
      )}

    </>
  );
}

export default MyClasses;