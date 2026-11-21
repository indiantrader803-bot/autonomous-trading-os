# MASTER BUILD PROMPT — AUTONOMOUS TRADING OS

You are Antigravity acting as the senior architect, full-stack engineer, DevOps engineer, AI engineer, security engineer, and QA lead. Build a production-oriented Autonomous Trading OS in the user's EXISTING server and hosting environment. Do not merely provide a plan, mockup, static dashboard, or demo. Inspect the environment, make a backup, implement the project, run tests, and leave it deployable. Do not assume server OS, CPU/RAM, disk, existing containers, ports, domains, or credentials—discover first.


## 0. WORKING RULES
- Start with a read-only inventory: OS, CPU, RAM, disk, GPU, Docker/Compose, running containers, ports, existing apps, firewall, reverse proxy, domain/TLS, and available storage. Avoid disrupting existing services.
- Create a timestamped backup of relevant configuration before modifying anything. Produce a rollback plan.
- Build real integrations and working backend flows. Never present mock data as live data. Clearly label simulated/demo data and paper trading.
- Use official SDKs, docs, and authorized APIs. Verify current API availability, terms, rate limits, authentication, and endpoints. Do not invent endpoints or scrape restricted sources.
- Keep secrets out of source code, frontend bundles, logs, prompts, screenshots, and Git. Use protected server-side environment/secrets configuration. Never request secrets in chat.
- Do not expose wallet seed phrases, private keys, or signing secrets to any AI model. Signing must be isolated behind a secure execution service with explicit allowlisted actions and limits.
- Exchange keys must use minimum required permissions and withdrawal permissions must be disabled. Do not expose Docker socket to the web app.
- Start in PAPER/DRY-RUN mode. Live trading is disabled until a complete validation checklist is passed and the user explicitly enables it for THIS system.
- No profitability promises. Never force a trade to meet a target. No martingale, revenge trading, loss recovery escalation, or averaging down.
- If required data, risk checks, signer, model, or services are unavailable/uncertain, fail closed: no new live order.
- Make progress in the repository. If blocked, record exact blocker and continue with independent tasks. Do not stop after a proposal.

## 1. PRODUCT
Create a secure Autonomous Trading OS with a web dashboard, backend API, data integrations, seven AI agents, committee/orchestrator, model routing/fallback, portfolio/risk systems, execution controls, notifications, monitoring, audit trail, and deployment/backup.

## 2. AGENTS — SEVEN MEMBER COMMITTEE
1. SCOUT: discovers markets/tokens, emerging trends, volume/liquidity changes, unusual activity, launch opportunities, and watchlist candidates. It never places orders.
2. RESEARCHER: validates assets, liquidity/exit depth, token/mint metadata, holder concentration, wallet activity, launch/migration status, contract/security risks where trustworthy data exists, news/social narrative, and evidence/source freshness. Clearly state uncertainty.
3. STRATEGIST: analyzes market regime, technical structure, volatility, trend/momentum, VWAP, EMA, volume, funding/open interest when available, order-book/flow evidence, and proposes long/short/no-trade with entry, invalidation, stop, target, R:R, time horizon, and rationale.
4. RISK MANAGER: deterministic risk engine plus independent AI review. Has veto authority. Checks account state, available collateral, exposure, sizing, leverage, daily loss, drawdown, liquidity, slippage, data freshness, protective stop, and configured rules. AI cannot override deterministic controls.
5. TRADER: the ONLY service/agent authorized to submit, amend, or close orders. It receives a fully approved trade ticket from the committee, rechecks controls immediately before execution, and uses idempotency. No other agent has exchange signing/order permissions.
6. PORTFOLIO MANAGER: balances, allocations, reserve, exposure, realized/unrealized P&L, performance, risk-adjusted metrics where available, and capital preservation. It may recommend reallocation but cannot bypass Risk Manager.
7. AUDITOR: independent checks of source quality, agent inputs, trade proposal consistency, risk decisions, order/fill/position reconciliation, discrepancies, and complete append-only audit records. It must not have execution permissions.

## 3. COMMITTEE WORKFLOW
For each candidate:
- Scout creates a candidate with source, timestamps, and confidence.
- Researcher validates and enriches; invalid, scam-like, stale, unverified, illiquid, or insufficiently supported candidates are rejected or quarantined.
- Strategist creates a structured proposal or NO-TRADE.
- Risk Manager runs deterministic checks and may veto.
- Auditor checks proposal integrity and material discrepancies.
- Committee policy evaluates required approvals and disagreement. Do not fabricate consensus. Material disagreement on direction, entry, invalidation, risk, or data quality leads to additional qualified analysis or NO TRADE.
- Only Trader receives a signed/approved trade ticket. Trader repeats all risk and freshness checks immediately before order submission.
- Record every stage, reason, timestamps, model/provider, source, and outcome.
- If any critical service/check fails, block new live trades. Existing positions still need protective management and alerts.

