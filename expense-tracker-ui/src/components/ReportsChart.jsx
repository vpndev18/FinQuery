import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { getExpenses, getCategories } from '../services/api';

const ReportsChart = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]); // To map categoryId to names if needed, though expense usually has it
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30days');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });

    // Load data
    useEffect(() => {
        fetchData();
    }, [dateRange, customDates.start, customDates.end]);

    const fetchData = async () => {
        // Determine dates
        let start = null;
        let end = new Date();

        if (dateRange === '7days') {
            start = new Date();
            start.setDate(end.getDate() - 7);
        } else if (dateRange === '30days') {
            start = new Date();
            start.setDate(end.getDate() - 30);
        } else if (dateRange === '3months') {
            start = new Date();
            start.setDate(end.getDate() - 90);
        } else if (dateRange === 'custom') {
            if (customDates.start) start = new Date(customDates.start);
            if (customDates.end) end = new Date(customDates.end);
        }

        if (!start && dateRange !== 'custom') return; // Should not happen with defaults
        if (dateRange === 'custom' && (!start || !end)) return; // Wait for both custom dates

        setLoading(true);
        // Fetch expenses directly since the prompt allows us to "Call apiService.getExpenseSummary" 
        // BUT the previous task result for api.js implementation of `getExpenseSummary` fetches "expenses/summary".
        // However, `getExpenseSummary` might just return totals. 
        // To generate Charts for "Daily" and "Category" breakdown, we often need the raw expenses 
        // OR an API that returns aggregated data. 
        // The PROMPT says: "Call apiService.getExpenseSummary(startDate, endDate) ... Transform data ... Category data... Daily data".
        // If our `getExpenseSummary` implementation (step 0) only returns `{ total, average }` etc, we might need `getExpenses` for the charts.
        // Let's check what `getExpenseSummary` was implemented as. 
        // Looking back at step 0 output for api.js:
        // `export const getExpenseSummary = ... api.get('/expenses/summary', ...)`
        // In many backend implementations, `summary` gives aggregate stats. 
        // If the backend is standard, we might need `getExpenses` to do client-side aggregation for the charts, 
        // or assume `getExpenseSummary` returns a complex object with `byCategory` and `byDate`.
        // Given the prompt "Transform data... Category data... Daily data", it implies we might receive raw or semi-processed data.
        // For robustness, I will fetch `getExpenses` and calculate the aggregations on the client side, 
        // as this guarantees the charts work regardless of specific backend aggregation shape (unless the backend specifically returns the chart data structure).
        // Using `getExpenses` allows me to fully control the "Category data" and "Daily data" formation.

        const formattedStart = start.toISOString().split('T')[0];
        const formattedEnd = end.toISOString().split('T')[0];

        try {
            // Parallel fetch if needed, but expenses usually contains category info
            const [expenseRes, catRes] = await Promise.all([
                getExpenses(formattedStart, formattedEnd),
                getCategories()
            ]);

            if (expenseRes.success) {
                setExpenses(expenseRes.data);
            }
            if (catRes.success) {
                setCategories(catRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Processing Data for Charts ---

    const { categoryData, dailyData, stats } = useMemo(() => {
        if (!expenses.length) return { categoryData: [], dailyData: [], stats: { total: 0, avg: 0, max: 0, count: 0 } };

        // 1. Stats
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const count = expenses.length; // Or unique days? Prompt says "Days spent on (count of days with expenses)"
        const uniqueDays = new Set(expenses.map(e => e.date.split('T')[0])).size;
        const avg = count ? total / count : 0; // "Average transaction" usually means per transaction, prompt ambiguous ("Average transaction" vs "Average daily"). "Average transaction" implies per item.
        const max = Math.max(...expenses.map(e => e.amount), 0);

        // 2. Category Aggregation
        const catMap = {};
        expenses.forEach(exp => {
            const catName = exp.category?.name || 'Uncategorized';
            catMap[catName] = (catMap[catName] || 0) + exp.amount;
        });

        const categoryDataArray = Object.keys(catMap).map(key => ({
            category: key,
            amount: catMap[key]
        })).sort((a, b) => b.amount - a.amount).slice(0, 10); // Top 10

        // 3. Daily Aggregation
        const dayMap = {};
        expenses.forEach(exp => {
            const dateKey = exp.date.split('T')[0];
            // Format to "15 Jan" matching requirements
            const dateObj = new Date(exp.date);
            const displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

            // We need to aggregate by the DATE KEY first to avoid duplicates for same day
            dayMap[dateKey] = (dayMap[dateKey] || 0) + exp.amount;
        });

        // Convert map to sorted array
        const sortedDates = Object.keys(dayMap).sort();
        const dailyDataArray = sortedDates.map(dateKey => {
            const dateObj = new Date(dateKey);
            return {
                date: dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                amount: dayMap[dateKey],
                fullDate: dateKey // for sorting if needed
            };
        });

        return {
            categoryData: categoryDataArray,
            dailyData: dailyDataArray,
            stats: { total, avg, max, count: uniqueDays }
        };
    }, [expenses]);


    // Helper for currency formatting
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

    // Styles
    const containerStyle = {
        padding: '1.5rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
    };

    const selectStyle = {
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
    };

    const statsContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
    };

    const statCardStyle = {
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center',
    };

    const statValueStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#007bff',
        margin: '0.5rem 0',
    };

    const chartSectionStyle = {
        marginBottom: '2rem',
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={{ margin: 0 }}>Financial Reports</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {dateRange === 'custom' && (
                        <>
                            <input
                                type="date"
                                value={customDates.start}
                                onChange={(e) => setCustomDates(d => ({ ...d, start: e.target.value }))}
                                style={selectStyle}
                            />
                            <span>-</span>
                            <input
                                type="date"
                                value={customDates.end}
                                onChange={(e) => setCustomDates(d => ({ ...d, end: e.target.value }))}
                                style={selectStyle}
                            />
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading report data...</div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div style={statsContainerStyle}>
                        <div style={statCardStyle}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Spending</div>
                            <div style={statValueStyle}>{formatCurrency(stats.total)}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Average / Txn</div>
                            <div style={{ ...statValueStyle, color: '#28a745' }}>{formatCurrency(stats.avg)}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Highest Txn</div>
                            <div style={{ ...statValueStyle, color: '#dc3545' }}>{formatCurrency(stats.max)}</div>
                        </div>
                        <div style={statCardStyle}>
                            <div style={{ color: '#666', fontSize: '0.9rem' }}>Days Active</div>
                            <div style={{ ...statValueStyle, color: '#ffc107' }}>
                                {stats.count} <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>days</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div style={chartSectionStyle}>
                        <h3 style={{ marginBottom: '1rem', color: '#444' }}>Spending by Category</h3>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="category"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        height={70}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="amount" name="Amount (₹)" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                        <LabelList dataKey="amount" position="top" formatter={(val) => `₹${val}`} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={chartSectionStyle}>
                        <h3 style={{ marginBottom: '1rem', color: '#444' }}>Spending Trend (Last {dailyData.length} Days)</h3>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        name="Daily Spend (₹)"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportsChart;
