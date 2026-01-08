package com.escom.afinador.external.rest.config;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;

@Provider
public class CorsFilter implements ContainerResponseFilter {

    @Override
    public void filter(
            ContainerRequestContext requestContext,
            ContainerResponseContext responseContext) {

        responseContext.getHeaders().putSingle(
                "Access-Control-Allow-Origin", "https://afinador-pds.netlify.app");
        responseContext.getHeaders().putSingle(
                "Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        responseContext.getHeaders().putSingle(
                "Access-Control-Allow-Headers", "Content-Type,Authorization");
    }
}
