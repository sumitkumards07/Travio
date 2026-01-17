// Amadeus API Quota Manager
// Tracks and limits API usage to stay under 2,000/month free tier limit

const QUOTA_KEY = 'travio_amadeus_quota';
const MONTHLY_LIMIT = 2000;
const WARNING_THRESHOLD = 1800; // 90% of limit

/**
 * Get current quota status
 * @returns {object} - Quota information
 */
export const getQuotaStatus = () => {
    try {
        const stored = localStorage.getItem(QUOTA_KEY);
        const quota = stored ? JSON.parse(stored) : createNewQuotaRecord();

        // Check if we need to reset (new month)
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        if (quota.month !== currentMonth) {
            console.log(`🔄 [QUOTA RESET] New month detected, resetting counter`);
            const newQuota = createNewQuotaRecord();
            localStorage.setItem(QUOTA_KEY, JSON.stringify(newQuota));
            return newQuota;
        }

        return {
            ...quota,
            remaining: MONTHLY_LIMIT - quota.used,
            percentUsed: ((quota.used / MONTHLY_LIMIT) * 100).toFixed(1),
            isWarning: quota.used >= WARNING_THRESHOLD,
            isLimitReached: quota.used >= MONTHLY_LIMIT,
            dailyAverage: calculateDailyAverage(quota),
            projectedMonthly: calculateProjection(quota)
        };
    } catch (error) {
        console.error('Quota read error:', error);
        return createNewQuotaRecord();
    }
};

/**
 * Create a new quota record for current month
 */
const createNewQuotaRecord = () => {
    const now = new Date();
    return {
        month: now.toISOString().slice(0, 7),
        used: 0,
        limit: MONTHLY_LIMIT,
        remaining: MONTHLY_LIMIT,
        percentUsed: '0.0',
        isWarning: false,
        isLimitReached: false,
        firstRequest: null,
        lastRequest: null,
        dailyBreakdown: {}
    };
};

/**
 * Check if we can make an API request
 * @returns {object} - { allowed: boolean, reason: string, quota: object }
 */
export const canMakeRequest = () => {
    const quota = getQuotaStatus();

    if (quota.isLimitReached) {
        console.warn(`🚫 [QUOTA LIMIT] Monthly limit of ${MONTHLY_LIMIT} reached!`);
        return {
            allowed: false,
            reason: `Monthly limit of ${MONTHLY_LIMIT} API calls reached. Resets on ${getResetDate()}.`,
            quota
        };
    }

    if (quota.isWarning) {
        console.warn(`⚠️ [QUOTA WARNING] ${quota.remaining} requests remaining this month`);
    }

    return {
        allowed: true,
        reason: null,
        quota
    };
};

/**
 * Record an API request
 * @returns {object} - Updated quota status
 */
export const recordRequest = () => {
    try {
        const quota = getQuotaStatus();
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // Increment counter
        quota.used += 1;
        quota.lastRequest = now;
        if (!quota.firstRequest) {
            quota.firstRequest = now;
        }

        // Track daily breakdown
        if (!quota.dailyBreakdown) quota.dailyBreakdown = {};
        quota.dailyBreakdown[today] = (quota.dailyBreakdown[today] || 0) + 1;

        // Update derived values
        quota.remaining = MONTHLY_LIMIT - quota.used;
        quota.percentUsed = ((quota.used / MONTHLY_LIMIT) * 100).toFixed(1);
        quota.isWarning = quota.used >= WARNING_THRESHOLD;
        quota.isLimitReached = quota.used >= MONTHLY_LIMIT;

        localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));

        console.log(`📊 [QUOTA] Used: ${quota.used}/${MONTHLY_LIMIT} (${quota.percentUsed}%)`);

        return quota;
    } catch (error) {
        console.error('Quota record error:', error);
        return getQuotaStatus();
    }
};

/**
 * Calculate daily average usage
 */
const calculateDailyAverage = (quota) => {
    if (!quota.dailyBreakdown) return 0;
    const days = Object.keys(quota.dailyBreakdown).length;
    if (days === 0) return 0;
    return Math.round(quota.used / days);
};

/**
 * Calculate projected monthly usage
 */
const calculateProjection = (quota) => {
    const dailyAvg = calculateDailyAverage(quota);
    if (dailyAvg === 0) return 0;

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    return Math.round(dailyAvg * daysInMonth);
};

/**
 * Get the date when quota resets
 */
const getResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Get usage history for display
 */
export const getUsageHistory = () => {
    try {
        const quota = getQuotaStatus();
        const history = [];

        if (quota.dailyBreakdown) {
            Object.entries(quota.dailyBreakdown)
                .sort((a, b) => b[0].localeCompare(a[0])) // Most recent first
                .forEach(([date, count]) => {
                    history.push({
                        date,
                        requests: count,
                        formattedDate: new Date(date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short'
                        })
                    });
                });
        }

        return history;
    } catch (error) {
        return [];
    }
};

/**
 * Reset quota (for testing purposes only)
 */
export const resetQuota = () => {
    try {
        localStorage.removeItem(QUOTA_KEY);
        console.log('🔄 [QUOTA] Reset complete');
        return createNewQuotaRecord();
    } catch (error) {
        return createNewQuotaRecord();
    }
};

/**
 * Get recommended daily limit based on remaining quota
 */
export const getDailyRecommendation = () => {
    const quota = getQuotaStatus();
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - now.getDate() + 1;

    const recommendedDaily = Math.floor(quota.remaining / daysRemaining);
    const todayUsed = quota.dailyBreakdown?.[now.toISOString().split('T')[0]] || 0;

    return {
        recommended: recommendedDaily,
        todayUsed,
        todayRemaining: Math.max(0, recommendedDaily - todayUsed),
        daysRemaining
    };
};

export default {
    getQuotaStatus,
    canMakeRequest,
    recordRequest,
    getUsageHistory,
    resetQuota,
    getDailyRecommendation,
    MONTHLY_LIMIT,
    WARNING_THRESHOLD
};
