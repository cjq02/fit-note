import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { getStatsGroupByMonthCategory } from '@/api/stats.api';
import { CATEGORY_OPTIONS, generateColorFromCategory } from '@fit-note/shared-utils/dict.options';
import LoadingOverlay from '@/components/LoadingOverlay';

/**
 * 统计页面组件
 *
 * @returns {JSX.Element} 统计页面
 */
const Stats: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 生成类别顺序映射
  const categoryOrderMap = CATEGORY_OPTIONS.reduce(
    (map, item) => {
      map[item.value] = item.seqNo;
      return map;
    },
    {} as Record<string, number>,
  );

  useEffect(() => {
    setLoading(true);
    getStatsGroupByMonthCategory({ page: 1, pageSize: 12 })
      .then(res => {
        setData(res.data?.data || []);
      })
      .catch(error => {
        console.error('获取统计数据失败:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        height: 'calc(100vh - 45px)',
        overflowY: 'auto',
        padding: 16,
        boxSizing: 'border-box',
        background: '#fff',
        position: 'relative',
      }}
    >
      <LoadingOverlay visible={loading} text="正在加载统计数据...">
        <div style={{ minHeight: '100%' }}>
          {data.length === 0 ? (
            <div>暂无数据</div>
          ) : (
            data.map(month => {
              if (!month.stats || month.stats.length === 0) return null;

              // 按CATEGORY_OPTIONS顺序排序
              const sortedStats = month.stats.slice().sort((a: any, b: any) => {
                return (categoryOrderMap[a.category] || 99) - (categoryOrderMap[b.category] || 99);
              });

              const pieData = sortedStats.map((item: any) => ({
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
                    const item = sortedStats.find((stat: any) => stat.categoryName === params.name);
                    if (item) {
                      return `${params.name}<br/>次数: ${item.totalReps}<br/>组数: ${item.totalGroups || 0}<br/>天数: ${item.totalDays || 0}`;
                    }
                    return `${params.name}: ${params.value} 次`;
                  },
                },
                legend: {
                  orient: 'horizontal',
                  bottom: 10,
                  left: 'center',
                },
                series: [
                  {
                    name: '训练次数',
                    type: 'pie',
                    radius: '50%',
                    center: ['50%', '45%'],
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
                  <ReactECharts
                    option={option}
                    style={{ height: '400px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              );
            })
          )}
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default Stats;
