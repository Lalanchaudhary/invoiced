import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MonthlyRevenueChart = () => {
  const data = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec1',
    ],
    datasets: [
      {
        label: 'Revenue',
        data: [200, 300, 250, 400, 350, 500, 600, 450, 700, 2530, 800, 900], // Example data
        backgroundColor: '#5777ff',
        hoverBackgroundColor: '#0e514f',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `$${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: true,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedIndex = elements[0].index;
        const month = data.labels[clickedIndex];
        const revenue = data.datasets[0].data[clickedIndex];
        alert(`Month: ${month}\nRevenue: $${revenue}`);
      }
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-xl mt-4 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-bold">Monthly Revenue</h3>
        <p className="text-xl font-bold">$2,530</p>
        <p className="text-gray-600 text-sm">October 2024</p>
      </div>
      <div className="w-2/3 h-auto">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
