package com.escom.afinador.util.error;

public enum ErrorCodeEnum implements ErrorCode {
    // GENERAL
    CE_NOT_FOUND("No se encontró el recurso"),
    CE_ERROR("Error inesperado"),

    // SISTEMA (CE-RS-SXXX)
    CE_RNS001("Campos obligatorios"),
    CE_RNS002("Máquina de estados"),
    CE_RNS003("Elementos registrados en el sistema"),

    // NEGOCIO (CE-RN-NXXX)
    CE_RNN001("Unicidad de elementos"),
    CE_RNN002("Elementos mínimos necesarios");
    private final String detail;

    ErrorCodeEnum(String detail) {
        this.detail = detail;
    }

    @Override
    public String getName() {
        return this.toString();
    }

    @Override
    public String getDetail() {
        return this.detail;
    }
}
