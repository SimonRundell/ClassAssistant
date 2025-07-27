import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Report({ config, setShowReport, setSendErrorMessage, setSendSuccessMessage }) {

    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get(`${config.api}/getStudentNotesSummary.php`);
                const rawData = res.data;

                // Parse and calculate totals for each class
                const studentTotals = {};

                Object.values(rawData).forEach(student => {
                    const studentName = `${student.studentFirstName} ${student.studentLastName}`;

                    if (!studentTotals[studentName]) {
                        studentTotals[studentName] = {};
                    }

                    if (student.studentNotes) {
                        const notes = Array.isArray(student.studentNotes)
                            ? student.studentNotes
                            : JSON.parse(student.studentNotes);

                        notes.forEach(note => {
                            const noteText = note.note || '';

                            // Use regex to extract class name, credits, discipline, and times called
                            const classNameMatch = noteText.match(/\d{2}\/\d{2}\/\d{4}\s(.+?)\sLESSON SUMMARY:/);
                            const creditsMatch = noteText.match(/Credits:\s(\d+)/);
                            const disciplineMatch = noteText.match(/Discipline:\s([^,]+)/);
                            const timesCalledMatch = noteText.match(/Times Called:\s(\d+)/);

                            const className = classNameMatch ? classNameMatch[1].trim() : 'Unknown Class';
                            const credits = creditsMatch ? parseInt(creditsMatch[1], 10) : 0;
                            const discipline = disciplineMatch ? disciplineMatch[1].trim() : '(none)';
                            const timesCalled = timesCalledMatch ? parseInt(timesCalledMatch[1], 10) : 0;

                            if (!studentTotals[studentName][className]) {
                                studentTotals[studentName][className] = {
                                    totalCredits: 0,
                                    totalTimesCalled: 0,
                                    disciplineSummary: {}
                                };
                            }

                            studentTotals[studentName][className].totalCredits += credits;
                            studentTotals[studentName][className].totalTimesCalled += timesCalled;

                            if (!studentTotals[studentName][className].disciplineSummary[discipline]) {
                                studentTotals[studentName][className].disciplineSummary[discipline] = 0;
                            }
                            studentTotals[studentName][className].disciplineSummary[discipline]++;
                        });
                    }
                });

                setReportData(studentTotals);
                console.log('Report data parsed successfully:', studentTotals);
            } catch (err) {
                setSendErrorMessage('Failed to fetch report data.');
            }
        }
        fetchData();
    }, [config.api, setSendErrorMessage]);

    return (
        <div>
            <h2>Class Report</h2>
            {Object.keys(reportData).length === 0 ? (
                <p>No data available.</p>
            ) : (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Class Name</th>
                            <th>Total Credits</th>
                            <th>Total Times Called</th>
                            <th>Discipline Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(reportData).flatMap(([studentName, classes]) =>
                            Object.entries(classes)
                                .filter(([className]) => className !== 'Unknown Class') // Exclude 'Unknown Class'
                                .map(([className, data]) => (
                                    <tr key={`${studentName}-${className}`}>
                                        <td>{studentName}</td>
                                        <td>{className}</td>
                                        <td>{data.totalCredits}</td>
                                        <td>{data.totalTimesCalled}</td>
                                        <td>
                                            {Object.entries(data.disciplineSummary).map(([discipline, count]) => (
                                                <div key={discipline}>{discipline}: {count}</div>
                                            ))}
                                        </td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </table>
            )}
            <div className="topgap">
                <button onClick={() => setShowReport(false)}>Close Report</button>
            </div>
        </div>
    );
}

export default Report;