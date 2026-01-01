package com.escom.afinador.util.error;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Provider
public class ConstraintViolationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {
    @Context
    UriInfo uriInfo;

    /**
     * Interceptor para el mapeo de errores de formato en los dto
     *
     * @param e Validación que no se cumplio
     * @return Devuelve una respuesta con codigo 400 y la lista de campos no validos
     */
    @Override
    @Produces(MediaType.APPLICATION_JSON)
    //@Consumes(MediaType.APPLICATION_JSON)
    public Response toResponse(ConstraintViolationException e) {
        log.warn("ConstraintViolationException, check body");
        var errores = e.getConstraintViolations().stream()
                .map(ErrorMapper::constraintToError).toList();
        var response = ErrorResponseDTO.builder()
                .message(Response.Status.BAD_REQUEST.name())
                .status(Response.Status.BAD_REQUEST.getStatusCode())
                .path(uriInfo.getPath())
                .details(errores)
                .build();
        return Response.status(Response.Status.BAD_REQUEST).entity(response).build();
    }
}
