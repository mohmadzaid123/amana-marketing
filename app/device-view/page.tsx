"use client";

import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Smartphone, Monitor, TrendingUp, DollarSign, MousePointerClick, Target } from "lucide-react";
import { useEffect, useState } from "react";

interface DeviceData {
  device: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  percentage_of_traffic: number;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  device_performance: DeviceData[];
  spend: number;
  revenue: number;
}

interface MarketingData {
  campaigns: Campaign[];
}

export default function DeviceView() {
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

  // Aggregate device data across all campaigns
  const aggregatedDeviceData = () => {
    if (!data?.campaigns || data.campaigns.length === 0) {
      return [];
    }

    const deviceMap = new Map<string, {
      impressions: number;
      clicks: number;
      conversions: number;
      spend: number;
      revenue: number;
      traffic: number;
    }>();

    data.campaigns.forEach(campaign => {
      if (!campaign.device_performance) return;
      campaign.device_performance.forEach(device => {
        const key = device.device;
        if (!deviceMap.has(key)) {
          deviceMap.set(key, {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0,
            revenue: 0,
            traffic: 0
          });
        }
        const existing = deviceMap.get(key)!;
        existing.impressions += device.impressions;
        existing.clicks += device.clicks;
        existing.conversions += device.conversions;
        existing.spend += device.spend;
        existing.revenue += device.revenue;
        existing.traffic += device.percentage_of_traffic;
      });
    });

    return Array.from(deviceMap.entries()).map(([device, stats]) => ({
      device,
      ...stats
    }));
  };

  const deviceData = data?.campaigns?.length ? aggregatedDeviceData() : [];

  // Get Mobile and Desktop data
  const mobileData = deviceData.find(d => d.device === 'Mobile') || { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, traffic: 0 };
  const desktopData = deviceData.find(d => d.device === 'Desktop') || { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, traffic: 0 };

  // Calculate metrics
  const mobileCTR = mobileData.impressions > 0 ? (mobileData.clicks / mobileData.impressions) * 100 : 0;
  const desktopCTR = desktopData.impressions > 0 ? (desktopData.clicks / desktopData.impressions) * 100 : 0;
  const mobileConversionRate = mobileData.clicks > 0 ? (mobileData.conversions / mobileData.clicks) * 100 : 0;
  const desktopConversionRate = desktopData.clicks > 0 ? (desktopData.conversions / desktopData.clicks) * 100 : 0;
  const mobileROAS = mobileData.spend > 0 ? mobileData.revenue / mobileData.spend : 0;
  const desktopROAS = desktopData.spend > 0 ? desktopData.revenue / desktopData.spend : 0;

  // Prepare chart data
  const revenueByDevice = deviceData.map(d => ({
    label: d.device,
    value: d.revenue
  }));

  const spendByDevice = deviceData.map(d => ({
    label: d.device,
    value: d.spend
  }));

  const clicksByDevice = deviceData.map(d => ({
    label: d.device,
    value: d.clicks
  }));

  const conversionsByDevice = deviceData.map(d => ({
    label: d.device,
    value: d.conversions
  }));

  // Prepare table data - campaigns by device
  const mobileCampaigns = data?.campaigns
    ?.map(campaign => {
      const mobilePerf = campaign.device_performance?.find(d => d.device === 'Mobile');
      if (!mobilePerf) return null;
      return {
        campaign: campaign.campaign_name,
        impressions: mobilePerf.impressions.toLocaleString(),
        clicks: mobilePerf.clicks.toLocaleString(),
        conversions: mobilePerf.conversions.toLocaleString(),
        spend: `$${mobilePerf.spend.toLocaleString()}`,
        revenue: `$${mobilePerf.revenue.toLocaleString()}`,
        ctr: `${mobilePerf.ctr.toFixed(2)}%`,
        roas: (mobilePerf.revenue / mobilePerf.spend).toFixed(2)
      };
    })
    .filter(c => c !== null)
    .sort((a, b) => parseFloat(b!.revenue.replace(/[$,]/g, '')) - parseFloat(a!.revenue.replace(/[$,]/g, ''))) || [];

  const desktopCampaigns = data?.campaigns
    ?.map(campaign => {
      const desktopPerf = campaign.device_performance?.find(d => d.device === 'Desktop');
      if (!desktopPerf) return null;
      return {
        campaign: campaign.campaign_name,
        impressions: desktopPerf.impressions.toLocaleString(),
        clicks: desktopPerf.clicks.toLocaleString(),
        conversions: desktopPerf.conversions.toLocaleString(),
        spend: `$${desktopPerf.spend.toLocaleString()}`,
        revenue: `$${desktopPerf.revenue.toLocaleString()}`,
        ctr: `${desktopPerf.ctr.toFixed(2)}%`,
        roas: (desktopPerf.revenue / desktopPerf.spend).toFixed(2)
      };
    })
    .filter(c => c !== null)
    .sort((a, b) => parseFloat(b!.revenue.replace(/[$,]/g, '')) - parseFloat(a!.revenue.replace(/[$,]/g, ''))) || [];

  const tableColumns = [
    { key: "campaign", header: "Campaign", sortable: true },
    { key: "impressions", header: "Impressions", sortable: true },
    { key: "clicks", header: "Clicks", sortable: true },
    { key: "conversions", header: "Conversions", sortable: true },
    { key: "spend", header: "Spend", sortable: true },
    { key: "revenue", header: "Revenue", sortable: true },
    { key: "ctr", header: "CTR", sortable: true },
    { key: "roas", header: "ROAS", sortable: true }
  ];

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
                Device View
              </h1>
              <p className="text-gray-300 mt-2">Compare Desktop vs Mobile performance</p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Mobile Metrics */}
          <h2 className="text-2xl font-bold text-white mb-4">📱 Mobile Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardMetric
              title="Mobile Clicks"
              value={mobileData.clicks.toLocaleString()}
              icon={<MousePointerClick className="w-6 h-6" />}
              className="bg-gradient-to-br from-blue-600 to-blue-700"
            />
            <CardMetric
              title="Mobile Spend"
              value={`$${mobileData.spend.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6" />}
              className="bg-gradient-to-br from-orange-600 to-orange-700"
            />
            <CardMetric
              title="Mobile Revenue"
              value={`$${mobileData.revenue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              className="bg-gradient-to-br from-green-600 to-green-700"
            />
            <CardMetric
              title="Mobile Conversions"
              value={mobileData.conversions.toLocaleString()}
              icon={<Target className="w-6 h-6" />}
              className="bg-gradient-to-br from-purple-600 to-purple-700"
            />
          </div>

          {/* Desktop Metrics */}
          <h2 className="text-2xl font-bold text-white mb-4">🖥️ Desktop Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardMetric
              title="Desktop Clicks"
              value={desktopData.clicks.toLocaleString()}
              icon={<MousePointerClick className="w-6 h-6" />}
              className="bg-gradient-to-br from-cyan-600 to-cyan-700"
            />
            <CardMetric
              title="Desktop Spend"
              value={`$${desktopData.spend.toLocaleString()}`}
              icon={<TrendingUp className="w-6 h-6" />}
              className="bg-gradient-to-br from-red-600 to-red-700"
            />
            <CardMetric
              title="Desktop Revenue"
              value={`$${desktopData.revenue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700"
            />
            <CardMetric
              title="Desktop Conversions"
              value={desktopData.conversions.toLocaleString()}
              icon={<Target className="w-6 h-6" />}
              className="bg-gradient-to-br from-violet-600 to-violet-700"
            />
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              title="Revenue by Device"
              data={revenueByDevice}
            />
            <BarChart
              title="Spend by Device"
              data={spendByDevice}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              title="Clicks by Device"
              data={clicksByDevice}
            />
            <BarChart
              title="Conversions by Device"
              data={conversionsByDevice}
            />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Table
              title="📱 Mobile Campaign Performance"
              data={mobileCampaigns as any[]}
              columns={tableColumns}
            />
            <Table
              title="🖥️ Desktop Campaign Performance"
              data={desktopCampaigns as any[]}
              columns={tableColumns}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
