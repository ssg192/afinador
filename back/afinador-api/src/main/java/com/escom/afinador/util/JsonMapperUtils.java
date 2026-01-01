package com.escom.afinador.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;


@Slf4j
public class JsonMapperUtils {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private JsonMapperUtils() {super();}

    /**
     * Convierte un objeto a JSON
     *
     * @param object objeto a convertir a JSON
     * @param <T>    Objeto genérico a convertir a JSON
     * @return objeto en formato JSON
     */
    public static <T> String toJson(T object) {
        String result = objectMapper.createObjectNode().toString();
        try {
            result = objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException ex) {
            log.error("Error al generar JSON ", ex);
        }
        return result;
    }

    /**
     * Convierte un JSON a un objeto
     *
     * @param json  json a convertir en objeto
     * @param clazz clase del objeto a convertir
     * @return instancia de la clase recibida
     */
    public static <T> T toObject(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("Error al generar Objeto: ", e);
            return null;
        }
    }


    /**
     * Convierte un objeto a un {@link ObjectNode}
     *
     * @param object objeto a convertir
     * @param <T>    objeto genérico a convertir
     * @return objeto de tipo {@link ObjectNode}
     */
    public static <T> ObjectNode toObjectNode(T object) {
        ObjectNode result = objectMapper.createObjectNode();
        try {
            result = (ObjectNode) objectMapper.readTree(objectMapper.writeValueAsString(object));
        } catch (JsonProcessingException ex) {
            log.info("Error al generar JSON");
        }
        return result;
    }

    /**
     * Agrega un {@link JsonNode} con su respectiva llave a un {@link ObjectNode}
     *
     * @param objectNode objeto de tipo {@link ObjectNode}
     * @param key        llave del nodo a agregar
     * @param jsonNode   objeto de tipo {@link JsonNode}
     * @return objeto de tipo {@link ObjectNode}
     */
    public static ObjectNode addJsonNode(ObjectNode objectNode, String key, JsonNode jsonNode) {
        objectNode.set(key, jsonNode);
        return objectNode;
    }

    /**
     * Convierte un json a una lista de objetos
     *
     * @param json json a convertir en lista dw objetos
     * @return lista de objetos
     */
    public static <T> List<T> toList(String json, Class<T> tClass) {
        List<T> result = new ArrayList<>();
        try {
            CollectionType lisType = objectMapper.getTypeFactory().constructCollectionType(ArrayList.class, tClass);
            return objectMapper.readValue(json, lisType);
        } catch (JsonProcessingException e) {
            log.error("Error al generar lista de objetos: ", e);
        }
        return result;
    }


}
