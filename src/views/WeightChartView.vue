<template>
  <div class="weight-chart-view">
    <!-- 体重趋势图表 -->
    <WeightChart :getWeightData="getWeightData" :records="records" />
  </div>
</template>

<script>
import WeightChart from '../components/WeightChart.vue';
import { useTraining } from '../composables/useTraining';

export default {
  name: 'WeightChartView',
  components: {
    WeightChart
  },
  setup() {
    // 使用训练记录逻辑
    const { getWeightData, records } = useTraining();
    
    return {
      getWeightData,
      records
    };
  }
};
</script>

<style scoped>
.weight-chart-view {
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.btn-secondary {
  background: #2196F3;
  color: white;
}
</style>