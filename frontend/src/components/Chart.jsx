import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Chart() {
  const data = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
    datasets: [
      {
        label: 'ประสิทธิภาพการทำงาน (%)',
        data: [65, 80, 75, 90, 70, 60],
        backgroundColor: [
          '#4A90E2', // ฟ้า
          '#50E3C2', // เขียวมิ้นต์
          '#9B51E0', // ม่วง
          '#7ED321', // เขียวสด
          '#B8E986', // เขียวอ่อน
          '#D8D8D8', // เทาอ่อน
        ],
        borderRadius: 5,
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
          label: (context) => `${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        title: {
          display: true,
          text: 'ประสิทธิภาพ (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'ช่วงเวลา',
        },
      },
    },
  };

  return (
    <div style={{ width: '80%', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>กราฟตารางเวลาตามประสิทธิภาพ</h2>
      <Bar data={data} options={options} />
    </div>
  );
}

export default Chart;
