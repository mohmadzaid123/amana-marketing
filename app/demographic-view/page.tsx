"use client";
import { useEffect, useState } from 'react';
import { Navbar } from '../../src/components/ui/navbar';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table } from '../../src/components/ui/table';
import { Footer } from '../../src/components/ui/footer';
import { Users, UserCheck, TrendingUp, DollarSign, MousePointerClick } from 'lucide-react';

interface DemographicData {
  age_group: string;
  gender: string;
  percentage_of_audience: number;
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversion_rate: number;
  };
}

interface Campaign {
  id: number;
  name: string;
  demographic_breakdown: DemographicData[];
  spend: number;
  revenue: number;
}

interface MarketingData {
  campaigns: Campaign[];
}

export default function DemographicView() {
  const [data, setData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/marketing-data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate demographic metrics
  const calculateMetrics = () => {
    if (!data?.campaigns) return null;

    const maleData = { clicks: 0, spend: 0, revenue: 0 };
    const femaleData = { clicks: 0, spend: 0, revenue: 0 };
    const ageGroupData: { [key: string]: { spend: 0, revenue: 0 } } = {};

    data.campaigns.forEach(campaign => {
      campaign.demographic_breakdown.forEach(demo => {
        const ratio = demo.percentage_of_audience / 100;
        const clicks = demo.performance.clicks;
        const spend = campaign.spend * ratio;
        const revenue = campaign.revenue * ratio;

        if (demo.gender === 'Male') {
          maleData.clicks += clicks;
          maleData.spend += spend;
          maleData.revenue += revenue;
        } else if (demo.gender === 'Female') {
          femaleData.clicks += clicks;
          femaleData.spend += spend;
          femaleData.revenue += revenue;
        }

        if (!ageGroupData[demo.age_group]) {
          ageGroupData[demo.age_group] = { spend: 0, revenue: 0 };
        }
        ageGroupData[demo.age_group].spend += spend;
        ageGroupData[demo.age_group].revenue += revenue;
      });
    });

    return { maleData, femaleData, ageGroupData };
  };

  const metrics = calculateMetrics();

  // Prepare bar chart data
  const spendByAgeGroup = metrics ? Object.entries(metrics.ageGroupData)
    .map(([age, data]) => ({
      label: age,
      value: data.spend
    }))
    .sort((a, b) => a.label.localeCompare(b.label)) : [];

  const revenueByAgeGroup = metrics ? Object.entries(metrics.ageGroupData)
    .map(([age, data]) => ({
      label: age,
      value: data.revenue
    }))
    .sort((a, b) => a.label.localeCompare(b.label)) : [];

  // Prepare table data for male demographics
  const maleTableData = data?.campaigns.flatMap(campaign => 
    campaign.demographic_breakdown
      .filter(demo => demo.gender === 'Male')
      .map(demo => ({
        campaign: campaign.name,
        age_group: demo.age_group,
        impressions: demo.performance.impressions,
        clicks: demo.performance.clicks,
        conversions: demo.performance.conversions,
        ctr: demo.performance.ctr,
        conversion_rate: demo.performance.conversion_rate
      }))
  ) || [];

  // Prepare table data for female demographics
  const femaleTableData = data?.campaigns.flatMap(campaign => 
    campaign.demographic_breakdown
      .filter(demo => demo.gender === 'Female')
      .map(demo => ({
        campaign: campaign.name,
        age_group: demo.age_group,
        impressions: demo.performance.impressions,
        clicks: demo.performance.clicks,
        conversions: demo.performance.conversions,
        ctr: demo.performance.ctr,
        conversion_rate: demo.performance.conversion_rate
      }))
  ) || [];

  const tableColumns = [
    { 
      key: 'campaign', 
      header: 'Campaign', 
      sortable: true,
      sortType: 'string' as const,
      width: '30%'
    },
    { 
      key: 'age_group', 
      header: 'Age Group', 
      sortable: true,
      sortType: 'string' as const,
      align: 'center' as const
    },
    { 
      key: 'impressions', 
      header: 'Impressions', 
      sortable: true,
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'clicks', 
      header: 'Clicks', 
      sortable: true,
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'conversions', 
      header: 'Conversions', 
      sortable: true,
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    { 
      key: 'ctr', 
      header: 'CTR', 
      sortable: true,
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => `${value.toFixed(2)}%`
    },
    { 
      key: 'conversion_rate', 
      header: 'Conv. Rate', 
      sortable: true,
      sortType: 'number' as const,
      align: 'right' as const,
      render: (value: number) => `${value.toFixed(2)}%`
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading demographic data...</div>
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
                Demographic View
              </h1>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Gender Metrics - Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Male Metrics */}
            <CardMetric
              title="Total Clicks by Males"
              value={metrics?.maleData.clicks.toLocaleString() || '0'}
              icon={<MousePointerClick size={24} />}
              className="bg-gradient-to-br from-blue-900 to-gray-800"
            />
            <CardMetric
              title="Total Spend by Males"
              value={`$${metrics?.maleData.spend.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}`}
              icon={<DollarSign size={24} />}
              className="bg-gradient-to-br from-blue-900 to-gray-800"
            />
            <CardMetric
              title="Total Revenue by Males"
              value={`$${metrics?.maleData.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}`}
              icon={<TrendingUp size={24} />}
              className="bg-gradient-to-br from-blue-900 to-gray-800"
            />

            {/* Female Metrics */}
            <CardMetric
              title="Total Clicks by Females"
              value={metrics?.femaleData.clicks.toLocaleString() || '0'}
              icon={<MousePointerClick size={24} />}
              className="bg-gradient-to-br from-pink-900 to-gray-800"
            />
            <CardMetric
              title="Total Spend by Females"
              value={`$${metrics?.femaleData.spend.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}`}
              icon={<DollarSign size={24} />}
              className="bg-gradient-to-br from-pink-900 to-gray-800"
            />
            <CardMetric
              title="Total Revenue by Females"
              value={`$${metrics?.femaleData.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}`}
              icon={<TrendingUp size={24} />}
              className="bg-gradient-to-br from-pink-900 to-gray-800"
            />
          </div>

          {/* Bar Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BarChart
              title="Total Spend by Age Group"
              data={spendByAgeGroup}
              formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              height={350}
            />
            <BarChart
              title="Total Revenue by Age Group"
              data={revenueByAgeGroup}
              formatValue={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              height={350}
            />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 gap-6">
            <Table
              title="Campaign Performance by Male Age Groups"
              columns={tableColumns}
              data={maleTableData}
              maxHeight="500px"
              defaultSort={{ key: 'conversions', direction: 'desc' }}
            />

            <Table
              title="Campaign Performance by Female Age Groups"
              columns={tableColumns}
              data={femaleTableData}
              maxHeight="500px"
              defaultSort={{ key: 'conversions', direction: 'desc' }}
            />
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
