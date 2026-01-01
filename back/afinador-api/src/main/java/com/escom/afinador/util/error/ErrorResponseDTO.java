package com.escom.afinador.util.error;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ErrorResponseDTO {
    private Integer status;
    private String message;
    private String path;
    private List<ErrorDetailDTO> details;
}
