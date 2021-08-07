export type IO<T> = Receiver<T> & Sender<T>;

export type Listener<T> = (a: T) => void;

export type ListenerRemover = () => void;

export interface Receiver<T> {
  addListener(listener: Listener<T>): ListenerRemover;
}

export interface Sender<T> {
  send(a: T): void;
}
