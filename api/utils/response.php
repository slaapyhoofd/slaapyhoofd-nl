<?php
// Response helper functions

function jsonResponse($success, $data = null, $error = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]);
    exit;
}

function successResponse($data = null, $httpCode = 200) {
    jsonResponse(true, $data, null, $httpCode);
}

function errorResponse($error, $httpCode = 400) {
    jsonResponse(false, null, $error, $httpCode);
}

function notFoundResponse($message = 'Resource not found') {
    errorResponse($message, 404);
}

function unauthorizedResponse($message = 'Unauthorized') {
    errorResponse($message, 401);
}

function serverErrorResponse($message = 'Internal server error') {
    errorResponse($message, 500);
}
