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
        const historyResponse = await fetch(API_BASE + '/analyses/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!historyResponse.ok) {
            throw new Error('Failed to fetch history');
        }

        const historyData = await historyResponse.json();
        // Normalize field names (API returns camelCase)
        if (historyData.analyses) {
            historyData.analyses = historyData.analyses.map(function(a) {
                return Object.assign({}, a, { created_at: a.createdAt || a.created_at });
            });
        }

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
            icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
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
                icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
                title: 'Mettez à jour votre CV',
                description: `Vous n'avez pas analysé votre CV depuis ${daysSinceLastAnalysis} jours`,
                type: 'warning',
                link: 'app.html'
            });
        } else if (daysSinceLastAnalysis === 0) {
            recommendations.push({
                icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
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
                    icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l6.5-2.2c.6 1.3 2 2.2 3.5 2.2 2.2 0 4-1.8 4-4 0-1.5-.9-2.9-2.2-3.5L16 8l6-2-2 6-6.5 2.2"/><path d="M22 2L2 9l7 3 3 7z"/></svg>',
                    title: 'Excellente progression !',
                    description: `Votre score a augmenté de ${improvement} points`,
                    type: 'success'
                });
            } else if (improvement < -5) {
                recommendations.push({
                    icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
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
                    icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
                    title: 'Améliorez votre CV',
                    description: 'Votre score moyen est de ' + overview.avgScore + '/100. Optimisez votre CV avec nos suggestions.',
                    type: 'action',
                    link: 'app.html'
                });
            } else if (overview.avgScore >= 80) {
                recommendations.push({
                    icon: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>',
                    title: 'Excellent CV !',
                    description: 'Votre CV a un excellent score. Continuez à postuler !',
                    type: 'success'
                });
            }
        }

        // Check favorites
        if (favorites.length > 5) {
            recommendations.push({
                icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
                title: 'Passez à l\'action',
                description: `Vous avez ${favorites.length} offres en favoris. Commencez à postuler !`,
                type: 'action',
                link: 'favorites.html'
            });
        } else if (favorites.length === 0) {
            recommendations.push({
                icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
                title: 'Trouvez des offres',
                description: 'Explorez les offres d\'emploi et ajoutez-les à vos favoris',
                type: 'action',
                link: 'job-search.html'
            });
        }
    }

    // Premium features
    const user = (typeof getUser === 'function') ? getUser() : JSON.parse(localStorage.getItem('swisscv_user') || 'null');
    if (user && (user.tier === 'free' || !user.tier)) {
        recommendations.push({
            icon: '<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>',
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
