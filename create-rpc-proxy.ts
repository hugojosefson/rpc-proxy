import { Receiver, Sender } from "./io.ts";

// deno-lint-ignore ban-types
export interface RpcProxyArgs<T extends object> {
  receiver: Receiver<string>;
  sender: Sender<string>;
  typeTemplate: T;
}

// deno-lint-ignore ban-types
class RpcProxyHandler<T extends object> implements ProxyHandler<T> {
  private readonly receiver: Receiver<string>;
  private readonly sender: Sender<string>;
  constructor(receiver: Receiver<string>, sender: Sender<string>) {
    this.receiver = receiver;
    this.sender = sender;
  }
}

// deno-lint-ignore ban-types
export function createRpcProxy<T extends object>(
  { receiver, sender, typeTemplate }: RpcProxyArgs<T>,
): T {
  return new Proxy(
    typeTemplate,
    new RpcProxyHandler<T>(receiver, sender),
  );
}
