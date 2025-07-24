<?php
include 'setup.php';

// Sanitize and default values for received data
$receivedData['studentID'] = $receivedData['studentID'] ?? '';
$receivedData['studentFirstName'] = $receivedData['studentFirstName'] ?? '';
$receivedData['studentLastName'] = $receivedData['studentLastName'] ?? '';
$receivedData['studentTutor'] = $receivedData['studentTutor'] ?? '';
$receivedData['studentSupport'] = $receivedData['studentSupport'] ?? 0;
$receivedData['studentImage'] = $receivedData['studentImage'] ?? null;
$receivedData['studentNotes'] = json_encode($receivedData['studentNotes'] ?? []); // Encode notes as JSON

// Check if the ID already exists
$checkQuery = "SELECT id FROM tblStudents WHERE studentID = ?";
$checkStmt = $mysqli->prepare($checkQuery);

if (!$checkStmt) {
    log_info("Prepare failed: " . $mysqli->error);
    send_response("Prepare failed: " . $mysqli->error, 500);
    exit();
}

$checkStmt->bind_param("s", $receivedData['studentID']);

if (!$checkStmt->execute()) {
    log_info("Execute failed: " . $checkStmt->error);
    send_response("Execute failed: " . $checkStmt->error, 500);
    exit();
}

$checkStmt->store_result();
$idExists = $checkStmt->num_rows > 0;
$checkStmt->close();

if ($idExists) {
    // Update existing record
    $query = "UPDATE tblStudents SET studentFirstName = ?, studentLastName = ?, 
                     studentTutor = ?, studentSupport = ?,
                     studentImage = ?, studentNotes = ? WHERE studentID = ?";

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("sssisss",
        $receivedData['studentFirstName'],
        $receivedData['studentLastName'],
        $receivedData['studentTutor'],
        $receivedData['studentSupport'],
        $receivedData['studentImage'],
        $receivedData['studentNotes'],
        $receivedData['studentID']
    );

    if (!$stmt->execute()) {
        log_info("Execute failed: " . $stmt->error);
        send_response("Execute failed: " . $stmt->error, 500);
        exit();
    }

    if ($stmt->affected_rows > 0) {
        send_response("Update successful", 200);
    } else {
        send_response("No rows updated", 200);
    }

    $stmt->close();
} else {
    // Insert new record
    $query = "INSERT INTO tblStudents (studentFirstName, studentLastName, studentTutor, studentSupport, studentImage, studentNotes) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("ssssiss",
        $receivedData['studentFirstName'],
        $receivedData['studentLastName'],
        $receivedData['studentID'],
        $receivedData['studentTutor'],
        $receivedData['studentSupport'],
        $receivedData['studentImage'],
        $receivedData['studentNotes']
    );

    if (!$stmt->execute()) {
        log_info("Execute failed: " . $stmt->error);
        send_response("Execute failed: " . $stmt->error, 500);
        exit();
    }

    send_response("Insert successful", 200);
    $stmt->close();
}

$mysqli->close();
?>