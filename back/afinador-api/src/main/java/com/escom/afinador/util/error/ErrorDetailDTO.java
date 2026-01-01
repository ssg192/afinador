package com.escom.afinador.util.error;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ErrorDetailDTO {
    private String code;
    private String message;
    private String path;
}
