package com.escom.afinador.util.error;

import jakarta.ws.rs.Produces;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Provider
public class BusinessExceptionMapper implements ExceptionMapper<BusinessException> {
    @Context
    jakarta.inject.Provider<ContainerRequestContext> containerRequestContextProvider;

    /**
     * Mapeo de las excepciones de negocio
     *
     * @param ex excepcion de negocio
     * @return response con el error 400 y un error code
     */
    @Override
    @Produces(MediaType.APPLICATION_JSON)
    //@Consumes(MediaType.APPLICATION_JSON)
    public Response toResponse(BusinessException ex) {
        log.error("Business error message: ", ex);
        ErrorMapper.getExtraRequestInfo(containerRequestContextProvider.get());
        var body = ErrorResponseDTO.builder()
                .message(Response.Status.BAD_REQUEST.name())
                .status(Response.Status.BAD_REQUEST.getStatusCode())
                .path(containerRequestContextProvider.get().getUriInfo().getPath())
                .details(List.of(ErrorMapper.buildErrorDetail(ex.getMessage())))
                .build();

        var response = Response.status(Response.Status.BAD_REQUEST).entity(body).build();
        if (ErrorCodeEnum.CE_NOT_FOUND.name().equals(ex.getMessage())) {
            body.setStatus(Response.Status.NOT_FOUND.getStatusCode());
            body.setMessage(Response.Status.NOT_FOUND.name());
            response = Response.status(Response.Status.NOT_FOUND).entity(body).build();
        }
        return response;
    }
}
