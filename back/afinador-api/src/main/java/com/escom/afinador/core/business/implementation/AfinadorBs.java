package com.escom.afinador.core.business.implementation;

import com.escom.afinador.core.business.input.AfinadorService;
import com.escom.afinador.core.entity.Afinador;
import com.escom.afinador.util.BsConstants;
import com.escom.afinador.util.error.ErrorCodeEnum;
import io.vavr.control.Either;
import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped
public class AfinadorBs implements AfinadorService {

    private static final float TOLERANCIA_CENTS = 5f;

    @Override
    public Either<ErrorCodeEnum, Afinador> getAfinacionByHzAndNota(Afinador afinador) {

        String notaMasCercana = null;
        float hzReferencia = 0f;
        float menorDiferencia = Float.MAX_VALUE;

        if (afinador.getNota() == null && afinador.getHz() != null) {

            for (var entry : BsConstants.HZ_NOTES.entrySet()) {
                float diferencia = Math.abs(afinador.getHz() - entry.getValue());

                if (diferencia < menorDiferencia) {
                    menorDiferencia = diferencia;
                    notaMasCercana = entry.getKey();
                    hzReferencia = entry.getValue();
                }
            }

            float cents = calcularCents(afinador.getHz(), hzReferencia);

            afinador.setNota(notaMasCercana);
            afinador.setCents(cents);
            afinador.setAfinado(Math.abs(cents) <= TOLERANCIA_CENTS);
            setBanderaDireccion(afinador, cents);
        }

        if (afinador.getNota() != null && afinador.getHz() != null) {

            Float hzRef = BsConstants.HZ_NOTES.get(afinador.getNota());

            if (hzRef != null) {
                float cents = calcularCents(afinador.getHz(), hzRef);

                afinador.setCents(cents);
                afinador.setAfinado(Math.abs(cents) <= TOLERANCIA_CENTS);
                setBanderaDireccion(afinador, cents);
            }
        }

        return Either.right(afinador);
    }

    private float calcularCents(float hzEntrada, float hzReferencia) {
        return (float) (1200 * (Math.log(hzEntrada / hzReferencia) / Math.log(2)));
    }

    private void setBanderaDireccion(Afinador afinador, float cents) {
        if (Math.abs(cents) <= TOLERANCIA_CENTS) {
            afinador.setSubir(false);
            afinador.setBajar(false);
        } else if (cents < 0) {
            afinador.setSubir(true);
            afinador.setBajar(false);
        } else {
            afinador.setSubir(false);
            afinador.setBajar(true);
        }
    }

}
