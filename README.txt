PONTE HTTPS — WEB RÁDIO VEM COMIGO DEUS

OBJETIVO:
Receber o stream HTTP do Caster e disponibilizar por HTTPS através do Render.

ORIGEM:
http://sapircast.caster.fm:11743/I3Pqo

COMO PUBLICAR:
1. Crie um repositório GitHub, por exemplo:
   stream-vem-comigo-deus

2. Envie:
   package.json
   server.js

3. No Render:
   New + > Web Service

4. Escolha o repositório.

5. Configure:
   Runtime: Node
   Build Command: deixe vazio ou npm install
   Start Command: npm start

6. Em Environment, opcional:
   STREAM_URL=http://sapircast.caster.fm:11743/I3Pqo

7. Crie o serviço.

Quando o Render gerar a URL, teste:
https://SEU-SERVICO.onrender.com/health

Depois use no player:
https://SEU-SERVICO.onrender.com/radio

IMPORTANTE:
Se o Caster bloquear proxy/relay, a ponte não conseguirá retransmitir o sinal.
Nesse caso será preciso usar um servidor de streaming compatível ou URL HTTPS oficial do provedor.
