# rpc-proxy

## Overview

RPC implementation for TypeScript / JavaScript, where these conditions are true:

- Two processes run in different runtime contexts (JS instances).
- Two processes can communicate with each other:
  - bi-directionally
  - asynchronously
  - ordered
  - through messages that each is one string.
- All accessible methods on the target object, or on any object given to it, are
  `async` (return a `Promise`).
- All accessible properties on the target object, or on any object given to it,
  are `readonly`.
- All accessible properties on the target object, or on any object given to it,
  have a `Promise` assigned.

The two processes are free to:

- Run as the same or different users.
- Run in the same or different machines.
- Have access to the same source code for typing and API purposes.

## Use

### Example

```typescript
import { createRpcProxy } from "https://deno.land/x/rpc-proxy/mod.ts";

class Person {
  readonly name: Promise<string>;

  constructor(name: string) {
    this.name = Promise.resolve(name);
  }

  async greet(greeting: string): Promise<string> {
    return `Why, hello to you too! Thank you for saying "${greeting}" to me :)`;
  }
}

class MyService {
  async sayHelloTo(whom: Person): Promise<string> {
    const name: string = await whom.name;
    const theirResponse: string = await whom.greet(`Hello, ${name}!`);
    return `I said hello to ${name}, and they responded:\n\n${theirResponse}`;
  }
}

const myService: MyService = createRpcProxy<MyService>({
  typeTemplate: {} as MyService,
  StringReader:  // TODO: simple way to obtain them in a way that shows their versatility. TCP sockets?
});

const myFriend: Person = new Person("Ada");
const outcome: string = await myService.sayHelloTo(myFriend);
console.log(outcome);
```

...results in this on your console:

```
I said hello to Ada, and they responded:

Why, hello to you too! Thank you for saying "Hello, Ada!" to me :)
```

### API
