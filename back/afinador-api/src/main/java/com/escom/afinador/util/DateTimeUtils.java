package com.escom.afinador.util;

import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@NoArgsConstructor
public class DateTimeUtils {

    public static LocalDate objectToLocalDate(Object fecha) {
        LocalDate result = null;
        if (fecha != null) {
            result = ((Date) fecha).toLocalDate();
        }

        return result;
    }

    public static LocalDateTime objectToLocalDateTime(Object fecha) {
        LocalDateTime result = null;
        if (fecha != null) {
            result = ((Timestamp) fecha).toLocalDateTime();
        }

        return result;
    }

    public static LocalTime objectToLocalTime(Object timeObject) {
        LocalTime result = null;
        if (timeObject != null) {
            result = ((Time) timeObject).toLocalTime();
        }

        return result;
    }
}