## 4. AI MODEL ROUTER (CENTRALIZED)
Implement one central Model Router used by all agents. Support provider adapters for OpenAI, xAI/Grok, Google Gemini, Anthropic Claude, and Ollama/local models; add other OpenAI-compatible providers only via validated configurable adapters. Provider/model IDs must be discovered from current provider catalogs or configured, not guessed or hardcoded as stale values.

### Capability tiers
- TIER 1 — CRITICAL TRADING REASONING: only explicitly qualified strong models may be used for final trade analysis, regime decisions, long/short direction, entry/exit/invalidation, complex strategy analysis, committee disagreement, high-risk token assessment, and final approval reasoning.
- TIER 2 — RESEARCH: qualified models for research, narratives, social sentiment, wallet/token analysis, market trends, and news.
- TIER 3 — ROUTINE: summaries, classification, formatting, routine alerts, reports, watchlists. Smaller local models may be used.

### Mandatory policy
- Critical trade reasoning MUST use a qualified Tier 1 model. Tier 3/local models must NEVER be silently substituted for Tier 1.
- Tier 1 fallback is only to another qualified Tier 1 model.
- If all qualified Tier 1 models are unavailable, rate-limited, over quota, timed out, unhealthy, or fail validation: BLOCK NEW LIVE TRADES and return NO-TRADE/SAFE-HALT. Routine jobs may continue with Tier 2/3.
- Qualification must be explicit, task-specific, configurable, benchmarked, tested with structured output, context requirements, tool behavior, timeouts, and evaluation results. Do not automatically mark a provider/model as strong based on brand alone.
- A model's output is advisory. Deterministic risk controls remain authoritative.

### Automatic fallback and resilience
Detect rate limits/429, quota exhausted, provider outage/5xx, timeout, network failure, model unavailable, auth failure, malformed/partial output, context overflow, and safety refusal. Use retry limits, exponential backoff with jitter, circuit breakers, request queues, and provider health. Authentication/permission errors should not loop endlessly. Switch only to a qualified model for the current task tier. Do not bypass provider limits.

Router should consider task tier, model capability, provider health, latency, quotas, context, cost budgets, and configurable priority. Log request ID, agent, task, primary, selected fallback, tier, reason, provider error, retry count, latency, cost estimate if available, and validation status. Provide admin configuration and health dashboard.

### Strong-model committee option
For critical proposals, run two independent qualified Tier 1 analyses where configured, compare direction, rationale, entry, stop, target, R:R, and assumptions. Material disagreement triggers a third qualified review or NO TRADE. Agreement is not a profitability guarantee.

## 5. DATA AND EXCHANGE CONNECTORS
Build modular provider adapters with secure config and normalized schemas, not tightly coupled provider logic.

### Hyperliquid
- Market metadata, symbols, prices/mids, order book, candles, trades, funding, open interest/market statistics where officially available.
- Account balances, positions, orders, fills only when authorized.
- WebSocket live data, reconnects, heartbeat, backoff, rate limits, timestamps, data freshness, deduplication.
- Testnet/paper support first. Live order submission disabled by default.

### Solana RPC
- Configurable RPC HTTP and WebSocket providers.
- Wallet balances, SPL token accounts, transaction/signature history, account activity, confirmation/event data as available.
- RPC credentials are not signing permissions.

### Pump.fun / launch ecosystem
- Authorized token discovery, mint address, metadata, launch/bonding-curve metrics, trades, volume, liquidity, holders, migration status, and exit liquidity where supported.
- Verify current official or authorized data access. If unavailable, use documented provider adapters and mark fields unavailable rather than fabricating them.
- Verify token mint addresses; distinguish verified from unverified metadata.

### DEX and market data
- Modular adapters for DEX Screener, Birdeye, GeckoTerminal, CoinGecko and other authorized providers.
- Price, pair/pool, liquidity, volume, buys/sells, price changes, market cap/FDV if trustworthy, OHLCV, metadata.
- Cache, source timestamps, provider attribution, freshness, rate limits, discrepancy handling.

### Social/narrative/wallet intelligence
- FOMO-like capabilities: trends, narrative acceleration, social mentions/sentiment, attention/hype, public wallet analytics, smart-wallet tracking, and activity alerts using authorized sources.
- Do NOT assume any FOMO-branded app has an API. Verify access, licensing, and terms first. Treat social sentiment as weak evidence and never as a sole trade trigger.

