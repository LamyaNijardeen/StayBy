package com.stayby.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Checks an uploaded file by looking at its real content (the first
 * bytes), not the name or type the browser claims. Only JPG, PNG and
 * WebP pictures (and PDFs, when allowed) pass. SVG and anything else is
 * refused, and the saved file name always gets the correct extension.
 */
public final class UploadValidator {

    public static final long MAX_BYTES = 5L * 1024 * 1024;

    public record Checked(byte[] bytes, String extension) {
    }

    private UploadValidator() {
    }

    public static Checked check(MultipartFile file, boolean allowPdf)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a file");
        }

        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException(
                    "The file must be smaller than 5 MB");
        }

        byte[] bytes = file.getBytes();

        String extension = detectExtension(bytes, allowPdf);

        if (extension == null) {
            throw new IllegalArgumentException(
                    allowPdf
                            ? "Only JPG, PNG, WebP or PDF files are allowed"
                            : "Only JPG, PNG or WebP pictures are allowed");
        }

        return new Checked(bytes, extension);
    }

    private static String detectExtension(byte[] b, boolean allowPdf) {

        if (b.length >= 3
                && (b[0] & 0xFF) == 0xFF
                && (b[1] & 0xFF) == 0xD8
                && (b[2] & 0xFF) == 0xFF) {
            return ".jpg";
        }

        if (b.length >= 8
                && (b[0] & 0xFF) == 0x89
                && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return ".png";
        }

        if (b.length >= 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return ".webp";
        }

        if (allowPdf
                && b.length >= 5
                && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F'
                && b[4] == '-') {
            return ".pdf";
        }

        return null;
    }
}