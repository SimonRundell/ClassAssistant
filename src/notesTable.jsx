function NotesTable({ notes }) {
  // Ensure we are working with an array of note objects. If `notes` is a JSON
  // string (as might come from a back‑end), attempt to parse it. Fallback to
  // an empty array on failure.
  let parsedNotes = [];
  if (Array.isArray(notes)) {
    parsedNotes = notes;
  } else if (typeof notes === 'string' && notes.trim().length > 0) {
    try {
      parsedNotes = JSON.parse(notes);
    } catch (err) {
      console.error('Failed to parse notes JSON:', err);
      parsedNotes = [];
    }
  }

  // Log the parsed notes array for debugging
  console.log('Parsed notes array:', parsedNotes);

  return (
    <table className="notes-table">
      <thead>
        <tr>
          <th className="date-width blackText">Date/Time</th>
          <th className="blackText">Note</th>
        </tr>
      </thead>
      <tbody>
        {parsedNotes.length > 0 ? (
          // reverse() mutates the array, so clone it before reversing
          [...parsedNotes].reverse().map((note, index) => {
            try {
              // Validate that dateTime exists
              if (!note.dateTime) {
                console.warn('Missing dateTime for note:', note);
                throw new Error('dateTime is undefined');
              }
              // Convert epoch milliseconds to a JavaScript Date
              const date = new Date(note.dateTime);
              if (isNaN(date)) throw new Error('Invalid date');
              // Helper to pad numbers with leading zeros
              const pad = (n) => n.toString().padStart(2, '0');
              const formattedDate = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
              return (
                <tr key={`${note.dateTime}-${index}`}>
                  <td className="date-width">{formattedDate}</td>
                  <td>{note.note}</td>
                </tr>
              );
            } catch (error) {
              console.error('Error parsing dateTime:', error);
              return (
                <tr key={`${index}`}>
                  <td className="date-width">Invalid Date</td>
                  <td>{note.note}</td>
                </tr>
              );
            }
          })
        ) : (
          <tr>
            <td colSpan="2" className="date-width">No notes available</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default NotesTable;