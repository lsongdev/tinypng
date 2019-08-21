## tinypng [![tinypng2](https://img.shields.io/npm/v/tinypng2.svg)](https://npmjs.org/tinypng2)

> 🐼 Tinypng API in Node.js

### Installation

```bash
$ npm install tinypng2
```

### Example

```js
const tinypng = require('tinypng2')({
  key: '-- YOUR LICENSE KEY HERE --'
});

(async () => {

  const output = await tinypng('/tmp/input.png');
  console.log(output.url);
  await output.save('/tmp/output.png');
  // resize - fit
  const fit = await output.fit(150, 100);
  await fit.save('/tmp/output-fit.png');
  
})();
```

### CLI Usage

```bash
~$ tinypng input.png output.png
```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT

This work is licensed under the [MIT license](./LICENSE).

---