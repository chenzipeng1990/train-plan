<template>
  <div class="home-view">
    <!-- 训练记录表单 -->
    <TrainingForm 
      v-if="showForm" 
      :trainingTypes="trainingTypes"
      :record="editingRecord"
      @submit="handleFormSubmit"
      @cancel="showForm = false"
    />
    
    <!-- 添加按钮 -->
    <button v-else class="btn btn-primary add-btn" @click="showForm = true">
      + 添加训练记录
    </button>
    
    <!-- 训练记录列表 -->
    <TrainingList 
      :records="records"
      :trainingTypes="trainingTypes"
      :isLoading="isLoading"
      :hasMore="hasMore"
      @edit="handleEditRecord"
      @delete="handleDeleteRecord"
      @loadMore="handleLoadMore"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import TrainingForm from '../components/TrainingForm.vue';
import TrainingList from '../components/TrainingList.vue';
import { useTraining } from '../composables/useTraining';

export default {
  name: 'HomeView',
  components: {
    TrainingForm,
    TrainingList
  },
  setup() {
    // 使用训练记录逻辑
    const { 
      records, 
      trainingTypes, 
      isLoading,
      hasMore,
      addTrainingRecord, 
      editTrainingRecord, 
      deleteTrainingRecord,
      loadMoreRecords
    } = useTraining();
    
    // 表单状态
    const showForm = ref(false);
    const editingRecord = ref(null);
    
    /**
     * 处理表单提交
     * @param {Object} formData 表单数据
     */
    const handleFormSubmit = (formData) => {
      if (editingRecord.value) {
        // 编辑模式
        editTrainingRecord(editingRecord.value.id, formData);
      } else {
        // 添加模式
        addTrainingRecord(formData);
      }
      // 重置表单状态
      showForm.value = false;
      editingRecord.value = null;
    };
    
    /**
     * 处理编辑记录
     * @param {Object} record 训练记录
     */
    const handleEditRecord = (record) => {
      editingRecord.value = record;
      showForm.value = true;
    };
    
    /**
     * 处理删除记录
     * @param {string} id 记录ID
     */
    const handleDeleteRecord = (id) => {
      deleteTrainingRecord(id);
    };
    
    /**
     * 处理加载更多记录
     */
    const handleLoadMore = () => {
      loadMoreRecords();
    };
    
    return {
      records,
      trainingTypes,
      isLoading,
      hasMore,
      showForm,
      editingRecord,
      handleFormSubmit,
      handleEditRecord,
      handleDeleteRecord,
      handleLoadMore
    };
  }
};
</script>

<style scoped>
.home-view {
  margin-bottom: 20px;
}

.add-btn {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  background: #003153; /* 普鲁士蓝 - 主色 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

.btn-primary {
  background: #003153; /* 普鲁士蓝 - 主色 */
  color: white;
}

.btn-secondary {
  background: #2196F3;
  color: white;
}
</style>