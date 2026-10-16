package com.academia.server.utils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class DateTimeHelper {
    public static LocalDateTime saoPaulo() {
        return LocalDateTime.now(ZoneOffset.ofHours(-3));
    }
}
