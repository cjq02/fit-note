import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { faker } from '@faker-js/faker';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const labels = [
  '2024-06-01',
  '2024-06-02',
  '2024-06-03',
  '2024-06-04',
  '2024-06-05',
  '2024-06-06',
  '2024-06-07',
];

const data = {
  labels,
  datasets: [
    {
      label: '训练天数',
      data: [2, 1, 3, 0, 2, 1, 4],
      fill: true,
      backgroundColor: 'rgba(24,144,255,0.2)',
      borderColor: '#1890FF',
      tension: 0.4,
      pointBackgroundColor: '#1890FF',
      pointBorderColor: '#1890FF',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: '训练天数趋势',
      font: { size: 18 },
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      title: { display: true, text: '日期' },
      ticks: { maxRotation: 45, minRotation: 0 },
    },
    y: {
      title: { display: true, text: '天数' },
      beginAtZero: true,
      suggestedMax: 5,
    },
  },
};

/**
 *
 */
const Stats: React.FC = () => (
  <div style={{ padding: 16 }}>
    <Line data={data} options={options} style={{ maxHeight: 320 }} />
    <div>随机名字: {faker.person.fullName()}</div>
  </div>
);

export default Stats;
