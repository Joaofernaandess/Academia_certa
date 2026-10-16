import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { formatQuantityMasked } from '../../utils/quantity';

ChartJS.register(ArcElement, Tooltip, Legend);

const DARK_PALETTE = [
  '#1565C0',
  '#D4A017',
  '#1976D2',
  '#F9A825',
  '#0D47A1',
  '#FFD54F',
  '#1E88E5',
  '#F59E0B',
  '#42A5F5',
  '#FFC107',
  '#1565C0AA',
  '#D4A017AA',
];

const LIGHT_PALETTE = [
  '#1565C0',
  '#1E88E5',
  '#0D47A1',
  '#42A5F5',
  '#9CA3AF',
  '#6B7280',
  '#D1D5DB',
  '#4B5563',
  '#93C5FD',
  '#BFC7D5',
  '#7C8CA5',
  '#E5E7EB',
];

export default function PizzaDashboardChart({ data, theme = 'dark', unidade = 'L' }) {
  const [hiddenItems, setHiddenItems] = useState({});
  const [outlinedItems, setOutlinedItems] = useState({});

  const isLight = theme === 'light';
  const palette = isLight ? LIGHT_PALETTE : DARK_PALETTE;
  const outlineColor = isLight ? '#000000' : '#000000';

  useEffect(() => {
    setHiddenItems({});
    setOutlinedItems({});
  }, [data]);

  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.label),
      datasets: [
        {
          data: data.map((d, index) => (hiddenItems[index] ? 0 : Number(d.value))),
          backgroundColor: data.map((_, i) => palette[i % palette.length]),
          borderColor: data.map((_, index) =>
            outlinedItems[index]
              ? outlineColor
              : isLight
                ? '#F3F4F6'
                : 'rgba(255,255,255,0.08)'
          ),
          borderWidth: data.map((_, index) => (outlinedItems[index] ? 5 : 2)),
          hoverOffset: 6,
        },
      ],
    };
  }, [data, hiddenItems, outlinedItems, palette, outlineColor, isLight]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          onClick: null,
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatQuantityMasked(ctx.parsed)} ${unidade}`,
          },
        },
      },
      cutout: '62%',
    };
  }, [unidade]);

  const handleColorClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    setOutlinedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleTextClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();

    setHiddenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="dashboard-chart">
      <div className="dashboard-chart-canvas">
        <Doughnut data={chartData} options={options} />
      </div>

      <div className="dashboard-chart-legend">
        {data.map((item, index) => {
          const isHidden = !!hiddenItems[index];
          const isOutlined = !!outlinedItems[index];
          const swatchClassName = [
            'dashboard-chart-swatch',
            `dashboard-chart-swatch-${index % palette.length}`,
            isOutlined ? 'dashboard-chart-swatch-outlined' : '',
          ].filter(Boolean).join(' ');
          const itemClassName = [
            'dashboard-chart-legend-item',
            isHidden ? 'dashboard-chart-legend-item-hidden' : '',
          ].filter(Boolean).join(' ');
          const labelClassName = [
            'dashboard-chart-legend-label',
            isHidden ? 'dashboard-chart-legend-label-hidden' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={`${item.label}-${index}`}
              className={itemClassName}
            >
              <button
                type="button"
                onClick={(event) => handleColorClick(event, index)}
                title="Contornar fatia no gráfico"
                className={swatchClassName}
              />

              <button
                type="button"
                onClick={(event) => handleTextClick(event, index)}
                title="Mostrar ou ocultar espaço no gráfico"
                className={labelClassName}
              >
                {item.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
