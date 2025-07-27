<?php
include 'setup.php';

 $query = "SELECT tblstudents.*
            FROM
                tblstudents
                INNER JOIN
                tblclass_list
                ON 
                    tblstudents.studentID = tblclass_list.student_pk
                INNER JOIN
                tblclasses
                ON 
                    tblclasses.Id = tblclass_list.class_pk WHERE class_pk = ?";

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        log_info("Prepare failed: " . $mysqli->error);
        send_response("Prepare failed: " . $mysqli->error, 500);
        exit();
    }

    $stmt->bind_param("i",
        $receivedData['class_pk'],
    );

    if (!$stmt->execute()) {
        log_info("Execute failed: " . $stmt->error);
        send_response("Execute failed: " . $stmt->error, 500);
        exit();
    }

    log_info("Query: " . $query);
    log_info("Received class_pk: " . $receivedData['class_pk']);

    $result = $stmt->get_result();
if ($result) {
    $rows = mysqli_fetch_all($result, MYSQLI_ASSOC);
    log_info("Query result: " . json_encode($rows));
    $json = json_encode($rows);
    send_response(['message' => $json], 200);
} else {
    log_info("Query failed: " . $mysqli->error);
    send_response("Query failed: " . $mysqli->error, 500);
}

    $stmt->close();
    $mysqli->close();
?>