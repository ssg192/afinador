package com.escom.afinador.core.entity;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class Afinador {
    private String nota;
    private Float hz;
    private Boolean afinado;
    private Float cents;
    private Boolean bajar;
    private Boolean subir;
}
