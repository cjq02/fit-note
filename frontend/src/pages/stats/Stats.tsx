import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getStatsGroupByMonthCategory } from '@/api/stats.api';
import { generateColorFromCategory } from '@fit-note/shared-utils/dict.options';

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

        const pieData = month.stats.map((item: any) => ({
          name: item.categoryName,
          value: item.totalReps,
          itemStyle: {
            color: generateColorFromCategory(item.category),
          },
        }));

        const option = {
          title: {
            text: `${month.period} 各类别训练次数`,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          tooltip: {
            trigger: 'item',
            formatter: function (params: any) {
              const item = month.stats.find((stat: any) => stat.categoryName === params.name);
              if (item) {
                return `${params.name}<br/>次数: ${item.totalReps}<br/>组数: ${item.totalGroups || 0}<br/>天数: ${item.totalDays || 0}`;
              }
              return `${params.name}: ${params.value} 次`;
            },
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
          },
          series: [
            {
              name: '训练次数',
              type: 'pie',
              radius: '50%',
              center: ['40%', '50%'],
              data: pieData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
            },
          ],
        };

        return (
          <div key={month.period} style={{ marginBottom: 32 }}>
            <h3>{month.period}</h3>
            <ReactECharts
              option={option}
              style={{ height: '400px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Stats;
