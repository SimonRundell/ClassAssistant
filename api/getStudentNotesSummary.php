<?php

include 'setup.php';

try {
    // Query to fetch student notes summary
    $query = "SELECT studentID, studentNotes, studentFirstName, studentLastName FROM tblstudents";

    $stmt = $mysqli->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $results = [];
    while ($row = $result->fetch_assoc()) {
        $results[] = [
            'studentID' => $row['studentID'],
            'studentFirstName' => $row['studentFirstName'],
            'studentLastName' => $row['studentLastName'],
            'studentNotes' => $row['studentNotes']
        ];
    }

    send_response($results);
} catch (Exception $e) {
    send_response('Failed to fetch student notes summary: ' . $e->getMessage(), 500);
}
?>