## 6. NORMALIZED DATA AND QUALITY
Create canonical schemas for Market, Token, Wallet, Pool, Candle, OrderBookSnapshot, Signal, Opportunity, TradeProposal, TradeTicket, Order, Fill, Position, PortfolioSnapshot, AgentRun, ModelRoute, ProviderHealth, RiskCheck, AuditEvent.
Every external observation includes provider/source, observed_at, received_at, freshness, confidence, validation status, and raw reference where safely retained.
Implement checks for stale/missing/duplicate/conflicting/impossible data, source reliability, invalid mint/symbol mismatches, liquidity/volume inconsistencies, and provider disagreement. Uncertain data blocks critical decisions.

## 7. RISK AND CAPITAL POLICY — CONFIGURABLE, DEFAULT SAFE
Use the following proposed starting defaults, all editable from protected settings:
- Starting capital reference: $10 (actual balance must be read and verified; do not assume it exists).
- Risk budget per trade: 1% of available equity/collateral.
- Daily loss limit: 3% of start-of-day equity.
- Maximum drawdown stop: 10% from configured peak equity.
- Maximum simultaneous open positions: 1.
- Leverage: disabled in paper/development; live leverage capped by an explicitly configured maximum and instrument/exchange rules. Default maximum is 1x until explicitly configured.
- Long and short only where exchange/instrument allows.
- Mandatory protective stop on every live position/order, with verified order type and reduce-only behavior where supported.
- Trade must be skipped if minimum order size, fees, slippage, spread, liquidity, or stop distance makes risk budget infeasible.
- No martingale, grid-loss recovery, forced compounding, revenge trades, or averaging down.
- No fixed daily profit target and no trade quota.
- Enforce daily loss, drawdown, position count, exposure, leverage, order value, max slippage, liquidity, price deviation, and stale data limits before order and before execution.
- Kill switch blocks new orders; position management/closing and protective orders must remain available where safe. Provide clearly defined emergency behavior and manual controls.
- $10-to-$1M is an aspirational user goal, not a promised outcome; never optimize the system to chase it or increase risk automatically.

## 8. EXECUTION AND SECURITY
- Trader is sole execution actor. Backend permission checks—not UI controls—enforce this.
- Separate read-only market-data credentials from trading credentials.
- Use isolated signing/execution service, allowlisted operations, limits, request idempotency, order state machine, confirmation of exchange response, fill reconciliation, and safe handling of partial fills/rejections.
- No withdrawals or transfer permissions. Never expose private keys/seed phrases to agents, LLMs, browser, frontend, logs, or Git.
- Live trading must require an explicit user-controlled system setting and successful validation. Coinbase or other existing account permissions do not automatically authorize this new system.
- Paper trading must simulate fees, spread, slippage, latency, partial fills and rejection scenarios as reasonably configurable; clearly label simulation.
- Execution service must block unauthorized symbol/venue, order types, oversized orders, duplicate orders, invalid stop, stale market data, and risk breaches.

## 9. OLLAMA — MANAGED INSIDE THE APP
Install/manage Ollama as a service/container appropriate to discovered resources. Do not expose its API publicly. Persistent model volume, health checks, resource-aware settings, model download progress, cancellation, disk/RAM checks, list/install/remove/load/unload/test model actions. UI page: AI Center → Local Models → Ollama. Backend allowlists model-management operations; no arbitrary shell from browser. Agents assignable to models by task tier; local models only qualify for their configured capabilities. Inspect server capacity before pulling large models. The user's earlier local machine had 16 GB RAM and Qwen3 8B/DeepSeek-R1 8B, but server capacity is unknown; do not assume the server can run them.

## 10. WEB DASHBOARD
Responsive, authenticated dashboard with:
- Overview: equity, balance, available collateral, P&L, drawdown, exposure, mode (paper/live), health.
- Markets: watchlists, market regime, price/candles, volume, funding/open interest where available, liquidity and source freshness.
- Discovery: new/trending tokens, launch activity, risk flags, migration, liquidity, volume and wallet intel.
- Positions/orders/trades: lifecycle, TP/SL, status, partial fills, history, fees.
- Seven-agent committee: status, tasks, proposals, votes/approvals/vetoes, evidence and logs.
- AI Center: provider/model registry, tiers, qualifications, assignments, route priorities, health, quota/rate status, latency, cost, fallback history, queue, evaluation results.
- Ollama/local model manager.
- Risk center: all limits, active blocks, drawdown, daily loss, exposure, kill switch.
- Data sources: provider health, freshness, latency, rate limits, discrepancies.
- Audit trail, notifications, settings, backup/restore status.
- Real-time updates via WebSocket/SSE as appropriate.
Use a coherent, accessible design. Never show fake live metrics. If data unavailable, display explicit empty/error/connection state.

