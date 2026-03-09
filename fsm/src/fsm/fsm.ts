import type { State, FSMConfig, Transition } from "./types";

export class FSM<S extends string | number | symbol = string, E extends string | number | symbol = string> {
    private _currentStateID: S;
    private history: S[] = []; // The Breadcrumbs

    // Transitions: FromState -> (ON EVENT) -> ToState
    private transitionsMap: Map<S, Map<E, Transition<S, E>>> = new Map();

    // State Objects stored by ID for quick hook access
    private statesMap: Map<S, State<S, E>> = new Map();

    constructor(config: FSMConfig<S, E>) {
        this._currentStateID = config.initial;

        // Index states and their transitions
        config.states?.forEach(s => {
            this.statesMap.set(s.id, s);

            s.transitions?.forEach(t => {
                if (!this.transitionsMap.has(s.id)) this.transitionsMap.set(s.id, new Map());
                this.transitionsMap.get(s.id)!.set(t.event, t);
            });
        });

        // Fire initial Entry hook
        this.statesMap.get(this._currentStateID)?.onEntry?.();
    }

    get currentStateID() { return this._currentStateID; }
    get currentState() { return this.statesMap.get(this._currentStateID); }
    get canUndo() { return this.history.length > 0; }

    send(eventType: E, payload?: any): boolean {
        const transition = this.transitionsMap.get(this._currentStateID)?.get(eventType);

        if (transition && (!transition.canTransition || transition.canTransition(payload))) {
            // 1. Exit current
            this.currentState?.onExit?.(payload);

            // 2. Push current to history BEFORE updating
            this.history.push(this._currentStateID);

            this._currentStateID = transition.to;

            // 3. Enter new state
            this.currentState?.onEntry?.(payload);
            return true;
        }
        return false;
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