package com.escom.afinador.external.rest.dto;

import com.escom.afinador.core.entity.Afinador;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AfinadorDTO {
    @JsonProperty
    @NotNull(message = "CE_RNS002")
    @Positive(message = "CE_RNS002")
    private Float hz;
    @JsonProperty
    private String nota;
    public Afinador toEntity() {
        return Afinador.builder()
                .nota(nota)
                .hz(hz)
                .build();
    }
}
