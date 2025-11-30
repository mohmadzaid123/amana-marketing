"use client";

import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { BubbleMap } from '../../src/components/ui/bubble-map';
import { CardMetric } from '../../src/components/ui/card-metric';
import { Table } from '../../src/components/ui/table';
import { MapPin, DollarSign, TrendingUp, Globe } from "lucide-react";
import { useEffect, useState } from "react";

interface RegionalData {
  region: string;
  country: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  conversion_rate: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  regional_performance: RegionalData[];
}

interface MarketingData {
  campaigns: Campaign[];
}

// City coordinates for major cities in the Middle East and North Africa
const cityCoordinates: Record<string, { x: number; y: number; country: string }> = {
  Dubai: { x: 55.2708, y: 25.2048, country: "UAE" },
  "Abu Dhabi": { x: 54.3773, y: 24.4539, country: "UAE" },
  Riyadh: { x: 46.6753, y: 24.7136, country: "Saudi Arabia" },
  Jeddah: { x: 39.1925, y: 21.5433, country: "Saudi Arabia" },
  Cairo: { x: 31.2357, y: 30.0444, country: "Egypt" },
  Doha: { x: 51.5310, y: 25.2854, country: "Qatar" },
  Kuwait: { x: 47.9774, y: 29.3759, country: "Kuwait" },
  Manama: { x: 50.5577, y: 26.0667, country: "Bahrain" },
  Muscat: { x: 58.4059, y: 23.5880, country: "Oman" },
  Amman: { x: 35.9450, y: 31.9539, country: "Jordan" },
  Beirut: { x: 35.5018, y: 33.8886, country: "Lebanon" },
  Casablanca: { x: -7.5898, y: 33.5731, country: "Morocco" },
  Tunis: { x: 10.1815, y: 36.8065, country: "Tunisia" },
  Algiers: { x: 3.0588, y: 36.7538, country: "Algeria" },
  Paris: { x: 2.3522, y: 48.8566, country: "France" },
  London: { x: -0.1276, y: 51.5074, country: "United Kingdom" },
  Madrid: { x: -3.7038, y: 40.4168, country: "Spain" },
  Rome: { x: 12.4964, y: 41.9028, country: "Italy" },
  Berlin: { x: 13.4050, y: 52.5200, country: "Germany" },
  Istanbul: { x: 28.9784, y: 41.0082, country: "Turkey" },
};

export default function RegionView() {
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

  // Aggregate regional data across all campaigns
  const aggregatedRegionalData = () => {
    const regionalMap = new Map<string, {
      spend: number;
      revenue: number;
      impressions: number;
      clicks: number;
      conversions: number;
      country: string;
    }>();

    if (!data?.campaigns || data.campaigns.length === 0) {
      return [];
    }

    data.campaigns.forEach(campaign => {
      if (!campaign.regional_performance) return;
      campaign.regional_performance.forEach(region => {
        const key = region.region;
        if (!regionalMap.has(key)) {
          regionalMap.set(key, {
            spend: 0,
            revenue: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            country: region.country
          });
        }
        const existing = regionalMap.get(key)!;
        existing.spend += region.spend;
        existing.revenue += region.revenue;
        existing.impressions += region.impressions;
        existing.clicks += region.clicks;
        existing.conversions += region.conversions;
      });
    });

    return Array.from(regionalMap.entries()).map(([region, data]) => ({
      region,
      ...data
    }));
  };

  const regionalData = data?.campaigns?.length ? aggregatedRegionalData() : [];

  // Create a map of existing data for quick lookup
  const regionalDataMap = new Map(regionalData.map(r => [r.region, r]));

  // Prepare data for bubble map (revenue) - include ALL cities
  const bubbleMapDataRevenue = Object.entries(cityCoordinates).map(([city, coords]) => {
    const regionData = regionalDataMap.get(city);
    return {
      city,
      country: coords.country,
      value: regionData?.revenue || 1000, // Show small bubble for cities without data
      secondaryValue: regionData?.spend || 0,
      x: coords.x,
      y: coords.y
    };
  });

  // Prepare data for bubble map (spend) - include ALL cities
  const bubbleMapDataSpend = Object.entries(cityCoordinates).map(([city, coords]) => {
    const regionData = regionalDataMap.get(city);
    return {
      city,
      country: coords.country,
      value: regionData?.spend || 1000, // Show small bubble for cities without data
      secondaryValue: regionData?.revenue || 0,
      x: coords.x,
      y: coords.y
    };
  });

  // Calculate summary metrics
  const totalRevenue = regionalData.reduce((sum, region) => sum + region.revenue, 0);
  const totalSpend = regionalData.reduce((sum, region) => sum + region.spend, 0);
  const totalClicks = regionalData.reduce((sum, region) => sum + region.clicks, 0);
  const totalConversions = regionalData.reduce((sum, region) => sum + region.conversions, 0);
  const totalRegions = regionalData.length;

  // Prepare table data
  const tableData = regionalData
    .sort((a, b) => b.revenue - a.revenue)
    .map(region => ({
      region: region.region,
      country: region.country,
      revenue: `$${region.revenue.toLocaleString()}`,
      spend: `$${region.spend.toLocaleString()}`,
      clicks: region.clicks.toLocaleString(),
      conversions: region.conversions.toLocaleString(),
      roas: ((region.revenue / region.spend) || 0).toFixed(2)
    }));

  const tableColumns = [
    { key: "region", header: "Region", sortable: true },
    { key: "country", header: "Country", sortable: true },
    { key: "revenue", header: "Revenue", sortable: true },
    { key: "spend", header: "Spend", sortable: true },
    { key: "clicks", header: "Clicks", sortable: true },
    { key: "conversions", header: "Conversions", sortable: true },
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
                Region View
              </h1>
              <p className="text-gray-300 mt-2">Geographic performance across all campaign regions</p>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CardMetric
              title="Total Regions"
              value={totalRegions.toString()}
              icon={<Globe className="w-6 h-6" />}
              className="bg-gradient-to-br from-indigo-600 to-indigo-700"
            />
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
              title="Avg ROAS"
              value={((totalRevenue / totalSpend) || 0).toFixed(2)}
              icon={<MapPin className="w-6 h-6" />}
              className="bg-gradient-to-br from-purple-600 to-purple-700"
            />
          </div>

          {/* Bubble Maps */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <BubbleMap
              title="Revenue by Region"
              data={bubbleMapDataRevenue}
              primaryColor="#10B981"
              formatValue={(value) => `$${value.toLocaleString()}`}
              metric="Revenue"
              height={500}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <BubbleMap
              title="Spend by Region"
              data={bubbleMapDataSpend}
              primaryColor="#F59E0B"
              formatValue={(value) => `$${value.toLocaleString()}`}
              metric="Spend"
              height={500}
            />
          </div>

          {/* Regional Performance Table */}
          <div className="mb-8">
            <Table
              title="Regional Performance Details"
              data={tableData}
              columns={tableColumns}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}

