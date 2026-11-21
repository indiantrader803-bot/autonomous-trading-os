# Autonomous Trading OS — Consolidated Specification

## Objective
Build a secure, modular, autonomous trading system with seven agents, a committee orchestrator, data/exchange connectors, centralized model routing, portfolio/risk management, execution, a web dashboard, notifications, observability, and deployment.

## Agents
- Scout: market/token discovery and watchlists.
- Researcher: token/market validation, liquidity, wallet and narrative research.
- Strategist: structured trade proposal or no-trade.
- Risk Manager: deterministic controls and veto.
- Trader: sole order execution actor.
- Portfolio Manager: allocation, balances, P&L, reserve and capital preservation.
- Auditor: independent integrity/reconciliation and append-only audit.

## Committee
Scout → Researcher → Strategist → Risk Manager → Auditor → Committee policy → Trader (only if approved). Trader repeats pre-execution controls. Fail closed on critical data/service errors. Disagreement leads to additional qualified review or no-trade, never fabricated consensus.

## AI Model Router
Providers: OpenAI, xAI/Grok, Gemini, Claude, Ollama, optional validated compatible providers. Central routing by task tier, qualification, availability, quotas, latency, context, cost, and priorities.
- Tier 1: qualified strong models for critical trading reasoning. Tier 1 fallback only.
- Tier 2: research/intelligence.
- Tier 3: routine summaries/classification; local models allowed.
- All qualified Tier 1 unavailable → block new live trades. Never downgrade critical trade reasoning to Tier 3/local.
- Deterministic Risk Engine is final authority; AI cannot override it.

## Integrations
- Hyperliquid: market/account data; testnet/paper first; execution disabled initially.
- Solana RPC: balances, SPL accounts, transactions, activity, events.
- Pump.fun: authorized discovery/launch/bonding-curve data; verify current access.
- DEX Screener, Birdeye, GeckoTerminal: pools, liquidity, volume, trades, token data.
- CoinGecko: market overview and metadata.
- Social/narrative/wallet intel: authorized data, FOMO-like discovery; no assumed API or unauthorized scraping.
- Telegram optional notifications and protected commands.

## Risk Defaults (editable; live mode off)
- Starting capital reference $10; verify actual account balances.
- 1% planned risk per trade.
- 3% daily loss limit.
- 10% maximum drawdown stop.
- Maximum one concurrent position.
- Leverage disabled in paper/development; live default 1x until explicit configuration.
- Mandatory protective stop.
- Skip infeasible min-size, fees, slippage, spread, liquidity, or risk-budget conditions.
- No martingale, averaging down, revenge trading, forced trade frequency, or profit quota.
- Kill switch blocks new orders; safe protective management must remain available.

## Security
- Secrets only in protected server-side environment or secret manager.
- AI models never receive private keys or seed phrases.
- Isolated signing/execution service; minimal key permissions, no withdrawals.
- Trader only execution role; no Docker socket in web app.
- Auth/RBAC, rate limits, audit, idempotency, order reconciliation, TLS, backups.
- Paper mode first; live activation explicitly approved for this system.

## Technology baseline
FastAPI/Python 3.12+, Next.js/React/TypeScript, PostgreSQL, Redis, Docker Compose, WebSocket/SSE, structured logging/metrics, migrations, CI-friendly tests. Adapt to existing server and repository.

## Dashboard
Overview/equity, P&L, risk, mode, markets, discovery, tokens, wallet intel, positions/orders/trades, agent committee/status/logs, AI providers/models/tiers/fallback, Ollama manager, data-source health/freshness, audit, notifications, settings, kill switch.

## Modes
1. Development
2. Read-only market-data
3. Paper trading
4. Validated approval mode
5. Live mode (off until explicit owner activation and checklist passed)

$10-to-$1M is an aspirational goal and not guaranteed. The system must prioritize capital preservation and never force trades.
