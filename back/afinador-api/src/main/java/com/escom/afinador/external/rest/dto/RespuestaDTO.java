package com.escom.afinador.external.rest.dto;

import com.escom.afinador.core.entity.Afinador;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class RespuestaDTO {
    @JsonProperty
    private Float cents;
    @JsonProperty
    private Boolean afinado;
    @JsonProperty
    private String nota;
    @JsonProperty
    private Float hz;
    @JsonProperty
    private Boolean subir;
    @JsonProperty
    private Boolean bajar;

    public static RespuestaDTO fromEntity(Afinador afinador) {
        return RespuestaDTO.builder()
                .cents(afinador.getCents())
                .afinado(afinador.getAfinado())
                .nota(afinador.getNota())
                .hz(afinador.getHz())
                .subir(afinador.getSubir())
                .bajar(afinador.getBajar())
                .build();
    }
}
