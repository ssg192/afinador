package com.escom.afinador.util;

import java.util.HashMap;
import java.util.Map;

public class BsConstants {
    private BsConstants() {
        super();
    }

    public static final String LOCAL_DATE_TIME_FORMAT = "dd/MM/yyyy HH:mm:ss";
    public static final String LOCAL_DATE_FORMAT = "dd/MM/yyyy";
    public static final String LOCAL_TIME_FORMAT = "HH:mm:ss";
    public static final String LOCAL_TIME_FORMAT_WITHOUT_SECONDS = "HH:mm";

    public static final Map<String, Float> HZ_NOTES = Map.ofEntries(
            Map.entry("E2", 82.41f),   // 6ta cuerda
            Map.entry("A2", 110.00f),  // 5ta cuerda
            Map.entry("D3", 146.83f),  // 4ta cuerda
            Map.entry("G3", 196.00f),  // 3ra cuerda
            Map.entry("B3", 246.94f),  // 2da cuerda
            Map.entry("E4", 329.63f),  // 1ra cuerda
            Map.entry("D4", 293.66f),
            Map.entry("G4", 392.00f),
            Map.entry("A4", 440.00f)
    );
}