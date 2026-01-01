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
public class RuntimeExceptionMapper implements ExceptionMapper<RuntimeException> {
    @Context
    jakarta.inject.Provider<ContainerRequestContext> containerRequestContextProvider;

    @Produces(MediaType.APPLICATION_JSON)
    //@Consumes(MediaType.APPLICATION_JSON)
    @Override
    public Response toResponse(RuntimeException ex) {
        log.error("Error message runtimeException: ", ex);
        ErrorMapper.getExtraRequestInfo(containerRequestContextProvider.get());
        var body = ErrorResponseDTO.builder()
                .message(Response.Status.INTERNAL_SERVER_ERROR.name())
                .status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode())
                .path(containerRequestContextProvider.get().getUriInfo().getPath())
                .details(List.of(ErrorMapper.buildErrorDetail(ErrorCodeEnum.CE_ERROR.name())))
                .build();
        return Response.serverError().entity(body).build();
    }
}
