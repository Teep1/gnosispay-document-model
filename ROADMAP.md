# GnosisPay Banking App - Revolut Standard Roadmap

## Phase 1: Foundation (Core Banking UI)
- [ ] **Account Dashboard** - Balance cards, quick actions, recent activity
- [ ] **Transaction Feed** - Infinite scroll, rich transaction details, merchant logos
- [ ] **Token Balances** - Multi-currency view (GBPe, EURe, USDC, XDAI)
- [ ] **Pull-to-refresh** - Real-time balance updates

## Phase 2: Analytics & Insights (Revolut-style)
- [ ] **Spending Categories** - Auto-categorize transactions (Food, Transport, etc.)
- [ ] **Monthly Insights** - "You spent 23% more on dining this month"
- [ ] **Cash Flow** - Income vs Expenses over time
- [ ] **Merchant Breakdown** - Top merchants, spending patterns
- [ ] **Weekly/Monthly Reports** - Automated financial summaries

## Phase 3: Budgeting & Goals
- [ ] **Smart Budgets** - Per-category budgets with progress bars
- [ ] **Budget Alerts** - "You've used 80% of your Food budget"
- [ ] **Savings Goals** - Visual goal tracking (e.g., "Holiday Fund: £500/£1000")
- [ ] **Spending Limits** - Daily/weekly limits with notifications

## Phase 4: Advanced Features
- [ ] **Search & Filters** - Full-text search, date ranges, amounts, merchants
- [ ] **Export Data** - CSV, PDF statements
- [ ] **Recurring Payments** - Detect and track subscriptions
- [ ] **Split Expenses** - Tag transactions as split/shared
- [ ] **Notes & Attachments** - Add notes, receipts to transactions

## Phase 5: GnosisPay Specific
- [ ] **Card Management** - View linked GnosisPay card, freeze/unfreeze
- [ ] **Cashback Tracking** - GnosisPay rewards integration
- [ ] **IBAN/Top-up Info** - Show account details for transfers
- [ ] **Real-time Sync** - WebSocket/polling for instant updates
- [ ] **Multi-address Support** - Track multiple GnosisPay wallets

## Design System (Revolut-inspired)
- Clean, card-based UI
- Gradient accents per token (GBPe = purple, EURe = blue, USDC = green)
- Bottom navigation: Home | Analytics | Budget | Cards | Settings
- Smooth animations, haptic feedback cues
- Dark mode support

## Current Status
- ✅ Base currency detection
- ✅ Basic transaction import
- ✅ Simple analytics
- 🔄 Building: Full dashboard (Phase 1)
