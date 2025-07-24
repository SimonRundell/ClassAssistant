<?php
include 'setup.php';

$query = "SELECT * FROM tblstudents";
$stmt = $mysqli->prepare($query);

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
    $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
    header('Content-Type: application/json'); // Ensure JSON response
    echo json_encode($rows); // Directly output the JSON
    exit;
} else {
    log_info("Query failed: " . $mysqli->error);
    send_response(["error" => "Query failed: " . $mysqli->error], 500);
}
