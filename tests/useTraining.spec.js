import { describe, it, expect, vi, beforeEach } from "vitest";

// 模拟数据存储
let mockRecords = [];

// 模拟 storage 模块
vi.mock("../src/utils/storage", () => {
  return {
    saveRecords: vi.fn((records) => {
      mockRecords = records;
    }),
    getRecords: vi.fn(() => mockRecords),
  };
});

// 模拟 dayjs
vi.mock("dayjs", () => {
  const dayjs = vi.fn((date) => {
    const mockDayjs = {
      year: vi.fn(() => new Date(date).getFullYear()),
      month: vi.fn(() => new Date(date).getMonth()),
      format: vi.fn((format) => {
        const d = new Date(date);
        if (format === "YYYY-MM-DD") {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        }
        return date;
      }),
    };
    return mockDayjs;
  });
  dayjs.year = vi.fn(() => new Date().getFullYear());
  dayjs.month = vi.fn(() => new Date().getMonth());
  return { default: dayjs };
});

// 导入 useTraining
import { useTraining } from "../src/composables/useTraining";

// 导入模拟的 storage 模块
import { getRecords, saveRecords } from "../src/utils/storage";

describe("useTraining", () => {
  beforeEach(() => {
    // 清除所有 mock
    vi.clearAllMocks();
    // 重置模拟数据
    mockRecords = [];
  });

  it("should load records from storage", () => {
    const testRecords = [
      {
        id: "1",
        date: "2026-04-15",
        type: "running",
        detail: "5km",
        weight: 72.5,
        completed: true,
      },
      {
        id: "2",
        date: "2026-04-14",
        type: "strength",
        detail: "30min",
        weight: 72.8,
        completed: true,
      },
    ];

    // 模拟 getRecords 返回值
    getRecords.mockReturnValue(testRecords);

    const { records } = useTraining();

    expect(getRecords).toHaveBeenCalled();
    expect(records.value).toEqual(testRecords);
  });

  it("should sort records by date in descending order", () => {
    const testRecords = [
      {
        id: "1",
        date: "2026-04-14",
        type: "running",
        detail: "5km",
        weight: 72.5,
        completed: true,
      },
      {
        id: "2",
        date: "2026-04-15",
        type: "strength",
        detail: "30min",
        weight: 72.8,
        completed: true,
      },
    ];

    // 模拟 getRecords 返回值
    getRecords.mockReturnValue(testRecords);

    const { records } = useTraining();

    expect(records.value[0].date).toBe("2026-04-15");
    expect(records.value[1].date).toBe("2026-04-14");
  });

  it("should add a new record", () => {
    // 模拟 getRecords 返回空数组
    getRecords.mockReturnValue([]);

    const { addTrainingRecord, records } = useTraining();

    const newRecord = {
      date: "2026-04-16",
      type: "running",
      detail: "6km",
      weight: 72.3,
      completed: true,
    };

    addTrainingRecord(newRecord);

    expect(records.value.length).toBe(1);
    expect(records.value[0].id).toMatch(/record-/);
    expect(records.value[0].date).toBe("2026-04-16");
    expect(saveRecords).toHaveBeenCalled();
  });

  it("should delete a record", () => {
    const testRecords = [
      {
        id: "1",
        date: "2026-04-15",
        type: "running",
        detail: "5km",
        weight: 72.5,
        completed: true,
      },
      {
        id: "2",
        date: "2026-04-14",
        type: "strength",
        detail: "30min",
        weight: 72.8,
        completed: true,
      },
    ];

    // 模拟 getRecords 返回值
    getRecords.mockReturnValue(testRecords);

    const { deleteTrainingRecord, records } = useTraining();

    deleteTrainingRecord("1");

    expect(records.value.length).toBe(1);
    expect(records.value[0].id).toBe("2");
    expect(saveRecords).toHaveBeenCalled();
  });

  it("should get weight data by year and month", () => {
    const testRecords = [
      {
        id: "1",
        date: "2026-04-15",
        type: "running",
        detail: "5km",
        weight: 72.5,
        completed: true,
      },
      {
        id: "2",
        date: "2026-04-14",
        type: "strength",
        detail: "30min",
        weight: 72.8,
        completed: true,
      },
      {
        id: "3",
        date: "2026-03-15",
        type: "running",
        detail: "4km",
        weight: 73.0,
        completed: true,
      },
    ];

    // 模拟 getRecords 返回值
    getRecords.mockReturnValue(testRecords);

    const { getWeightData } = useTraining();

    const { dates, weights } = getWeightData(2026, 4);

    expect(dates).toEqual(["2026-04-14", "2026-04-15"]);
    expect(weights).toEqual([72.8, 72.5]);
  });

  it("should load more records when loadMoreRecords is called", async () => {
    const testRecords = Array.from({ length: 100 }, (_, i) => ({
      id: `record-${i + 1}`,
      date: `2026-04-${String(15 - i).padStart(2, "0")}`,
      type: "running",
      detail: "5km",
      weight: 72.5 + i * 0.1,
      completed: true,
    }));

    // 模拟 getRecords 返回值
    getRecords.mockReturnValue(testRecords);

    const { loadMoreRecords, records, hasMore } = useTraining();

    // 初始加载第一页（50条）
    expect(records.value.length).toBe(50);
    expect(hasMore.value).toBe(true);

    // 模拟加载更多
    await new Promise((resolve) => {
      loadMoreRecords();
      setTimeout(resolve, 600);
    });

    expect(records.value.length).toBe(100);
    expect(hasMore.value).toBe(false);
  });
});
