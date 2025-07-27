<?php
include 'setup.php';

 $query = "INSERT INTO tblclass_list (class_pk, student_pk) VALUES (?, ?)";

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("is",
        $receivedData['class_pk'],
        $receivedData['student_pk']
    );

       if (!$stmt->execute()) {
        log_info("Execute failed: " . $stmt->error);
        send_response("Execute failed: " . $stmt->error, 500);
        exit();
    }

    send_response("Insert successful", 200);
    $stmt->close();


$mysqli->close();
?>
