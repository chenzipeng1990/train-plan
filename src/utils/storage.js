/**
 * 本地存储工具
 * 用于处理训练记录的本地存储
 */

const STORAGE_KEY = 'training-records';

/**
 * 获取所有训练记录
 * @param {number} page 页码（从1开始）
 * @param {number} pageSize 每页数量
 * @returns {Array} 训练记录数组
 */
export const getRecords = (page = 1, pageSize = 100) => {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    const allRecords = records ? JSON.parse(records) : [];
    
    // 如果不需要分页，直接返回所有记录
    if (!page || !pageSize) {
      return allRecords;
    }
    
    // 计算分页索引
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return allRecords.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error getting records from localStorage:', error);
    return [];
  }
};

/**
 * 保存训练记录
 * @param {Array} records 训练记录数组
 */
export const saveRecords = (records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving records to localStorage:', error);
  }
};

/**
 * 添加训练记录
 * @param {Object} record 训练记录
 * @returns {Array} 更新后的训练记录数组
 */
export const addRecord = (record) => {
  const records = getRecords();
  records.unshift(record);
  saveRecords(records);
  return records;
};

/**
 * 更新训练记录
 * @param {string} id 记录ID
 * @param {Object} updates 更新内容
 * @returns {Array} 更新后的训练记录数组
 */
export const updateRecord = (id, updates) => {
  const records = getRecords();
  const index = records.findIndex(record => record.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveRecords(records);
  }
  return records;
};

/**
 * 删除训练记录
 * @param {string} id 记录ID
 * @returns {Array} 更新后的训练记录数组
 */
export const deleteRecord = (id) => {
  const records = getRecords();
  const filteredRecords = records.filter(record => record.id !== id);
  saveRecords(filteredRecords);
  return filteredRecords;
};

/**
 * 按日期获取训练记录
 * @param {string} date 日期，格式：YYYY-MM-DD
 * @returns {Array} 当天的训练记录
 */
export const getRecordsByDate = (date) => {
  const records = getRecords();
  return records.filter(record => record.date === date);
};

/**
 * 获取指定月份的训练记录
 * @param {number} year 年份
 * @param {number} month 月份（1-12）
 * @returns {Array} 当月的训练记录
 */
export const getRecordsByMonth = (year, month) => {
  const records = getRecords();
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
  });
};

/**
 * 获取训练记录总数
 * @returns {number} 记录总数
 */
export const getRecordsCount = () => {
  try {
    const records = localStorage.getItem(STORAGE_KEY);
    const allRecords = records ? JSON.parse(records) : [];
    return allRecords.length;
  } catch (error) {
    console.error('Error getting records count from localStorage:', error);
    return 0;
  }
};