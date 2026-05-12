import { ref, computed, onMounted } from 'vue';
import { saveRecords, getRecords } from '../utils/storage';
import dayjs from 'dayjs';

/**
 * 训练记录逻辑
 */
export function useTraining() {
  // 训练记录
  const records = ref([]);
  // 所有训练记录（用于分页）
  const allRecords = ref([]);
  // 训练类型
  const trainingTypes = ref([
    { value: 'running', label: '跑步', emoji: '🏃🏻' },
    { value: 'strength', label: '力量', emoji: '💪🏻' },
    { value: 'rest', label: '休息', emoji: '😴' }
  ]);
  // 加载状态
  const isLoading = ref(false);
  // 是否有更多数据
  const hasMore = ref(true);
  // 当前页码
  const currentPage = ref(1);
  // 每页记录数
  const pageSize = 50;

  // 加载训练记录
  const loadRecords = () => {
    isLoading.value = true;
    try {
      const storedRecords = getRecords();
      if (storedRecords && storedRecords.length > 0) {
        // 按日期倒序排序，最新的记录排在前面
        allRecords.value = storedRecords.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        // 加载第一页数据
        loadPage(1);
      } else {
        allRecords.value = [];
        records.value = [];
        hasMore.value = false;
      }
    } catch (error) {
      console.error('加载训练记录失败:', error);
      allRecords.value = [];
      records.value = [];
      hasMore.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  // 加载指定页的数据
  const loadPage = (page) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageRecords = allRecords.value.slice(startIndex, endIndex);
    
    if (page === 1) {
      // 第一页，替换所有记录
      records.value = pageRecords;
    } else {
      // 后续页，追加记录
      records.value = [...records.value, ...pageRecords];
    }
    
    // 更新当前页码
    currentPage.value = page;
    // 检查是否还有更多数据
    hasMore.value = endIndex < allRecords.value.length;
  };

  // 加载更多记录
  const loadMoreRecords = () => {
    if (isLoading.value || !hasMore.value) return;
    
    isLoading.value = true;
    // 模拟加载延迟
    setTimeout(() => {
      loadPage(currentPage.value + 1);
      isLoading.value = false;
    }, 500);
  };

  // 验证记录数据
  const validateRecord = (record) => {
    if (!record || typeof record !== 'object') {
      throw new Error('无效的记录数据');
    }
    
    if (!record.date || !dayjs(record.date).isValid()) {
      throw new Error('无效的日期格式');
    }
    
    if (!record.type) {
      throw new Error('请选择训练类型');
    }
    
    const validTypes = trainingTypes.value.map(t => t.value);
    if (!validTypes.includes(record.type)) {
      throw new Error('无效的训练类型');
    }
    
    if (record.weight !== null && record.weight !== undefined) {
      const weight = parseFloat(record.weight);
      if (isNaN(weight) || weight <= 0 || weight > 300) {
        throw new Error('体重必须在1-300kg之间');
      }
    }
    
    return true;
  };
  
  // 添加训练记录
  const addTrainingRecord = (record) => {
    try {
      validateRecord(record);
      
      const newRecord = {
        id: `record-${Date.now()}`,
        ...record
      };
      allRecords.value.push(newRecord);
      allRecords.value.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      saveRecords(allRecords.value);
      loadPage(1);
    } catch (error) {
      console.error('添加记录失败:', error.message);
      alert(error.message);
    }
  };

  // 编辑训练记录
  const editTrainingRecord = (id, updatedRecord) => {
    try {
      const index = allRecords.value.findIndex(record => record.id === id);
      if (index === -1) {
        throw new Error('找不到要编辑的记录');
      }
      
      const existingRecord = allRecords.value[index];
      const mergedRecord = { ...existingRecord, ...updatedRecord };
      
      validateRecord(mergedRecord);
      
      allRecords.value[index] = mergedRecord;
      allRecords.value.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      saveRecords(allRecords.value);
      loadPage(1);
    } catch (error) {
      console.error('编辑记录失败:', error.message);
      alert(error.message);
    }
  };

  // 删除训练记录
  const deleteTrainingRecord = (id) => {
    allRecords.value = allRecords.value.filter(record => record.id !== id);
    // 保存到本地存储
    saveRecords(allRecords.value);
    // 重新加载当前页
    loadPage(1);
  };

  // 获取体重数据（按年月）
  const getWeightData = (year, month) => {
    try {
      // 确保 year 和 month 是数字
      const targetYear = parseInt(year, 10);
      const targetMonth = parseInt(month, 10);
      
      if (isNaN(targetYear) || isNaN(targetMonth)) {
        return { dates: [], weights: [] };
      }
      
      const filteredRecords = allRecords.value.filter(record => {
        try {
          if (!record.date || !record.weight) return false;
          const recordDate = dayjs(record.date);
          return recordDate.year() === targetYear && recordDate.month() + 1 === targetMonth;
        } catch (error) {
          return false;
        }
      });

      // 按日期排序
      filteredRecords.sort((a, b) => {
        try {
          return new Date(a.date) - new Date(b.date);
        } catch (error) {
          return 0;
        }
      });

      // 提取日期和体重
      const dates = filteredRecords.map(record => record.date);
      const weights = filteredRecords.map(record => parseFloat(record.weight) || 0);

      return { dates, weights };
    } catch (error) {
      console.error('获取体重数据失败:', error);
      return { dates: [], weights: [] };
    }
  };

  // 初始化加载记录
  loadRecords();

  return {
    records,
    trainingTypes,
    isLoading,
    hasMore,
    addTrainingRecord,
    editTrainingRecord,
    deleteTrainingRecord,
    loadMoreRecords,
    getWeightData
  };
}
