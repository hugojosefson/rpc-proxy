// deno-lint-ignore ban-types
export interface RpcProxyArgs<T extends object> {
  reader: Deno.Reader;
  writer: Deno.Writer;
  typeTemplate: T;
}

// deno-lint-ignore ban-types
class RpcProxyHandler<T extends object> implements ProxyHandler<T> {
  private readonly reader: Deno.Reader;
  private readonly writer: Deno.Writer;
  constructor(reader: Deno.Reader, writer: Deno.Writer) {
    this.reader = reader;
    this.writer = writer;
  }
}

// deno-lint-ignore ban-types
export function createRpcProxy<T extends object>(
  { reader, writer, typeTemplate }: RpcProxyArgs<T>,
): T {
  return new Proxy(
    typeTemplate,
    new RpcProxyHandler<T>(reader, writer),
  );
}
