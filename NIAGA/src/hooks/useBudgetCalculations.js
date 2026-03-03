import React, { useMemo } from 'react';

const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    if (isNaN(date1) || isNaN(date2)) return false;
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

/**
 * Derives all budget-related values from userInfo. Single source of truth: pass userInfo only.
 */
export function useBudgetCalculations(userInfo) {
    const dailySpending = userInfo?.dailySpending ?? [];

    return useMemo(() => {
        const now = new Date();
        const todaySpending = dailySpending.filter((item) => isSameDay(item.date, now));
        const spentToday = todaySpending.reduce((sum, item) => sum + item.amount, 0);
        const dailyBudget = userInfo?.dailyBudget ?? 0;
        const remainingBudget = Math.max(dailyBudget - spentToday, 0);
        const spentPercentage = dailyBudget ? Math.min((spentToday / dailyBudget) * 100, 100) : 0;
        const remainingPercentage = 100 - spentPercentage;

        const startDate = userInfo?.budgetStartDate ? new Date(userInfo.budgetStartDate) : null;
        const endDate = userInfo?.budgetEndDate ? new Date(userInfo.budgetEndDate) : null;
        const remainingDays =
            startDate && endDate
                ? Math.max(Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)), 0)
                : 0;
        const daysPassed = startDate
            ? Math.max(Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)), 1)
            : 1;

        const formatDate = (date) =>
            date ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '--';

        const totalSpentTillNow = dailySpending.reduce((sum, item) => sum + item.amount, 0);
        const totalBudget = userInfo?.totalBudget ?? 0;
        const avgDailySpend = daysPassed ? Math.round(totalSpentTillNow / daysPassed) : 0;
        const expectedSpendTillNow =
            dailyBudget && startDate && endDate
                ? Math.round((dailyBudget / (remainingDays + daysPassed)) * daysPassed)
                : 0;
        const isOverspending = totalSpentTillNow > expectedSpendTillNow;

        // Spending by label (top 8, sorted by amount desc)
        const spendingByLabel = dailySpending.reduce((acc, item) => {
            const label = item.label?.trim() || 'Other';
            acc[label] = (acc[label] || 0) + item.amount;
            return acc;
        }, {});
        const topLabelsBySpend = Object.entries(spendingByLabel)
            .map(([label, amount]) => ({ label, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 8);
        const remainingTotalBudget = Math.max(totalBudget - totalSpentTillNow, 0);
        const totalSpentPercentage = totalBudget
            ? Math.min((totalSpentTillNow / totalBudget) * 100, 100)
            : 0;
        const totalRemainingPercentage = 100 - totalSpentPercentage;

        return {
            dailySpending,
            todaySpending,
            spentToday,
            dailyBudget,
            remainingBudget,
            spentPercentage,
            remainingPercentage,
            startDate,
            endDate,
            remainingDays,
            daysPassed,
            formatDate,
            avgDailySpend,
            expectedSpendTillNow,
            isOverspending,
            totalSpentTillNow,
            totalBudget,
            remainingTotalBudget,
            totalSpentPercentage,
            totalRemainingPercentage,
            topLabelsBySpend,
        };
    }, [userInfo]);
}
