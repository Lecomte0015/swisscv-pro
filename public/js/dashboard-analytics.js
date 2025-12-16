// Dashboard Analytics Script
// Load Analytics Data from API
async function loadAnalytics() {
    try {
        const token = localStorage.getItem('swisscv_token');
        if (!token) {
            console.log('No token, skipping analytics');
            return;
        }

        const API_BASE = 'https://swisscv-pro.dallyhermann-71e.workers.dev';

        // Get overview data
        const overviewResponse = await fetch(API_BASE + '/api/analytics/overview', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!overviewResponse.ok) {
            throw new Error('Failed to fetch overview');
        }

        const overviewData = await overviewResponse.json();

        // Get history data
        const historyResponse = await fetch(API_BASE + '/api/analytics/history?limit=30', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!historyResponse.ok) {
            throw new Error('Failed to fetch history');
        }

        const historyData = await historyResponse.json();

        // Update KPI Cards with null checks
        const overview = overviewData.overview;

        // Update overview cards with null checks
        const totalAnalysesEl = document.getElementById('totalAnalyses');
        if (totalAnalysesEl) totalAnalysesEl.textContent = overview.totalAnalyses || 0;

        const avgScoreEl = document.getElementById('avgScore');
        if (avgScoreEl) avgScoreEl.textContent = overview.avgScore || '-';

        const improvementEl = document.getElementById('improvement');
        if (improvementEl) {
            if (overview.improvement !== null && overview.improvement !== undefined) {
                improvementEl.textContent = (overview.improvement > 0 ? '+' : '') + overview.improvement + '%';
            } else {
                improvementEl.textContent = '-';
            }
        }

        // Get tracked jobs count from overview
        const totalFavoritesEl = document.getElementById('totalFavorites');
        if (totalFavoritesEl) totalFavoritesEl.textContent = overview.totalTracked || 0;

        // Get favorites for recommendations (fallback to localStorage for now)
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        // Create Charts with API data
        createScoreProgressChart(historyData.analyses || []);
        createActivityChart(historyData.analyses || []);

        // Generate Recommendations
        generateRecommendations(historyData.analyses || [], favorites, overviewData.overview);

    } catch (error) {
        console.error('Error loading analytics:', error);
        // Fallback to showing zeros with null checks
        const overview = {
            totalAnalyses: 0,
            avgScore: 0,
            improvement: 0,
            totalTracked: 0,
            totalApplications: 0,
            totalFavorites: 0,
            totalSavedSearches: 0
        };

        // Update overview cards with null checks
        const totalAnalysesEl = document.getElementById('totalAnalyses');
        if (totalAnalysesEl) totalAnalysesEl.textContent = overview.totalAnalyses || 0;

        const avgScoreEl = document.getElementById('avgScore');
        if (avgScoreEl) avgScoreEl.textContent = overview.avgScore || 0;

        const improvementEl = document.getElementById('improvement');
        if (improvementEl) improvementEl.textContent = (overview.improvement || 0) + '%';

        const totalTrackedEl = document.getElementById('totalTracked');
        if (totalTrackedEl) totalTrackedEl.textContent = overview.totalTracked || 0;

        // Update detailed stats with null checks
        const totalApplicationsEl = document.getElementById('totalApplications');
        if (totalApplicationsEl) totalApplicationsEl.textContent = overview.totalApplications || 0;

        const totalFavoritesEl = document.getElementById('totalFavorites');
        if (totalFavoritesEl) totalFavoritesEl.textContent = overview.totalFavorites || 0;

        const totalSavedSearchesEl = document.getElementById('totalSavedSearches');
        if (totalSavedSearchesEl) totalSavedSearchesEl.textContent = overview.totalSavedSearches || 0;
    }
}

// Score Progress Chart
function createScoreProgressChart(analyses) {
    const ctx = document.getElementById('scoreProgressChart');
    if (!ctx) return;

    // Sort by date (oldest first)
    const sortedAnalyses = [...analyses].sort((a, b) => a.created_at - b.created_at);

    const labels = sortedAnalyses.map(a => {
        const date = new Date(a.created_at * 1000);
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    });

    const scores = sortedAnalyses.map(a => parseInt(a.score) || 0);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ['Aucune donnée'],
            datasets: [{
                label: 'Score CV',
                data: scores.length > 0 ? scores : [0],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: value => value + '/100' }
                }
            }
        }
    });
}

