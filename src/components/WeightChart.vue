<template>
  <div class="weight-chart">
    <div class="bmi-section">
      <div v-if="showHeightInput || !height" class="bmi-input">
        <label for="height">身高 (cm)</label>
        <input 
          id="height" 
          type="number" 
          v-model="tempHeight" 
          @keyup.enter="handleHeightBlur"
          placeholder="请输入身高"
          ref="heightInput"
        />
        <button v-if="tempHeight" class="btn btn-secondary btn-save" @click="handleHeightBlur">
          确定
        </button>
      </div>
      <div v-if="bmi !== null" class="bmi-info">
        <div class="bmi-value">
          <span class="label">当前BMI</span>
          <span class="value" :class="bmiLevel">{{ bmi.toFixed(1) }}</span>
        </div>
        <div class="bmi-status">
          <span class="label">健康状况</span>
          <span class="status" :class="bmiLevel">{{ bmiStatus }}</span>
        </div>
        <div class="bmi-suggestion">{{ bmiSuggestion }}</div>
        <button v-if="height && !showHeightInput" class="btn btn-edit-height" @click="handleEditHeight">
          修改身高
        </button>
      </div>
      <div v-else class="bmi-empty">
        请输入身高以计算BMI
      </div>
    </div>
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
    
    // 是否显示身高输入框
    const showHeightInput = ref(false);
    // 身高输入框引用
    const heightInput = ref(null);
    
    // 身高（从localStorage读取）
    const height = ref(parseFloat(localStorage.getItem('user-height')) || '');
    // 临时身高输入值（用于编辑时暂存）
    const tempHeight = ref('');
    
    // 当前体重（最新记录的值）
    const currentWeight = computed(() => {
      if (props.records.length === 0) return null;
      const latestRecord = [...props.records]
        .filter(r => r.weight)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return latestRecord ? parseFloat(latestRecord.weight) : null;
    });
    
    // BMI值
    const bmi = computed(() => {
      if (!height.value || !currentWeight.value) return null;
      
      const heightNum = parseFloat(height.value);
      const weightNum = parseFloat(currentWeight.value);
      
      if (isNaN(heightNum) || isNaN(weightNum)) return null;
      if (heightNum <= 0 || weightNum <= 0) return null;
      
      const heightInMeters = heightNum / 100;
      if (heightInMeters <= 0) return null;
      
      const bmiValue = weightNum / (heightInMeters * heightInMeters);
      
      if (isNaN(bmiValue) || !isFinite(bmiValue)) return null;
      
      return bmiValue;
    });
    
    // BMI等级
    const bmiLevel = computed(() => {
      if (bmi.value === null) return '';
      if (bmi.value < 18.5) return 'underweight';
      if (bmi.value < 24) return 'normal';
      if (bmi.value < 28) return 'overweight';
      return 'obese';
    });
    
    // BMI状态描述
    const bmiStatus = computed(() => {
      if (bmi.value === null) return '';
      if (bmi.value < 18.5) return '偏瘦';
      if (bmi.value < 24) return '正常';
      if (bmi.value < 28) return '超重';
      return '肥胖';
    });
    
    // BMI建议
    const bmiSuggestion = computed(() => {
      if (bmi.value === null) return '';
      if (bmi.value < 18.5) {
        return '建议适当增加营养摄入，保持均衡饮食，进行适度的力量训练以增加肌肉量。';
      }
      if (bmi.value < 24) {
        return '体重处于健康范围，请继续保持良好的饮食习惯和运动习惯！';
      }
      if (bmi.value < 28) {
        return '建议控制饮食，减少高热量食物摄入，增加有氧运动如跑步、游泳等。';
      }
      return '建议咨询医生制定科学的减重计划，配合合理饮食和规律运动。';
    });
    
    // 验证身高是否有效
    const isValidHeight = (h) => {
      const heightNum = parseFloat(h);
      return !isNaN(heightNum) && heightNum >= 50 && heightNum <= 250;
    };
    
    // 保存身高到localStorage
    const saveHeight = () => {
      if (isValidHeight(height.value)) {
        localStorage.setItem('user-height', height.value);
        return true;
      }
      return false;
    };
    
    // 处理点击修改身高按钮
    const handleEditHeight = () => {
      tempHeight.value = height.value;
      showHeightInput.value = true;
    };

    // 处理身高输入完成
    const handleHeightBlur = () => {
      if (tempHeight.value) {
        if (isValidHeight(tempHeight.value)) {
          height.value = tempHeight.value;
          saveHeight();
          showHeightInput.value = false;
          tempHeight.value = '';
        } else {
          alert('请输入有效的身高（50-250cm）');
          if (heightInput.value) {
            heightInput.value.focus();
          }
        }
      }
    };
    
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
      updateChartData,
      height,
      tempHeight,
      bmi,
      bmiLevel,
      bmiStatus,
      bmiSuggestion,
      saveHeight,
      showHeightInput,
      heightInput,
      handleHeightBlur,
      handleEditHeight
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

.bmi-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5b70a;
}

.bmi-input {
  margin-bottom: 15px;
}

.bmi-input label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #003153;
}

.bmi-input input {
  width: 150px;
  padding: 8px;
  border: 1px solid #f5b70a;
  border-radius: 4px;
  font-size: 16px;
  background-color: #ffffff;
  color: #003153;
}

.bmi-input input:focus {
  outline: none;
  border-color: #003153;
  box-shadow: 0 0 0 2px rgba(0, 49, 83, 0.1);
}

.bmi-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.bmi-value,
.bmi-status {
  display: flex;
  flex-direction: column;
}

.bmi-value .label,
.bmi-status .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.bmi-value .value {
  font-size: 28px;
  font-weight: bold;
}

.bmi-status .status {
  font-size: 18px;
  font-weight: bold;
}

.bmi-value .value.underweight,
.bmi-status .status.underweight {
  color: #2196F3;
}

.bmi-value .value.normal,
.bmi-status .status.normal {
  color: #4CAF50;
}

.bmi-value .value.overweight,
.bmi-status .status.overweight {
  color: #ff9800;
}

.bmi-value .value.obese,
.bmi-status .status.obese {
  color: #f44336;
}

.bmi-suggestion {
  flex: 1;
  min-width: 200px;
  padding: 10px;
  background: #ffffff;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  border-left: 3px solid #f5b70a;
}

.bmi-empty {
  color: #999;
  font-style: italic;
  padding: 10px 0;
}

.bmi-input .btn-save {
  margin-left: 10px;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-edit-height {
  padding: 6px 12px;
  font-size: 12px;
  background: #666;
  color: white;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit-height:hover {
  background: #003153;
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