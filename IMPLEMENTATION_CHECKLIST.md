# Implementation & Go-Live Checklist

## Phase 0 — Server inspection and safety
- [ ] Inventory OS, CPU/RAM/GPU, disk, Docker, services, ports, proxy, TLS, firewall.
- [ ] Identify existing project/workspace; avoid destructive changes.
- [ ] Timestamped backup and rollback instructions.
- [ ] Secure secrets storage confirmed.

## Phase 1 — Foundation
- [ ] Authentication, RBAC, API security, rate limiting.
- [ ] PostgreSQL, migrations, Redis, persistent volumes.
- [ ] Health checks, structured logging, monitoring.
- [ ] Frontend/backend build and secure deployment.

## Phase 2 — Data integrations
- [ ] Hyperliquid market-data adapter and testnet/read-only checks.
- [ ] Solana RPC adapter.
- [ ] Authorized Pump.fun data adapter or clearly documented limitation.
- [ ] DEX Screener/Birdeye/GeckoTerminal adapters.
- [ ] CoinGecko adapter.
- [ ] Social/wallet-intelligence provider(s), terms verified.
- [ ] Normalized schemas, freshness, deduplication, discrepancy checks.

## Phase 3 — AI Center and Router
- [ ] OpenAI, xAI, Gemini, Claude, Ollama provider adapters.
- [ ] Model catalog/configuration and qualification registry.
- [ ] Tier 1/2/3 routing enforced.
- [ ] Tier 1 fallback tested; no Tier 3 downgrade for critical tasks.
- [ ] Tier 1 exhaustion blocks new live trades.
- [ ] Quota/429, timeout, outage, malformed output, auth errors handled.
- [ ] Circuit breaker, bounded retries, queue, telemetry.
- [ ] Ollama resource checks and UI model manager.

## Phase 4 — Agents and committee
- [ ] Scout.
- [ ] Researcher.
- [ ] Strategist.
- [ ] Risk Manager.
- [ ] Trader (sole execution actor).
- [ ] Portfolio Manager.
- [ ] Auditor.
- [ ] Committee approvals/disagreement/no-trade rules.
- [ ] Full audit trail.

## Phase 5 — Risk and paper execution
- [ ] Position sizing and risk budget.
- [ ] Daily loss and drawdown controls.
- [ ] Position/exposure/leverage caps.
- [ ] Stop validation and emergency behavior.
- [ ] Minimum-order/fee/slippage feasibility.
- [ ] Idempotency, order state machine, partial fill reconciliation.
- [ ] Kill switch.
- [ ] Paper simulation of fees, slippage, latency, partial fills, rejections.

## Phase 6 — Dashboard and notifications
- [ ] Overview, markets, discovery, wallet intelligence.
- [ ] Positions/orders/trades.
- [ ] Agent/committee activity.
- [ ] AI routing, provider health, quota/fallback.
- [ ] Ollama/local models.
- [ ] Risk center, kill switch.
- [ ] Data source health/freshness.
- [ ] Audit, alerts, settings.
- [ ] Telegram notifications/commands, if enabled.

## Phase 7 — Validation and operations
- [ ] Unit/integration/e2e tests.
- [ ] Frontend lint/type/build.
- [ ] Provider failure and fallback tests.
- [ ] Risk veto and kill-switch tests.
- [ ] Security review, secrets scan, dependency scan.
- [ ] Backup and restore verified.
- [ ] Paper trading observation period and performance report.
- [ ] Document limitations and data-provider terms.
- [ ] Live mode remains disabled until owner explicitly enables it.

## Final handoff
- [ ] `IMPLEMENTATION_REPORT.md` includes exact status (implemented/tested/partial/blocked).
- [ ] Deployment/rollback steps, URLs/ports, service names, resource usage.
- [ ] Required environment variable names only (never secret values).
- [ ] Test results, known issues, next steps.
