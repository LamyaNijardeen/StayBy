package com.stayby.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

/** Friendly answer when a file is bigger than the server allows. */
@RestControllerAdvice
public class UploadExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> tooLarge(
            MaxUploadSizeExceededException e
    ) {
        return ResponseEntity
                .status(413)
                .body(Map.of(
                        "message",
                        "The file is too large. Please choose one smaller than 5 MB."
                ));
    }
}