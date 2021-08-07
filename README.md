# rpc-proxy

## Overview

RPC implementation for TypeScript / JavaScript, where these conditions are true:

- All methods on the target type must be async. (!!?)
- Two processes run in different runtime contexts (JS instances).
- Two processes can communicate with each other:
  - bi-directionally
  - asynchronously
  - ordered
  - through messages that are either:
    - text strings, or
    - JSON objects.

The two processes are free to:

- Run as the same or different users.
- Run in the same or different machines.
- Have access to the same source code for typing and API purposes.

## Use

### Example

```typescript
import { createRpcProxy } from "https://deno.land/x/rpc-proxy/mod.ts";

class Person {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(greeting: string): string {
    return `Why, hello to you too! Thank you for saying "${greeting}" to me :)`;
  }
}

class MyService {
  sayHelloTo(whom: Person): string {
    const theirResponse: string = whom.greet(`Hello, ${whom.name}!`);
    return `I said hello to ${whom.name}, and they responded:\n\n${theirResponse}`;
  }
}

const myService: MyService = createRpcProxy<MyService>({
  typeTemplate: {} as MyService,
  reader, writer // TODO: simple way to obtain them in a way that shows their versatility. TCP sockets?
});

const myFriend: Person = new Person("Ada");
const outcome: string = myService.sayHelloTo(myFriend);
console.log(outcome);
```

...results in this on your console:

```
I said hello to Ada, and they responded:

Why, hello to you too! Thank you for saying "Hello, Ada!" to me :)
```

### API

