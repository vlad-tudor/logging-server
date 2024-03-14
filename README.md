# logging-server

Super simple logging server to aid in debugging mobile applications.
Installation:

```bash
bun install
sh install_cert.sh
bun start
```

### If you decide to run this over https, you should also:

```bash
sh install_cert.sh
bun start --ssl
```

If using npm, run `npm start -- --ssl` instead.

_NOTE: In your app, make sure you trust the certificate; for web however, you can just visit the URL in your browser & trust the certificate._
