<?php
include 'setup.php';

if (isset($_GET['studentID'])) {
    $studentID = $_GET['studentID'];
} elseif (isset($receivedData['studentID'])) {
    $studentID = $receivedData['studentID'];
} else {
    send_response("No student ID provided", 400);
    exit;
}


$query = "SELECT * FROM tblstudents WHERE studentID = ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param("s", $studentID);

if (!$stmt) {
    log_info("Prepare failed: " . $mysqli->error);
    send_response(["error" => "Prepare failed: " . $mysqli->error], 500);
}

if (!$stmt->execute()) {
    log_info("Execute failed: " . $stmt->error);
    send_response(["error" => "Execute failed: " . $stmt->error], 500);
}

$result = $stmt->get_result();

if ($result) {
    $row = $result->fetch_assoc();
    send_response($row);
    exit;
} else {
    log_info("Query failed: " . $mysqli->error);
    send_response(["error" => "Query failed: " . $mysqli->error], 500);
}
