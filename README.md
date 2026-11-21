# Autonomous Trading OS — Antigravity Build Bundle

This bundle is the consolidated project blueprint and safe starting configuration for building a multi-agent autonomous trading platform.


## Included
- `ANTIGRAVITY_MASTER_PROMPT.md` — copy/paste the full build instruction into Antigravity.
- `SYSTEM_SPEC.md` — compact requirements and architecture reference.
- `RISK_DEFAULTS.yaml` — proposed conservative defaults; review before use.
- `.env.example` — names/placeholders only, no credentials.
- `IMPLEMENTATION_CHECKLIST.md` — phased validation and handoff checklist.
- `docker-compose.reference.yml` — illustrative service topology, not a production-ready deployment. Antigravity must adapt it after inspecting the server.

## Important
- Paper trading first. Live trading is disabled.
- The system does not promise profit or a $10-to-$1M outcome.
- Do not paste API keys, private keys, seed phrases, SSH credentials, or passwords into chat or AI prompts.
- Provider APIs, model IDs, exchange rules, and service compatibility must be checked against current official documentation.
- The reference Compose file is a blueprint; it is not safe to run unchanged on an unknown server.

## Use
1. Extract this ZIP locally or on your server in a working directory.
2. Open Antigravity and point it at the existing project/server workspace.
3. Paste `ANTIGRAVITY_MASTER_PROMPT.md` as the main instruction.
4. Let Antigravity inspect the server and make a backup before any changes.
5. Configure secrets locally in protected server environment/secret storage only.
6. Validate paper mode and tests before considering live trading.
