package com.escom.afinador.util.statemachine;

import java.util.List;
import java.util.NoSuchElementException;

public class CustomStateMachine {
    protected StateMachine stateMachine;

    public boolean isValidTransition(State origin, State destination) {
        var transition = new Transition(origin.getId(), destination.getId());
        return stateMachine.getTransitions().contains(transition);
    }

    public boolean isDoable(Action action, State state) {
        var operation = new Operation(action.getId(), state.getId());
        return stateMachine.getOperations().contains(operation);
    }

    public boolean isDoable(Action action, Integer idState) {
        if (idState == null) {
            throw new IllegalArgumentException("State ID cannot be null");
        }
        var operation = new Operation(action.getId(), idState);
        return stateMachine.getOperations().contains(operation);
    }

    public State getStateById(Integer idState) {
        return stateMachine.getStates().stream().filter(state -> state.getId().equals(idState))
                .findFirst().orElseThrow(() -> new NoSuchElementException(
                        "Element not found with id: " + idState));
    }

    public List<State> getStates() {
        return stateMachine.getStates();
    }
}
