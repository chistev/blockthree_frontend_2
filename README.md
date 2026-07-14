# Block Three - Treasury Risk & Capital Structure Intelligence Platform

A comprehensive React-based financial modeling platform for public company Bitcoin treasuries, featuring Monte Carlo simulations, multi-objective optimization, and interactive visualization tools.

## Overview

Block Three is an institutional-grade modeling platform designed specifically for Bitcoin treasury management. It simulates thousands of BTC price paths, stress-tests financing structures, and optimizes capital allocation strategies using NSGA-III multi-objective optimization.

## Key Features

### Multi-Objective Optimization
- **NSGA-III Algorithm**: Evolutionary multi-objective optimization
- **5 Optimization Objectives**:
  - Maximize BTC retained
  - Minimize shareholder dilution
  - Minimize LTV breach probability
  - Maximize cash runway
  - Minimize WACC
- **Pareto Frontier**: Returns 5 optimized candidates

### Monte Carlo Simulation
- **10,000+ Paths**: Per simulation run
- **Heston Stochastic Volatility**: Mean-reverting volatility process
- **Jump Diffusion**: Merton-style price jumps
- **Variance Reduction**: Antithetic variates for convergence

### Capital Structures Modeled
- **ATM** (At-The-Market): Equity offerings
- **PIPE** (Private Investment in Public Equity)
- **Convertible Debt**: Convertible notes with terms
- **Traditional Loan**: Secured lending with LTV caps
- **Hybrid**: Combination of debt and equity
- **Custom**: User-defined structures

### Visualization Suite
- **Fan Charts**: NAV distribution visualization
- **Histograms**: LTV breach probability distribution
- **Runway Box Plots**: Cash runway distribution
- **Tornado Charts**: Sensitivity analysis
- **Comparison View**: Side-by-side structure comparison

## Technical Architecture

### Core Components

**Assumption Grid** (`AssumptionGrid.tsx`)
- Editable input fields for all model parameters
- Tooltips for each assumption
- Smart formatting for rate/percentage fields
- Support for nested objects (e.g., `objective_switches.max_btc`)
- Real-time value updates with blur validation

**Deal Management** (`DealDetail.tsx`, `DealsPage.tsx`)
- Create, edit, and manage multiple deals
- Status tracking: draft → as-is run → optimized run → compared
- Snapshot-based calculation locking
- CSV export functionality
- Auto-refresh of live BTC price

**View Modes** (`AsIsView.tsx`, `OptimizedView.tsx`, `ComparisonView.tsx`)
- **As-Is**: Current structure analysis
- **Optimized**: 5 Pareto-optimal candidates
- **Comparison**: Side-by-side metrics comparison

**Charts**:
- `FanChart`: Area chart showing terminal NAV distribution (10th, 25th, 50th, 75th, 90th percentiles)
- `HistogramWithThreshold`: LTV distribution with breach threshold coloring
- `RunwayBox`: Runway distribution with mean, median, and 95th percentile

