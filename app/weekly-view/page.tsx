"use client";

import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { LineChart } from '../../src/components/ui/line-chart';
import { CardMetric } from '../../src/components/ui/card-metric';
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

interface WeeklyData {
  week_start: string;
  week_end: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  weekly_performance: WeeklyData[];
}

interface MarketingData {
  campaigns: Campaign[];
}

export default function WeeklyView() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/marketing-data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Aggregate weekly data across all campaigns
  const aggregatedWeeklyData = () => {
    const weeklyMap = new Map<string, {
      spend: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
      weekStart: string;
      weekEnd: string;
    }>();

    if (!data?.campaigns || data.campaigns.length === 0) {
      return [];
    }

    data.campaigns.forEach(campaign => {
      if (!campaign.weekly_performance) return;
      campaign.weekly_performance.forEach(week => {
        const key = week.week_start;
        if (!weeklyMap.has(key)) {
          weeklyMap.set(key, {
            spend: 0,
            revenue: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            weekStart: week.week_start,
            weekEnd: week.week_end
          });
        }
        const existing = weeklyMap.get(key)!;
        existing.spend += week.spend;
        existing.revenue += week.revenue;
        existing.impressions += week.impressions;
        existing.clicks += week.clicks;
        existing.conversions += week.conversions;
      });
    });

    return Array.from(weeklyMap.values()).sort((a, b) => 
      new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );
  };

  const weeklyData = data?.campaigns?.length ? aggregatedWeeklyData() : [];

  // Prepare data for line charts
  const revenueByWeek = weeklyData.map(week => ({
    label: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: week.revenue
  }));

  const spendByWeek = weeklyData.map(week => ({
    label: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: week.spend
  }));

  const clicksByWeek = weeklyData.map(week => ({
    label: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: week.clicks
  }));

  const conversionsByWeek = weeklyData.map(week => ({
    label: new Date(week.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: week.conversions
  }));

  // Calculate summary metrics
  const totalRevenue = weeklyData.reduce((sum, week) => sum + week.revenue, 0);
  const totalSpend = weeklyData.reduce((sum, week) => sum + week.spend, 0);
  const totalClicks = weeklyData.reduce((sum, week) => sum + week.clicks, 0);
  const totalConversions = weeklyData.reduce((sum, week) => sum + week.conversions, 0);
  const avgWeeklyRevenue = totalRevenue / (weeklyData.length || 1);
  const avgWeeklySpend = totalSpend / (weeklyData.length || 1);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12">
          <div className="px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold">
                Weekly View
              </h1>
              <p className="text-gray-300 mt-2">Track campaign performance trends over time</p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardMetric
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              className="bg-gradient-to-br from-green-600 to-green-700"
            />
            <CardMetric
              title="Total Spend"
              value={`$${totalSpend.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6" />}
              className="bg-gradient-to-br from-orange-600 to-orange-700"
            />
            <CardMetric
              title="Total Clicks"
              value={totalClicks.toLocaleString()}
              icon={<BarChart3 className="w-6 h-6" />}
              className="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <CardMetric
              title="Total Conversions"
              value={totalConversions.toLocaleString()}
              icon={<Calendar className="w-6 h-6" />}
              className="bg-gradient-to-br from-purple-600 to-purple-700"
            />
          </div>

          {/* Line Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <LineChart
              title="Revenue by Week"
              data={revenueByWeek}
              color="#10B981"
              formatValue={(value) => `$${value.toLocaleString()}`}
              lineLabel="Weekly Revenue"
              height={350}
            />
            <LineChart
              title="Spend by Week"
              data={spendByWeek}
              color="#F59E0B"
              formatValue={(value) => `$${value.toLocaleString()}`}
              lineLabel="Weekly Spend"
              height={350}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              title="Clicks by Week"
              data={clicksByWeek}
              color="#3B82F6"
              formatValue={(value) => value.toLocaleString()}
              lineLabel="Weekly Clicks"
              height={350}
            />
            <LineChart
              title="Conversions by Week"
              data={conversionsByWeek}
              color="#8B5CF6"
              formatValue={(value) => value.toLocaleString()}
              lineLabel="Weekly Conversions"
              height={350}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
