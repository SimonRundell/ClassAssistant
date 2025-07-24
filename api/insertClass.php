<?php
include 'setup.php';

// Check if the ID already exists
$checkQuery = "SELECT Id FROM tblclasses WHERE Id = ?";
$checkStmt = $mysqli->prepare($checkQuery);

if (!$checkStmt) {
    log_info("Prepare failed: " . $mysqli->error);
    send_response("Prepare failed: " . $mysqli->error, 500);
    exit();
}

$checkStmt->bind_param("i", $receivedData['Id']);

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
    $query = "UPDATE tblclasses SET classSemester = ?, classDay = ?, classPeriod = ?, classNamen = ?, classPicture1 = ?, classPicture2 = ?, teacher = ?, TAs = ?, location = ?, classData = ?, classReport = ? WHERE Id = ?";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("iiissssssssi",
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
        $receivedData['classReport'],
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
    $query = "INSERT INTO tblclasses (classSemester, classDay, classPeriod, classNamen, classPicture1, classPicture2, teacher, TAs, location, classData, classReport) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("iiissssssss",
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
        $receivedData['classReport']
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