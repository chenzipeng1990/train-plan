<template>
  <div class="training-list" ref="listContainer">
    <div v-if="records.length === 0" class="empty-state">
      <p>暂无训练记录</p>
    </div>
    <ul v-else class="record-list">
      <li 
        v-for="record in records" 
        :key="record.id" 
        class="record-item"
        @click="handleItemClick(record)"
        @mousedown="startLongPress(record)"
        @mouseup="cancelLongPress"
        @mouseleave="cancelLongPress"
        @touchstart="startLongPress(record)"
        @touchend="cancelLongPress"
        @touchcancel="cancelLongPress"
      >
        <div class="record-content">
          <div class="record-row">
            <span class="record-status" :class="{ completed: record.completed }">
              {{ record.completed ? '✅' : '❌' }}
            </span>
            <span class="record-date">{{ formatDate(record.date) }}</span>
            <span class="record-type">
              {{ getTypeEmoji(record.type) }}
            </span>
            <span class="record-info">
              {{ record.detail || getTypeLabel(record.type) }}
            </span>
            <span v-if="record.weight" class="record-weight">{{ record.weight }}kg</span>
          </div>
        </div>
      </li>
      <li v-if="isLoading" class="loading-item">
        <p>加载中...</p>
      </li>
      <li v-else-if="!hasMore && records.length > 0" class="end-item">
        <p>没有更多记录了</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, onUpdated } from 'vue';
import dayjs from 'dayjs';

export default {
  name: 'TrainingList',
  props: {
    records: {
      type: Array,
      required: true
    },
    trainingTypes: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: true
    }
  },
  emits: ['delete', 'loadMore'],
  setup(props, { emit }) {
    const listContainer = ref(null);
    const longPressTimer = ref(null);
    
    // 调整列表容器高度
    const adjustListHeight = () => {
      if (!listContainer.value) return;
      
      // 获取窗口高度
      const windowHeight = window.innerHeight;
      // 获取头部高度
      const headerHeight = document.querySelector('.app-header')?.offsetHeight || 100;
      // 获取底部栏高度
      const footerHeight = document.querySelector('.app-footer')?.offsetHeight || 60;
      // 获取表单高度（如果存在）
      const formHeight = document.querySelector('.training-form')?.offsetHeight || 0;
      // 获取添加按钮高度（如果存在）
      const addBtnHeight = document.querySelector('.add-btn')?.offsetHeight || 0;
      
      // 计算可用高度
      const availableHeight = windowHeight - headerHeight - footerHeight - formHeight - addBtnHeight - 40; // 40px 是其他边距和间距
      
      // 设置列表容器高度
      listContainer.value.style.maxHeight = `${Math.max(200, availableHeight)}px`;
    };
    
    /**
     * 滚动事件处理
     */
    const handleScroll = () => {
      if (!listContainer.value) return;
      
      const { scrollTop, scrollHeight, clientHeight } = listContainer.value;
      // 当滚动到距离底部100px时加载更多
      if (scrollHeight - scrollTop - clientHeight < 100 && !props.isLoading && props.hasMore) {
        emit('loadMore');
      }
    };
    
    /**
     * 开始长按
     * @param {Object} record 训练记录
     */
    const startLongPress = (record) => {
      longPressTimer.value = setTimeout(() => {
        if (confirm('确定要删除这条记录吗？')) {
          emit('delete', record.id);
        }
      }, 800);
    };
    
    /**
     * 取消长按
     */
    const cancelLongPress = () => {
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
        longPressTimer.value = null;
      }
    };
    
    /**
     * 处理项目点击
     * @param {Object} record 训练记录
     */
    const handleItemClick = (record) => {
      // 这里可以添加点击事件处理逻辑，例如查看详情
    };
    
    /**
     * 格式化日期，不显示年份
     * @param {string} dateStr 日期字符串
     * @returns {string} 格式化后的日期
     */
    const formatDate = (dateStr) => {
      return dayjs(dateStr).format('MM-DD');
    };
    
    /**
     * 获取训练类型的emoji
     * @param {string} type 训练类型
     * @returns {string} emoji
     */
    const getTypeEmoji = (type) => {
      const trainingType = props.trainingTypes.find(t => t.value === type);
      return trainingType ? trainingType.emoji : '';
    };
    
    /**
     * 获取训练类型的标签
     * @param {string} type 训练类型
     * @returns {string} 标签
     */
    const getTypeLabel = (type) => {
      const trainingType = props.trainingTypes.find(t => t.value === type);
      return trainingType ? trainingType.label : '';
    };
    
    // 生命周期钩子
    onMounted(() => {
      if (listContainer.value) {
        listContainer.value.addEventListener('scroll', handleScroll);
      }
      // 初始调整高度
      adjustListHeight();
      // 监听窗口大小变化
      window.addEventListener('resize', adjustListHeight);
    });
    
    onUpdated(() => {
      // 当记录更新时，重新调整高度
      adjustListHeight();
    });
    
    onUnmounted(() => {
      if (listContainer.value) {
        listContainer.value.removeEventListener('scroll', handleScroll);
      }
      if (longPressTimer.value) {
        clearTimeout(longPressTimer.value);
      }
      // 移除窗口大小变化监听
      window.removeEventListener('resize', adjustListHeight);
    });
    
    return {
      listContainer,
      getTypeEmoji,
      getTypeLabel,
      startLongPress,
      cancelLongPress,
      handleItemClick,
      formatDate
    };
  }
};
</script>

<style scoped>
.training-list {
  margin-bottom: 20px;
  overflow-y: auto;
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  border-radius: 8px;
  padding: 10px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  /* 高度会通过JavaScript动态设置 */
  min-height: 200px;
}

.empty-state {
  background: #f8f9fa; /* 淡灰色背景 */
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  color: #003153; /* 普鲁士蓝 - 主色 */
  border: 1px dashed #f5b70a; /* 范思哲黄 - 副色 */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.record-item {
  padding: 12px;
  border-bottom: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #f8f9fa; /* 淡灰色背景 */
}

.record-item:hover {
  background-color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.record-content {
  width: 100%;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.record-status {
  font-size: 16px;
  flex-shrink: 0;
}

.record-date {
  font-weight: bold;
  color: #003153; /* 普鲁士蓝 - 主色 */
  flex-shrink: 0;
  min-width: 60px;
}

.record-type {
  font-size: 18px;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
  color: #003153; /* 普鲁士蓝 - 主色 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.record-weight {
  font-weight: bold;
  color: #f5b70a; /* 范思哲黄 - 副色 */
  flex-shrink: 0;
  min-width: 60px;
  background: #003153; /* 普鲁士蓝 - 主色 */
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 14px;
}

.loading-item,
.end-item {
  text-align: center;
  padding: 10px;
  color: #003153; /* 普鲁士蓝 - 主色 */
  font-style: italic;
  font-weight: 500;
}

/* 滚动条样式 */
.training-list::-webkit-scrollbar {
  width: 8px;
}

.training-list::-webkit-scrollbar-track {
  background: #f8f9fa; /* 淡灰色背景 */
  border-radius: 4px;
}

.training-list::-webkit-scrollbar-thumb {
  background: #f5b70a; /* 范思哲黄 - 副色 */
  border-radius: 4px;
}

.training-list::-webkit-scrollbar-thumb:hover {
  background: #003153; /* 普鲁士蓝 - 主色 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .record-row {
    gap: 8px;
  }
  
  .record-date {
    min-width: 50px;
  }
  
  .record-weight {
    min-width: 50px;
    padding: 2px 6px;
    font-size: 12px;
  }
}
</style>