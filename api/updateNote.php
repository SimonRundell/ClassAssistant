<?php
include 'setup.php';

$query = "UPDATE tblstudents SET studentNotes = ? WHERE studentID = ?";
$stmt = $mysqli->prepare($query);

if (!$stmt) {
    log_info("Prepare failed: " . $mysqli->error);
    send_response("Prepare failed: " . $mysqli->error, 500);
    exit();
}

$stmt->bind_param("ss", $receivedData['studentNotes'], $receivedData['studentID']);

if (!$stmt->execute()) {
    log_info("Execute failed: " . $stmt->error);
    send_response("Execute failed: " . $stmt->error, 500);
    exit();
}

if ($stmt->affected_rows > 0) {
    send_response("Notes update successful", 200);
} else {
    send_response("No rows updated", 200);
}

$stmt->close();
$mysqli->close();
?>
