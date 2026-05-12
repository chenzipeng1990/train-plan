<template>
  <div class="training-form">
    <h2>{{ isEditing ? '编辑训练记录' : '添加训练记录' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="date">日期</label>
        <input 
          type="date" 
          id="date" 
          v-model="formData.date" 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="type">训练类型</label>
        <select id="type" v-model="formData.type" required>
          <option value="">请选择训练类型</option>
          <option 
            v-for="type in trainingTypes" 
            :key="type.value" 
            :value="type.value"
          >
            {{ type.emoji }} {{ type.label }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="detail">训练详情</label>
        <input 
          type="text" 
          id="detail" 
          v-model="formData.detail" 
          placeholder="如：3.5km, 30min"
        />
      </div>
      
      <div class="form-group">
        <label for="weight">体重 (kg)</label>
        <input 
          type="number" 
          id="weight" 
          v-model.number="formData.weight" 
          step="0.1"
          min="0"
          placeholder="请输入体重"
        />
      </div>
      
      <div class="form-group">
        <label for="completed">完成状态</label>
        <input type="checkbox" id="completed" v-model="formData.completed" />
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="cancel">取消</button>
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? '保存' : '添加' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';

export default {
  name: 'TrainingForm',
  props: {
    trainingTypes: {
      type: Array,
      required: true
    },
    record: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    // 表单数据
    const formData = ref({
      date: dayjs().format('YYYY-MM-DD'),
      type: '',
      detail: '',
      weight: null,
      completed: true
    });
    
    // 是否为编辑模式
    const isEditing = computed(() => !!props.record);
    
    // 初始化表单数据
    onMounted(() => {
      if (isEditing.value) {
        formData.value = { ...props.record };
      }
    });
    
    /**
     * 根据训练类型自动补充单位
     * @param {string} type 训练类型
     * @param {string} detail 训练详情
     * @returns {string} 补充单位后的训练详情
     */
    const addUnitByType = (type, detail) => {
      if (!detail) return detail;
      
      // 检查是否已经包含单位
      const hasUnit = /[a-zA-Z]/.test(detail);
      if (hasUnit) return detail;
      
      // 根据训练类型补充单位
      switch (type) {
        case 'running':
          return detail + 'km';
        case 'strength':
          return detail + 'min';
        case 'rest':
        default:
          return detail;
      }
    };
    
    // 验证表单数据
    const validateForm = () => {
      const { date, type, weight } = formData.value;
      
      if (!date) {
        alert('请选择日期');
        return false;
      }
      
      if (!type) {
        alert('请选择训练类型');
        return false;
      }
      
      if (weight !== null && weight !== undefined) {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
          alert('请输入有效的体重（1-300kg）');
          return false;
        }
      }
      
      return true;
    };
    
    // 处理表单提交
    const handleSubmit = () => {
      if (!validateForm()) return;
      
      const formDataWithUnit = {
        ...formData.value,
        detail: addUnitByType(formData.value.type, formData.value.detail)
      };
      emit('submit', formDataWithUnit);
    };
    
    // 取消操作
    const cancel = () => {
      emit('cancel');
    };
    
    return {
      formData,
      isEditing,
      handleSubmit,
      cancel
    };
  }
};
</script>

<style scoped>
.training-form {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
}

h2 {
  margin-top: 0;
  color: #003153; /* 普鲁士蓝 - 主色 */
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #003153; /* 普鲁士蓝 - 主色 */
}

input[type="text"],
input[type="date"],
input[type="number"],
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
  background-color: #f8f9fa; /* 淡灰色背景 */
}

input[type="text"]:focus,
input[type="date"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #003153; /* 普鲁士蓝 - 主色 */
  box-shadow: 0 0 0 2px rgba(0, 49, 83, 0.1);
}

input[type="checkbox"] {
  margin-right: 5px;
  accent-color: #003153; /* 普鲁士蓝 - 主色 */
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-primary {
  background: #003153; /* 普鲁士蓝 - 主色 */
  color: white;
}

.btn-secondary {
  background: #f5b70a; /* 范思哲黄 - 副色 */
  color: #003153; /* 普鲁士蓝 - 主色 */
}

.btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn:active {
  transform: translateY(0);
}
</style>