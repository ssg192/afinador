package com.escom.afinador.util.statemachine;

import java.util.Objects;
import java.util.StringJoiner;

public class Operation {
    private Integer idAction;
    private Integer idState;

    public Operation() {
        super();
    }

    public Operation(Integer idAction, Integer idState) {
        this.idAction = idAction;
        this.idState = idState;
    }

    public Integer getIdAction() {
        return idAction;
    }

    public void setIdAction(Integer idAction) {
        this.idAction = idAction;
    }

    public Integer getIdState() {
        return idState;
    }

    public void setIdState(Integer idState) {
        this.idState = idState;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        var operation = (Operation) o;
        return Objects.equals(idAction, operation.idAction)
                && Objects.equals(idState, operation.idState);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idAction, idState);
    }

    @Override
    public String toString() {
        return new StringJoiner(", ", Operation.class.getSimpleName() + "[", "]")
                .add("idAction=" + idAction)
                .add("idState=" + idState)
                .toString();
    }
}
