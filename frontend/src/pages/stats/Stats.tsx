import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { getStatsGroupByMonthCategory } from '@/api/stats.api';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

/**
 * 统计页面组件
 *
 * @returns {JSX.Element} 统计页面
 */
const Stats: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getStatsGroupByMonthCategory({ page: 1, pageSize: 12 }).then(res => {
      setData(res.data?.data || []);
    });
  }, []);

  return (
    <div
      style={{
        padding: 16,
        height: '100vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
        background: '#fff',
      }}
    >
      {data.length === 0 && <div>暂无数据</div>}
      {data.map(month => {
        if (!month.stats || month.stats.length === 0) return null;
        // 使用 categoryName 作为标签
        const labels = month.stats.map((item: any) => item.categoryName);
        const values = month.stats.map((item: any) => item.totalReps);
        // 额外保存组数和天数用于 tooltip
        const extraInfo = month.stats.map((item: any) => ({
          totalGroups: item.totalGroups,
          totalDays: item.totalDays,
          totalReps: item.totalReps,
        }));
        return (
          <div key={month.period} style={{ marginBottom: 32 }}>
            <h3>{month.period}</h3>
            <Pie
              data={{
                labels,
                datasets: [
                  {
                    data: values,
                    backgroundColor: [
                      '#1890FF',
                      '#13C2C2',
                      '#52C41A',
                      '#FAAD14',
                      '#F5222D',
                      '#722ED1',
                      '#EB2F96',
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { display: true, position: 'right' },
                  title: { display: true, text: `${month.period} 各类别训练次数` },
                  tooltip: {
                    callbacks: {
                      label: function (context: any) {
                        const idx = context.dataIndex;
                        const info = extraInfo[idx];
                        return `${context.label}: ${info.totalReps} 次，${info.totalGroups || 0} 组，${info.totalDays || 0} 天`;
                      },
                    },
                  },
                },
              }}
              style={{ maxWidth: 400, margin: '0 auto' }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
