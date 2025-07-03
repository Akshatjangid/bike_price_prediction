// Chart.js Data Visualization
class DataVisualization {
    constructor() {
        this.charts = {};
        this.data = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeCharts();
    }

    async loadData() {
        try {
            const response = await fetch('/history_data');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = [];
        }
    }

    initializeCharts() {
        this.createDistributionChart();
        this.createTimelineChart();
        this.setupChartControls();
    }

    createDistributionChart() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        // Default to price distribution
        const priceData = this.getPriceDistribution();

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: priceData.labels,
                datasets: [{
                    data: priceData.values,
                    backgroundColor: [
                        'rgba(0, 255, 255, 0.8)',
                        'rgba(255, 0, 128, 0.8)',
                        'rgba(255, 255, 0, 0.8)',
                        'rgba(255, 69, 0, 0.8)',
                        'rgba(0, 255, 136, 0.8)'
                    ],
                    borderColor: [
                        '#00ffff',
                        '#ff0080',
                        '#ffff00',
                        '#ff4500',
                        '#00ff88'
                    ],
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Rajdhani',
                                size: 12
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 25, 40, 0.9)',
                        titleColor: '#00ffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00ffff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Orbitron',
                            size: 14
                        },
                        bodyFont: {
                            family: 'Rajdhani',
                            size: 12
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 2,
                        hoverBorderWidth: 4
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    createTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;

        const timelineData = this.getTimelineData();

        this.charts.timeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timelineData.labels,
                datasets: [{
                    label: 'Predicted Price',
                    data: timelineData.values,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ff4500',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#ffff00',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 25, 40, 0.9)',
                        titleColor: '#00ffff',
                        bodyColor: '#ffffff',
                        borderColor: '#00ffff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Orbitron',
                            size: 14
                        },
                        bodyFont: {
                            family: 'Rajdhani',
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                return `Price: ₹${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 255, 255, 0.1)',
                            borderColor: 'rgba(0, 255, 255, 0.3)'
                        },
                        ticks: {
                            color: '#b0b0b0',
                            font: {
                                family: 'Rajdhani',
                                size: 11
                            }
                        },
                        title: {
                            display: true,
                            text: 'Recent Predictions',
                            color: '#00ffff',
                            font: {
                                family: 'Orbitron',
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 255, 255, 0.1)',
                            borderColor: 'rgba(0, 255, 255, 0.3)'
                        },
                        ticks: {
                            color: '#b0b0b0',
                            font: {
                                family: 'Rajdhani',
                                size: 11
                            },
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        },
                        title: {
                            display: true,
                            text: 'Price (₹)',
                            color: '#00ffff',
                            font: {
                                family: 'Orbitron',
                                size: 12
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart',
                    onProgress: function(animation) {
                        // Add glow effect during animation
                        const chart = animation.chart;
                        const ctx = chart.ctx;
                        ctx.save();
                        ctx.shadowColor = '#00ffff';
                        ctx.shadowBlur = 10;
                        ctx.restore();
                    }
                }
            }
        });
    }

    getPriceDistribution() {
        if (this.data.length === 0) {
            return { labels: ['No Data'], values: [1] };
        }

        const ranges = [
            { label: '< ₹50K', min: 0, max: 50000 },
            { label: '₹50K - ₹1L', min: 50000, max: 100000 },
            { label: '₹1L - ₹2L', min: 100000, max: 200000 },
            { label: '₹2L - ₹5L', min: 200000, max: 500000 },
            { label: '> ₹5L', min: 500000, max: Infinity }
        ];

        const distribution = ranges.map(range => ({
            label: range.label,
            count: this.data.filter(item => 
                item.predicted_price >= range.min && item.predicted_price < range.max
            ).length
        }));

        return {
            labels: distribution.map(d => d.label),
            values: distribution.map(d => d.count)
        };
    }

    getBrandDistribution() {
        if (this.data.length === 0) {
            return { labels: ['No Data'], values: [1] };
        }

        const brandCounts = {};
        this.data.forEach(item => {
            brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
        });

        const sortedBrands = Object.entries(brandCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8); // Top 8 brands

        return {
            labels: sortedBrands.map(([brand]) => brand),
            values: sortedBrands.map(([, count]) => count)
        };
    }

    getOwnerDistribution() {
        if (this.data.length === 0) {
            return { labels: ['No Data'], values: [1] };
        }

        const ownerCounts = {};
        this.data.forEach(item => {
            ownerCounts[item.owner] = (ownerCounts[item.owner] || 0) + 1;
        });

        return {
            labels: Object.keys(ownerCounts),
            values: Object.values(ownerCounts)
        };
    }

    getTimelineData() {
        if (this.data.length === 0) {
            return { labels: ['No Data'], values: [0] };
        }

        // Take last 20 predictions for timeline
        const recentData = this.data.slice(0, 20).reverse();
        
        return {
            labels: recentData.map((_, index) => `#${index + 1}`),
            values: recentData.map(item => item.predicted_price)
        };
    }

    setupChartControls() {
        const chartButtons = document.querySelectorAll('.chart-btn');
        
        chartButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                chartButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update chart based on selection
                const chartType = button.dataset.chart;
                this.updateDistributionChart(chartType);
            });
        });
    }

    updateDistributionChart(type) {
        if (!this.charts.distribution) return;

        let data;
        switch (type) {
            case 'brand':
                data = this.getBrandDistribution();
                break;
            case 'owner':
                data = this.getOwnerDistribution();
                break;
            default:
                data = this.getPriceDistribution();
        }

        this.charts.distribution.data.labels = data.labels;
        this.charts.distribution.data.datasets[0].data = data.values;
        this.charts.distribution.update('active');
    }

    // Public method to refresh data
    async refresh() {
        await this.loadData();
        if (this.charts.distribution) {
            this.updateDistributionChart('price');
        }
        if (this.charts.timeline) {
            const timelineData = this.getTimelineData();
            this.charts.timeline.data.labels = timelineData.labels;
            this.charts.timeline.data.datasets[0].data = timelineData.values;
            this.charts.timeline.update('active');
        }
    }
}

// Global function to initialize charts
function initializeCharts() {
    window.dataVisualization = new DataVisualization();
}

// Auto-refresh charts every 30 seconds
setInterval(() => {
    if (window.dataVisualization) {
        window.dataVisualization.refresh();
    }
}, 30000);

// Export for use in other scripts
window.DataVisualization = DataVisualization;
