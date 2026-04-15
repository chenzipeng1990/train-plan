<template>
  <div class="weight-chart">
    <div class="chart-controls">
      <div class="form-group">
        <label for="year">年份</label>
        <select id="year" v-model="selectedYear" @change="updateChartData">
          <option 
            v-for="year in availableYears" 
            :key="year" 
            :value="year"
          >
            {{ year }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="month">月份</label>
        <select id="month" v-model="selectedMonth" @change="updateChartData">
          <option 
            v-for="month in 12" 
            :key="month" 
            :value="month"
          >
            {{ month }}月
          </option>
        </select>
      </div>
    </div>
    <div class="chart-container">
      <Line v-if="hasData" :key="chartKey" :data="chartData" :options="chartOptions" />
      <div v-else class="no-data">
        <p>暂无体重数据</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import dayjs from 'dayjs';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  name: 'WeightChart',
  components: {
    Line
  },
  props: {
    getWeightData: {
      type: Function,
      required: true
    },
    records: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    // 当前选中的年份和月份
    const selectedYear = ref(dayjs().year());
    const selectedMonth = ref(dayjs().month() + 1);
    // 图表数据
    const chartData = ref({
      labels: [],
      datasets: [{
        label: '体重 (kg)',
        data: [],
        borderColor: '#003153', // 普鲁士蓝 - 主色
        backgroundColor: 'rgba(0, 49, 83, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#f5b70a', // 范思哲黄 - 副色
        pointBorderColor: '#003153', // 普鲁士蓝 - 主色
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    });
    // 图表选项
    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#003153', // 普鲁士蓝 - 主色
            font: {
              weight: 'bold'
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#003153', // 普鲁士蓝 - 主色
          titleColor: '#f5b70a', // 范思哲黄 - 副色
          bodyColor: '#f8f9fa', // 淡灰色背景
          borderColor: '#f5b70a', // 范思哲黄 - 副色
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: '体重 (kg)',
            color: '#003153', // 普鲁士蓝 - 主色
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 49, 83, 0.1)'
          },
          ticks: {
            color: '#003153' // 普鲁士蓝 - 主色
          }
        },
        x: {
          title: {
            display: true,
            text: '日期',
            color: '#003153', // 普鲁士蓝 - 主色
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 49, 83, 0.1)'
          },
          ticks: {
            color: '#003153' // 普鲁士蓝 - 主色
          }
        }
      }
    });
    // 图表key，用于强制重新渲染
    const chartKey = ref(0);
    
    // 计算是否有数据
    const hasData = computed(() => {
      return chartData.value.datasets[0].data.length > 0;
    });
    
    // 计算可用年份范围
    const availableYears = computed(() => {
      if (props.records.length === 0) {
        // 无数据时，显示当前年份前后各1年
        const currentYear = dayjs().year();
        return [currentYear - 1, currentYear, currentYear + 1];
      } else {
        // 有数据时，基于数据中的最小和最大年份，前后各浮动1年
        const years = props.records.map(record => dayjs(record.date).year());
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        
        const startYear = minYear - 1;
        const endYear = maxYear + 1;
        
        const yearRange = [];
        for (let year = startYear; year <= endYear; year++) {
          yearRange.push(year);
        }
        return yearRange;
      }
    });
    
    // 初始化选中的年份和月份
    const initSelectedDate = () => {
      if (props.records.length === 0) {
        // 无数据时，使用当前日期
        selectedYear.value = dayjs().year();
        selectedMonth.value = dayjs().month() + 1;
      } else {
        // 有数据时，使用最新记录的日期
        const latestRecord = [...props.records].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        })[0];
        
        selectedYear.value = dayjs(latestRecord.date).year();
        selectedMonth.value = dayjs(latestRecord.date).month() + 1;
      }
    };
    
    // 更新图表数据
    const updateChartData = () => {
      try {
        // 获取体重数据
        const { dates, weights } = props.getWeightData(selectedYear.value, selectedMonth.value);
        
        // 准备图表数据
        const labels = dates.map(date => {
          return dayjs(date).format('DD');
        });
        
        // 更新图表数据
        chartData.value.labels = labels;
        chartData.value.datasets[0].data = weights;
        
        // 强制重新渲染图表
        chartKey.value++;
      } catch (error) {
        console.error('更新图表数据失败:', error);
        // 出错时清空数据
        chartData.value.labels = [];
        chartData.value.datasets[0].data = [];
        // 强制重新渲染图表
        chartKey.value++;
      }
    };
    
    // 监听记录变化，重新初始化选中日期
    watch(() => props.records, () => {
      try {
        initSelectedDate();
        updateChartData();
      } catch (error) {
        console.error('处理记录变化失败:', error);
      }
    }, { deep: true });
    
    // 初始化
    onMounted(() => {
      try {
        initSelectedDate();
        updateChartData();
      } catch (error) {
        console.error('初始化图表失败:', error);
      }
    });
    
    return {
      selectedYear,
      selectedMonth,
      availableYears,
      chartData,
      chartOptions,
      chartKey,
      hasData,
      updateChartData
    };
  }
};
</script>

<style scoped>
.weight-chart {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  min-height: 400px;
}

.chart-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #003153; /* 普鲁士蓝 - 主色 */
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
  background-color: #f8f9fa; /* 淡灰色背景 */
  color: #003153; /* 普鲁士蓝 - 主色 */
  font-weight: 500;
}

select:focus {
  outline: none;
  border-color: #003153; /* 普鲁士蓝 - 主色 */
  box-shadow: 0 0 0 2px rgba(0, 49, 83, 0.1);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  background: #f8f9fa; /* 淡灰色背景 */
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  overflow: hidden;
}

.no-data {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 249, 250, 0.9);
  color: #003153; /* 普鲁士蓝 - 主色 */
  font-weight: bold;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
  }
  
  .weight-chart {
    min-height: 350px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>