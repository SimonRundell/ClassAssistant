<?php
include 'setup.php';

$query = "UPDATE tblclasses SET classSemester = ?, classDay = ?, classPeriod = ?, 
                                classNamen = ?, classPicture1 = ?, classPicture2 = ?,
                                teacher = ?, location = ? WHERE Id = ?";

$stmt = $mysqli->prepare($query);

if (!$stmt) {
    log_info("Prepare failed: " . $mysqli->error);
    send_response("Prepare failed: " . $mysqli->error, 500);
    exit();
}

$stmt->bind_param("iiisssssi", $receivedData['classSemester'], $receivedData['classDay'], $receivedData['classPeriod'], 
                  $receivedData['classNamen'], $receivedData['classPicture1'], $receivedData['classPicture2'],
                  $receivedData['teacher'], $receivedData['location'], $receivedData['Id']);

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
$mysqli->close();
?>
