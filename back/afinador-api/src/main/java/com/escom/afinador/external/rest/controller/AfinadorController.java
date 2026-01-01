package com.escom.afinador.external.rest.controller;


import com.escom.afinador.core.business.input.AfinadorService;
import com.escom.afinador.external.rest.dto.AfinadorDTO;
import com.escom.afinador.external.rest.dto.RespuestaDTO;
import com.escom.afinador.util.error.ErrorMapper;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("afinador")
@Tag(name = "Modulo de un afinador")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AfinadorController {
    private final AfinadorService afinadorService;

    @Inject
    public AfinadorController(AfinadorService afinadorService) {
        this.afinadorService = afinadorService;
    }

    @POST
    public Response getAfinador(@Valid AfinadorDTO afinadorDTO) {
        return afinadorService.getAfinacionByHzAndNota(afinadorDTO.toEntity())
                .map(RespuestaDTO::fromEntity).map(Response::ok).getOrElseGet(ErrorMapper::errorCodeToResponseBuilder).build();
    }
}