## 11. NOTIFICATIONS AND COMMANDS
Optional Telegram integration with protected bot token/chat config. Notifications for trade proposals, approvals/vetoes, executions, stops, provider/model fallback, Tier 1 unavailable safe-halt, risk breach, kill switch, data outages, and service failures. Commands may support status, pause, resume paper mode, emergency stop, but only authenticated/allowlisted commands; live trading enable must be protected and explicit.

## 12. TECH STACK AND DEPLOYMENT
Use maintainable, typed, testable architecture. Suggested baseline:
- Backend: Python 3.12+, FastAPI, Pydantic, asyncio.
- Frontend: Next.js/React + TypeScript.
- PostgreSQL for durable records; Redis for cache/queues.
- Docker Compose for services; adapt to the discovered environment without disrupting existing apps.
- WebSocket/SSE for real-time updates.
- Structured logs, metrics, tracing/health, error reporting, monitoring, and backup/restore.
- Reverse proxy and TLS only if available/configured; avoid port conflicts.
- Authentication, role-based permissions, secure session handling, CSRF protection where relevant, rate limits, audit logging, and secrets management.
- Versioned database migrations, automated tests, CI-friendly scripts, and documentation.

Suggested structure (adapt to repo):
backend/{api,auth,agents,orchestrator,ai_router,providers,integrations,risk,execution,portfolio,db,notifications,monitoring}
frontend/{app,components,features,lib}
infra/{docker,proxy,monitoring,backup}
config/{agents,models,risk,providers}
tests/{unit,integration,e2e}
docs/{architecture,setup,operations,security,runbooks}

## 13. DATABASE AND API
Create migrations and repositories for users/roles, agent definitions/runs, markets/tokens/wallets/pools, observations, signals/opportunities/proposals, committee reviews, risk checks, model registry/qualification/evaluations/routes/fallback events, provider health, orders/fills/positions/trades, portfolio snapshots/allocations, notifications, settings, system events, and append-only audit events.
Implement versioned REST endpoints and real auth. Examples (adapt):
- `/api/v1/health`, `/api/v1/system/status`
- `/api/v1/markets`, `/api/v1/markets/{symbol}`, `/orderbook`, `/candles`
- `/api/v1/discovery/trending`, `/new`, `/tokens/{mint}`
- `/api/v1/wallets/{address}`, `/activity`
- `/api/v1/agents`, `/agents/{id}/runs`, `/committee/proposals`
- `/api/v1/models`, `/router/status`, `/router/events`, `/providers/status`
- `/api/v1/portfolio`, `/positions`, `/orders`, `/trades`
- `/api/v1/risk/status`, `/risk/settings`, `/kill-switch`
- `/api/v1/audit`, `/api/v1/notifications`, `/api/v1/settings`
All endpoints must validate permissions and return truthful live/simulated/provider-unavailable status.

## 14. TESTING AND ACCEPTANCE
Write and run:
- Unit tests for risk, sizing, stop validation, tier routing, provider health, schemas, idempotency, state transitions.
- Integration tests with provider mocks/fixtures clearly marked test-only, plus safe live read-only checks when credentials/API availability allow.
- Fallback tests for 429/quota, outage, timeout, auth error, context overflow, malformed output, Tier 1 exhaustion, and routine local fallback.
- Ensure Tier 3 cannot route critical tasks; all Tier 1 unavailable blocks live trade.
- Tests for stale data, contradictory sources, low liquidity, invalid token, order duplicate, partial fill, exchange rejection, stop missing, risk veto, kill switch.
- Paper trading simulation and reconciliation tests.
- Frontend build/lint/type checks, auth, responsive dashboard, API integration.
- Backup/restore test or documented validated procedure.

Acceptance: no mock-only dashboard; integrations use real supported sources or clearly reported unavailable states; seven agents and routing work; risk controls are enforced server-side; Trader is sole execution path; live mode remains off; all tests and deployment/rollback docs are provided.

## 15. DELIVERY PROCESS
1. Inspect and report current environment, repository, and risks.
2. Backup and document rollback.
3. Create architecture and implementation plan, then proceed without waiting for approval for non-destructive work.
4. Implement in phases: foundation/auth/database → integrations/data normalization → model router → agents/committee → risk → paper execution → dashboard → notifications/monitoring → deployment.
5. Use secure placeholders in `.env.example`. Never write actual secrets into tracked files.
6. Run migrations, tests, lint, build, health checks, and read-only integration checks.
7. Deploy only non-disruptively; avoid taking down existing services. Live execution remains disabled.
8. Produce `IMPLEMENTATION_REPORT.md` with completed features, architecture, files, services/ports, environment variables required (names only), tests/results, limitations, security review, backup/rollback, access instructions, and exact steps the owner must perform to approve live trading.
9. Clearly distinguish implemented, tested, partial, blocked, and not implemented. Do not claim success for a feature that was only scaffolded.

BEGIN by inspecting the environment and repository. Then execute the work.
