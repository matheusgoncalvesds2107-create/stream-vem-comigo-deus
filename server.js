import http from "node:http";

const PORT = process.env.PORT || 10000;
const STREAM_URL = process.env.STREAM_URL || "http://sapircast.caster.fm:11743/I3Pqo";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Icy-MetaData, Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Type, Icy-Br, Icy-Name, Icy-Genre");
}

const server = http.createServer((req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/health") {
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    return res.end(JSON.stringify({ok: true, service: "Vem Comigo Deus HTTPS Stream Bridge"}));
  }

  if (req.url !== "/radio") {
    res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"});
    return res.end("Use /radio");
  }

  let upstream;
  try {
    upstream = new URL(STREAM_URL);
  } catch {
    res.writeHead(500, {"Content-Type": "text/plain; charset=utf-8"});
    return res.end("STREAM_URL inválida");
  }

  const options = {
    hostname: upstream.hostname,
    port: upstream.port || 80,
    path: upstream.pathname + upstream.search,
    method: "GET",
    headers: {
      "User-Agent": "VemComigoDeus-Player/1.0",
      "Icy-MetaData": "1",
      "Connection": "keep-alive"
    }
  };

  const proxy = http.request(options, upstreamRes => {
    const contentType = upstreamRes.headers["content-type"] || "audio/mpeg";

    res.writeHead(upstreamRes.statusCode || 200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Connection": "keep-alive",
      ...(upstreamRes.headers["icy-br"] ? {"Icy-Br": upstreamRes.headers["icy-br"]} : {}),
      ...(upstreamRes.headers["icy-name"] ? {"Icy-Name": upstreamRes.headers["icy-name"]} : {}),
      ...(upstreamRes.headers["icy-genre"] ? {"Icy-Genre": upstreamRes.headers["icy-genre"]} : {})
    });

    upstreamRes.pipe(res);

    upstreamRes.on("error", () => {
      if (!res.destroyed) res.destroy();
    });
  });

  proxy.setTimeout(30000, () => proxy.destroy());

  proxy.on("error", err => {
    console.error("Erro no stream:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, {"Content-Type": "text/plain; charset=utf-8"});
      res.end("Sinal da rádio indisponível no momento.");
    } else if (!res.destroyed) {
      res.destroy();
    }
  });

  req.on("close", () => {
    if (!proxy.destroyed) proxy.destroy();
  });

  proxy.end();
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Ponte HTTPS Vem Comigo Deus ativa na porta ${PORT}`);
  console.log(`Origem: ${STREAM_URL}`);
});
