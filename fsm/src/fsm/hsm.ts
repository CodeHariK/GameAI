import type { State, FSMConfig, Transition } from "./types";

export class HSM<S extends string | number | symbol = string, E extends string | number | symbol = string> {
    private _currentStateID: S;
    private history: S[] = []; // The Breadcrumbs

    // State Objects stored by ID for quick hook access
    private statesMap: Map<S, State<S, E>> = new Map();

    constructor(config: FSMConfig<S, E>) {
        this._currentStateID = config.initial;

        // Index states and their transitions
        config.states?.forEach(s => {
            this.statesMap.set(s.id, s);
        });

        // Fire initial Entry hook
        this.statesMap.get(this._currentStateID)?.onEntry?.();
    }

    get currentStateID() { return this._currentStateID; }
    get currentState() { return this.statesMap.get(this._currentStateID); }
    get canUndo() { return this.history.length > 0; }

    send(eventType: E, payload?: any): boolean {
        // 1. Find the transition by bubbling up the hierarchy
        let transition = this.findTransition(this._currentStateID, eventType);

        if (transition && (!transition.canTransition || transition.canTransition(payload))) {
            this.performTransition(transition, payload);
            return true;
        }

        console.warn(`No transition found for ${String(eventType)} in state ${String(this._currentStateID)} or its parents.`);
        return false;
    }

    private findTransition(stateID: S, eventType: E): Transition<S, E> | undefined {
        const state = this.statesMap.get(stateID);
        if (!state) return undefined;

        // Check if THIS state has the transition
        const transition = state.transitions?.find(t => t.event === eventType);
        if (transition) return transition;

        // If not, and there's a parent, ask the parent (Recursion!)
        if (state.parentId) {
            return this.findTransition(state.parentId, eventType);
        }

        return undefined;
    }

    private performTransition(transition: Transition<S, E>, payload?: any) {
        // Exit current
        this.currentState?.onExit?.(payload);

        this.history.push(this._currentStateID);
        this._currentStateID = transition.to;

        // Enter new
        this.currentState?.onEntry?.(payload);
    }

    // The Undo button
    back(): boolean {
        if (this.history.length === 0) return false;

        const previousState = this.history.pop()!;

        this.currentState?.onExit?.();
        this._currentStateID = previousState;
        this.currentState?.onEntry?.();

        return true;
    }
}