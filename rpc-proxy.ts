import {Receiver, Sender} from "./io.ts";
import {uuid} from "./uuid.ts";

// deno-lint-ignore ban-types
export type Proxyable = object | Function;

export type UnwrappedValue =
  | string
  | boolean
  | undefined
  | null
  | number
  | bigint
  | symbol
  | Proxyable;

export type UnwrappedValueType =
  | "string"
  | "boolean"
  | "undefined"
  | "number"
  | "bigint"
  | "function"
  | "symbol"
  | "null"
  | "proxy";

export type PropertyNameType = "string" | "symbol";

interface WrappedPropertyName {
  type: "WrappedPropertyName";
  propertyNameType: PropertyNameType;
  propertyName: string;
}

interface WrappedValue<UV extends UnwrappedValue> {
  type: "WrappedValue";
  unwrappedValueType: UnwrappedValueType;
  valueStringRepresentation: string;
}

class RpcProxyHandler<P extends Proxyable> implements ProxyHandler<P> {
  readonly #proxyId: string;
  readonly #receiver: Receiver<string>;
  readonly #sender: Sender<string>;

  constructor(
    receiver: Receiver<string>,
    sender: Sender<string>,
  ) {
    this.#proxyId = uuid();
    this.#receiver = receiver;
    this.#sender = sender;
  }

  // deno-lint-ignore ban-types
  #wrapValue<UV extends UnwrappedValue>(unwrappedValue: UV): WrappedValue<UV> {
    if (typeof unwrappedValue === "string") {
      return {
        type: "WrappedValue",
        unwrappedValueType: "string",
        valueStringRepresentation: unwrappedValue,
      };
    }
    if (typeof unwrappedValue === "boolean") {
      return {
        type: "WrappedValue",
        unwrappedValueType: "boolean",
        valueStringRepresentation: unwrappedValue ? "true" : "false",
      };
    }
    if (typeof unwrappedValue === "undefined") {
      return {
        type: "WrappedValue",
        unwrappedValueType: "undefined",
        valueStringRepresentation: "undefined",
      };
    }
    if (typeof unwrappedValue === "number") {
      return {
        type: "WrappedValue",
        unwrappedValueType: "number",
        valueStringRepresentation: `${unwrappedValue}`,
      };
    }
    if (typeof unwrappedValue === "symbol") {
      return {
        type: "WrappedValue",
        unwrappedValueType: "symbol",
        valueStringRepresentation: unwrappedValue.toString(),
      };
    }

    if (typeof unwrappedValue === "bigint") {
      return {
        type: "WrappedValue",
        unwrappedValueType: "bigint",
        valueStringRepresentation: unwrappedValue.toString(),
      };
    }

    if (unwrappedValue === null) {
      return {
        type: "WrappedValue",
        unwrappedValueType: "null",
        valueStringRepresentation: "null",
      };
    }

    if (
      typeof unwrappedValue === "object" || typeof unwrappedValue === "function"
    ) {
      return {
        type: "WrappedValue",
        unwrappedValueType: "proxy",
        valueStringRepresentation: createRpcProxy(this.#receiver, this.#sender, unwrappedValue)
      }
    }

    throw new Error(`Type ${(typeof unwrappedValue)} not implemented.`);
  }

  #wrapPropertyName(propertyName: string | symbol): WrappedPropertyName {
    if (typeof propertyName === "string") {
      return ["string", propertyName];
    }

    const symbolKey: string | undefined = Symbol.keyFor(propertyName);
    if (typeof symbolKey === "undefined") {
      throw new Error(
        `Symbol key for ${propertyName.toString()} is undefined.`,
      );
    }
    return ["symbol", symbolKey];
  }

  isExtensible(_target: T): boolean {
    return false;
  }

  // deno-lint-ignore no-explicit-any
  get(target: T, propertyName: string | symbol, receiver: any): any {
    throw new Error("Not implemented yet.");
  }

  set(
    _target: T,
    propertyName: string | symbol,
    // deno-lint-ignore no-explicit-any
    value: any,
    // deno-lint-ignore no-explicit-any
    _receiver: any,
  ): boolean {
    const wrappedPropertyName: WrappedPropertyName = this
      .#wrapPropertyName(propertyName);

    const wrappedValue: WrappedValue<T> = this.#wrapValue(value);

    const setRequest: SetRequest<T> = {
      type: "set",
      proxyId: this.#proxyId,
      wrappedPropertyName,
      wrappedValue,
    };
    this.#sender.send(JSON.stringify(setRequest));
    return true;
  }

  apply(target: T, thisArg: any, argArray: any[]): any {
    throw new Error("Not implemented yet.");
  }
}

interface SetRequest<T extends UnwrappedValue> {
  type: "set";
  proxyId: string;
  wrappedPropertyName: WrappedPropertyName;
  wrappedValue: WrappedValue<T>;
}

// deno-lint-ignore ban-types
export function createRpcProxy<T extends object>(
  receiver: Receiver<string>,
  sender: Sender<string>,
  typeTemplate: T,
): T {
  return new Proxy(
    typeTemplate,
    new RpcProxyHandler<T>(receiver, sender),
  );
}
