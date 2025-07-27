<?php
include 'setup.php';

// Ensure all required fields are set, even if missing in the payload
$receivedData['classPicture1'] = $receivedData['classPicture1'] ?? null;
$receivedData['classPicture2'] = $receivedData['classPicture2'] ?? null;
$receivedData['TAs'] = $receivedData['TAs'] ?? null;

// Check if the ID is undefined, null, or empty
$idExists = isset($receivedData['Id']) && !empty($receivedData['Id']);

if ($idExists) {
    // Update existing record
    $query = "UPDATE tblclasses SET classSemester = ?, classDay = ?, classPeriod = ?, classNamen = ?, classPicture1 = ?, classPicture2 = ?, teacher = ?, TAs = ?, location = ?, classData = ? WHERE Id = ?";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("iiisssssssi",
        $receivedData['classSemester'],
        $receivedData['classDay'],
        $receivedData['classPeriod'],
        $receivedData['classNamen'],
        $receivedData['classPicture1'],
        $receivedData['classPicture2'],
        $receivedData['teacher'],
        $receivedData['TAs'],
        $receivedData['location'],
        $receivedData['classData'],
        $receivedData['Id']
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
    $query = "INSERT INTO tblclasses (classSemester, classDay, classPeriod, classNamen, classPicture1, classPicture2, teacher, TAs, location, classData) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("iiisssssss",
        $receivedData['classSemester'],
        $receivedData['classDay'],
        $receivedData['classPeriod'],
        $receivedData['classNamen'],
        $receivedData['classPicture1'],
        $receivedData['classPicture2'],
        $receivedData['teacher'],
        $receivedData['TAs'],
        $receivedData['location'],
        $receivedData['classData']
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