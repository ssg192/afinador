package com.escom.afinador.core.business.input;

import com.escom.afinador.core.entity.Afinador;
import com.escom.afinador.util.error.ErrorCodeEnum;
import io.vavr.control.Either;

public interface AfinadorService {
    /**
     * Obtiene los cents faltantes de la nota obtenida
     * @param hz herts
     * @param nota nota en cifrado americano
     * @return entidad de tipo {@link Afinador}
     */
    Either<ErrorCodeEnum, Afinador> getAfinacionByHzAndNota(Afinador afinador);
}
