export interface State<S extends string | number | symbol = string, E extends string | number | symbol = string> {
    id: S;
    parentId?: S;
    onEntry?: (payload?: any) => void;
    onExit?: (payload?: any) => void;
    transitions?: Transition<S, E>[];
}

export interface Event<E extends string | number | symbol = string, P = any> {
    type: E;
    payload?: P;
}

export interface Transition<S extends string | number | symbol = string, E extends string | number | symbol = string> {
    event: E;
    to: S;
    canTransition?: (payload?: any) => boolean;
}

export interface FSMConfig<S extends string | number | symbol = string, E extends string | number | symbol = string> {
    initial: S;
    states?: State<S, E>[];
}
