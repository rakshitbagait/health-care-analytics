-- 1) Top selling medicines (by quantity)
SELECT medicine_name, SUM(quantity) AS total_qty
FROM fact_sales
GROUP BY medicine_name
ORDER BY total_qty DESC;

-- 2) Revenue by medicine
SELECT medicine_name, SUM(revenue) AS total_revenue
FROM fact_sales
GROUP BY medicine_name
ORDER BY total_revenue DESC;

-- 3) Monthly revenue trend
SELECT DATE_TRUNC('month', date) AS month, SUM(revenue) AS revenue
FROM fact_sales
GROUP BY month
ORDER BY month;

-- 4) Low stock medicines
SELECT medicine_name, stock
FROM dim_inventory
WHERE low_stock_flag = true
ORDER BY stock ASC;

-- 5) Expiry risk medicines (within ~60 days as your code flagged)
SELECT medicine_name, expiry_date
FROM dim_inventory
WHERE expiry_risk_flag = true
ORDER BY expiry_date ASC;