// Activity Chart
function createActivityChart(analyses) {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;

    // Group by last 7 days
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
    }

    const activityData = last7Days.map((day, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - index));
        const count = analyses.filter(a => {
            const aDate = new Date(a.created_at * 1000);
            return aDate.toDateString() === date.toDateString();
        }).length;
        return count;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Analyses',
                data: activityData,
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// Generate Recommendations
function generateRecommendations(analyses, favorites, overview) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    const recommendations = [];

    // No analyses yet
    if (analyses.length === 0) {
        recommendations.push({
            icon: '🚀',
            title: 'Commencez votre analyse',
            description: 'Analysez votre premier CV pour obtenir des recommandations personnalisées',
            type: 'action',
            link: 'app.html'
        });
    } else {
        // Check last analysis date
        const lastAnalysis = new Date(analyses[0].created_at * 1000); // Most recent (DESC order)
        const daysSinceLastAnalysis = Math.floor((new Date() - lastAnalysis) / (1000 * 60 * 60 * 24));

        if (daysSinceLastAnalysis > 14) {
            recommendations.push({
                icon: '🔄',
                title: 'Mettez à jour votre CV',
                description: `Vous n'avez pas analysé votre CV depuis ${daysSinceLastAnalysis} jours`,
                type: 'warning',
                link: 'app.html'
            });
        } else if (daysSinceLastAnalysis === 0) {
            recommendations.push({
                icon: '✅',
                title: 'CV analysé aujourd\'hui',
                description: 'Votre CV est à jour ! Continuez à postuler aux offres.',
                type: 'success'
            });
        }

        // Check score improvement
        if (analyses.length >= 2) {
            const firstScore = analyses[analyses.length - 1].score; // Oldest
            const lastScore = analyses[0].score; // Most recent
            const improvement = lastScore - firstScore;
            if (improvement > 10) {
                recommendations.push({
                    icon: '🎉',
                    title: 'Excellente progression !',
                    description: `Votre score a augmenté de ${improvement} points`,
                    type: 'success'
                });
            } else if (improvement < -5) {
                recommendations.push({
                    icon: '⚠️',
                    title: 'Score en baisse',
                    description: 'Votre dernier CV a un score plus faible. Revoyez vos modifications.',
                    type: 'warning'
                });
            }
        }

        // Check score level
        if (overview && overview.avgScore) {
            if (overview.avgScore < 60) {
                recommendations.push({
                    icon: '📝',
                    title: 'Améliorez votre CV',
                    description: 'Votre score moyen est de ' + overview.avgScore + '/100. Optimisez votre CV avec nos suggestions.',
                    type: 'action',
                    link: 'app.html'
                });
            } else if (overview.avgScore >= 80) {
                recommendations.push({
                    icon: '⭐',
                    title: 'Excellent CV !',
                    description: 'Votre CV a un excellent score. Continuez à postuler !',
                    type: 'success'
                });
            }
        }

        // Check favorites
        if (favorites.length > 5) {
            recommendations.push({
                icon: '📝',
                title: 'Passez à l\'action',
                description: `Vous avez ${favorites.length} offres en favoris. Commencez à postuler !`,
                type: 'action',
                link: 'favorites.html'
            });
        } else if (favorites.length === 0) {
            recommendations.push({
                icon: '🔍',
                title: 'Trouvez des offres',
                description: 'Explorez les offres d\'emploi et ajoutez-les à vos favoris',
                type: 'action',
                link: 'job-search.html'
            });
        }
    }

    // Premium features
    const user = getUser();
    if (user && (user.tier === 'free' || !user.tier)) {
        recommendations.push({
            icon: '⭐',
            title: 'Passez à Premium',
            description: 'Débloquez l\'optimisation CV, templates professionnels et plus',
            type: 'upgrade',
            link: 'pricing.html'
        });
    }

    // Render recommendations
    if (recommendations.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Aucune recommandation pour le moment</div>';
    } else {
        container.innerHTML = recommendations.map(rec => `
            <div style="display: flex; gap: 16px; padding: 16px; background: ${getRecommendationColor(rec.type)}; border-radius: 8px; border-left: 4px solid ${getRecommendationBorder(rec.type)};">
                <div style="font-size: 24px;">${rec.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${rec.title}</div>
                    <div style="font-size: 14px; color: #666;">${rec.description}</div>
                    ${rec.link ? `<a href="${rec.link}" style="display: inline-block; margin-top: 8px; color: #667eea; font-weight: 600; text-decoration: none;">En savoir plus →</a>` : ''}
                </div>
            </div>
        `).join('');
    }
}

function getRecommendationColor(type) {
    switch (type) {
        case 'success': return '#E8F5E9';
        case 'warning': return '#FFF3E0';
        case 'action': return '#E3F2FD';
        case 'upgrade': return '#F3E5F5';
        default: return '#F5F5F5';
    }
}

function getRecommendationBorder(type) {
    switch (type) {
        case 'success': return '#4CAF50';
        case 'warning': return '#FF9800';
        case 'action': return '#2196F3';
        case 'upgrade': return '#9C27B0';
        default: return '#9E9E9E';
    }
}

// Load analytics on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
});
