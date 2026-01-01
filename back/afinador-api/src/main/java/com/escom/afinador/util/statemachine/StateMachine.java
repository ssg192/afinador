package com.escom.afinador.util.statemachine;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.StringJoiner;

public class StateMachine {
    @JsonProperty("id")
    private String id;
    @JsonProperty("name")
    private String name;
    @JsonProperty("states")
    private List<State> states = new ArrayList<>();
    @JsonProperty("transitions")
    private List<Transition> transitions = new ArrayList<>();
    @JsonProperty("actions")
    private List<Action> actions = new ArrayList<>();
    @JsonProperty("operations")
    private List<Operation> operations = new ArrayList<>();

    public StateMachine() {
        super();
    }

    public StateMachine(String id, String name,
            List<State> states,
            List<Transition> transitions,
            List<Action> actions,
            List<Operation> operations) {
        this.id = id;
        this.name = name;
        this.states = states;
        this.transitions = transitions;
        this.actions = actions;
        this.operations = operations;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<State> getStates() {
        return states;
    }

    public void setStates(List<State> states) {
        this.states = states;
    }

    public List<Transition> getTransitions() {
        return transitions;
    }

    public void setTransitions(List<Transition> transitions) {
        this.transitions = transitions;
    }

    public List<Action> getActions() {
        return actions;
    }

    public void setActions(List<Action> actions) {
        this.actions = actions;
    }

    public List<Operation> getOperations() {
        return operations;
    }

    public void setOperations(List<Operation> operations) {
        this.operations = operations;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StateMachine that = (StateMachine) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return new StringJoiner(", ", StateMachine.class.getSimpleName() + "[", "]")
                .add("id='" + id + "'")
                .add("name='" + name + "'")
                .toString();
    }
}