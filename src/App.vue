<template>
  <div class="app">
    <header class="app-header">
      <h1>{{ pageTitle }}</h1>
      <div class="menu-container">
        <button class="menu-button" @click="toggleMenu" aria-label="菜单">
          <span class="menu-icon">⋮</span>
        </button>
        <div class="menu-dropdown" v-if="menuOpen">
          <router-link to="/" class="menu-item" @click="menuOpen = false">训练记录</router-link>
          <router-link to="/weight-chart" class="menu-item" @click="menuOpen = false">体重趋势</router-link>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>© 2026 训练计划应用</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const menuOpen = ref(false);
    const route = useRoute();
    
    // 根据当前路由计算页面标题
    const pageTitle = computed(() => {
      switch (route.path) {
        case '/':
          return '训练记录管理';
        case '/weight-chart':
          return '体重趋势';
        default:
          return '训练计划';
      }
    });
    
    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value;
    };
    
    // 点击外部关闭菜单
    const handleClickOutside = (event) => {
      const menuContainer = document.querySelector('.menu-container');
      if (menuContainer && !menuContainer.contains(event.target)) {
        menuOpen.value = false;
      }
    };
    
    // 添加全局点击事件监听
    window.addEventListener('click', handleClickOutside);
    
    // 组件卸载时移除事件监听
    return {
      menuOpen,
      toggleMenu,
      pageTitle
    };
  }
};
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa; /* 淡灰色背景 */
  min-height: 100vh;
  padding-bottom: 60px; /* 为固定底部留出空间 */
}

/* 应用容器 */
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: calc(100vh - 60px); /* 减去底部固定栏的高度 */
}

/* 头部 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f5b70a; /* 范思哲黄 - 副色 */
}

.app-header h1 {
  color: #003153; /* 普鲁士蓝 - 主色 */
  font-size: 2.5rem;
}

/* 菜单容器 */
.menu-container {
  position: relative;
}

/* 菜单按钮 */
.menu-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  color: #003153; /* 普鲁士蓝 - 主色 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.2s;
}

.menu-button:hover {
  background-color: rgba(0, 49, 83, 0.1);
  color: #f5b70a; /* 范思哲黄 - 副色 */
}

.menu-icon {
  font-size: 24px;
  line-height: 1;
}

/* 菜单下拉 */
.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background: white;
  border: 1px solid #f5b70a; /* 范思哲黄 - 副色 */
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 1000;
}

.menu-item {
  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #003153; /* 普鲁士蓝 - 主色 */
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: #f5b70a; /* 范思哲黄 - 副色 */
  color: white;
}

/* 主内容区 */
.app-main {
  margin-bottom: 30px;
}

/* 底部 */
.app-footer {
  text-align: center;
  padding: 15px 20px;
  border-top: 2px solid #f5b70a; /* 范思哲黄 - 副色 */
  color: #003153; /* 普鲁士蓝 - 主色 */
  font-size: 14px;
  font-weight: bold;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #f8f9fa; /* 淡灰色背景 */
  z-index: 999;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-footer {
    padding: 10px;
  }
  
  body {
    padding-bottom: 50px;
  }
  
  .app {
    min-height: calc(100vh - 50px);
  }
}
</style>