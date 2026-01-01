package com.escom.afinador.util.statemachine;


import java.util.Objects;
import java.util.StringJoiner;

public class Transition {
    private Integer origin;
    private Integer destination;

    public Transition() {
        super();
    }

    public Transition(Integer origin, Integer destination) {
        this.origin = origin;
        this.destination = destination;
    }

    public Integer getOrigin() {
        return origin;
    }

    public void setOrigin(Integer origin) {
        this.origin = origin;
    }

    public Integer getDestination() {
        return destination;
    }

    public void setDestination(Integer destination) {
        this.destination = destination;
    }

    @Override
    public String toString() {
        return new StringJoiner(", ", Transition.class.getSimpleName() + "[", "]")
                .add("origin=" + origin)
                .add("destination=" + destination)
                .toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transition that = (Transition) o;
        return Objects.equals(origin, that.origin)
                && Objects.equals(destination, that.destination);
    }

    @Override
    public int hashCode() {
        return Objects.hash(origin, destination);
    }
}

