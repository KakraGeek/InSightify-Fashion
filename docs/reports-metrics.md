# Reports Metrics Documentation

## Overview
The Reports page now includes comprehensive metrics beyond basic order and purchase summaries. These new metrics provide actionable insights for inventory management and order tracking.

## Summary Cards

### Financial Summary (Original)
- **Total Orders**: Count and value of orders in the selected date range
- **Total Purchases**: Count and value of purchases in the selected date range  
- **Net Revenue**: Orders minus purchases (profit/loss)
- **Date Range**: The selected reporting period

### Inventory Summary (New)
- **Total Inventory Value**: Current value of all items in stock
- **Low Stock Items**: Count and value of items below reorder level
- **Overdue Orders**: Count of orders past due date
- **Extended Orders**: Count of orders with extended delivery dates

## Detailed Metrics Sections

### Low Stock Items
**Purpose**: Identify items that need immediate reordering

**What it shows**:
- Items where current quantity ≤ reorder level
- Current stock levels vs. reorder thresholds
- Unit prices and total value of low stock items

**Action required**: Reorder these items to maintain stock levels

### Overdue Orders
**Purpose**: Track orders that are past their due date

**What it shows**:
- Orders not completed by their original due date
- Number of days overdue
- Customer information and order amounts
- Current order status

**Action required**: Prioritize these orders for completion

### Extended Orders
**Purpose**: Monitor orders that have been granted deadline extensions

**What it shows**:
- Original due date vs. extended delivery date
- Customer information and order amounts
- Current order status

**Action required**: Ensure these orders meet their extended deadlines

### Top Selling Items
**Purpose**: Identify most popular products/services

**What it shows**:
- Items ranked by order count
- Total number of orders per item

**Action required**: Consider increasing stock of popular items

## Business Intelligence

### Inventory Management
- **Stock Level Monitoring**: Track items approaching reorder levels
- **Value Optimization**: Monitor total inventory investment
- **Reorder Planning**: Prioritize items by urgency and value

### Order Management
- **Deadline Tracking**: Identify orders requiring immediate attention
- **Customer Communication**: Proactively manage extended delivery expectations
- **Resource Allocation**: Focus efforts on overdue orders

### Financial Planning
- **Revenue Tracking**: Monitor order vs. purchase trends
- **Inventory Investment**: Track capital tied up in stock
- **Profitability Analysis**: Analyze net revenue patterns

## Usage Tips

1. **Daily Monitoring**: Check low stock and overdue orders daily
2. **Weekly Review**: Analyze inventory value trends weekly
3. **Monthly Planning**: Use extended orders data for capacity planning
4. **Customer Service**: Use overdue order data for proactive customer communication

## Data Refresh
- Metrics update automatically when date range changes
- Click "Refresh" button to update data manually
- All metrics are real-time based on current database state

## Technical Notes
- Low stock calculation: `qty <= reorderLevel`
- Overdue calculation: `dueDate < today && state not in ["CLOSED", "PICKED_UP"]`
- Extended orders: Orders with `extendedEta` field populated
- All calculations respect workspace isolation
