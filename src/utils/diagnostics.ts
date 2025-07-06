// 页面诊断工具
export class PageDiagnostics {
  private static instance: PageDiagnostics;
  private diagnosticResults: Record<string, any> = {};

  static getInstance(): PageDiagnostics {
    if (!PageDiagnostics.instance) {
      PageDiagnostics.instance = new PageDiagnostics();
    }
    return PageDiagnostics.instance;
  }

  // 检查页面加载状态
  checkPageLoadStatus(): void {
    console.group('🔍 页面加载状态检查');
    
    // 检查DOM状态
    const domState = {
      readyState: document.readyState,
      hasRoot: !!document.getElementById('root'),
      bodyChildren: document.body.children.length,
      headChildren: document.head.children.length
    };
    
    console.log('📄 DOM状态:', domState);
    this.diagnosticResults.domState = domState;

    // 检查资源加载
    this.checkResourceLoading();
    
    // 检查控制台错误
    this.checkConsoleErrors();
    
    console.groupEnd();
  }

  // 检查资源加载状态
  private checkResourceLoading(): void {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const resourceStatus = {
      scripts: scripts.map(script => ({
        src: (script as HTMLScriptElement).src,
        loaded: (script as HTMLScriptElement).type === 'module' ? true : (script as HTMLScriptElement).readyState === 'complete'
      })),
      stylesheets: stylesheets.map(link => ({
        href: (link as HTMLLinkElement).href,
        loaded: (link as HTMLLinkElement).sheet !== null
      }))
    };
    
    console.log('📦 资源加载状态:', resourceStatus);
    this.diagnosticResults.resourceStatus = resourceStatus;
  }

  // 检查控制台错误
  private checkConsoleErrors(): void {
    // 重写console.error来捕获错误
    const originalError = console.error;
    const errors: string[] = [];
    
    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // 监听未捕获的错误
    window.addEventListener('error', (event) => {
      errors.push(`未捕获错误: ${event.message} at ${event.filename}:${event.lineno}`);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      errors.push(`未处理的Promise拒绝: ${event.reason}`);
    });
    
    this.diagnosticResults.errors = errors;
  }

  // 检查React组件渲染
  checkReactRendering(): void {
    console.group('⚛️ React渲染检查');
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('❌ 未找到root元素');
      return;
    }
    
    const reactInfo = {
      hasReactRoot: rootElement.hasChildNodes(),
      childrenCount: rootElement.children.length,
      innerHTML: rootElement.innerHTML.substring(0, 200) + '...',
      reactFiberNode: (rootElement as any)._reactInternalFiber || (rootElement as any).__reactInternalInstance
    };
    
    console.log('⚛️ React状态:', reactInfo);
    this.diagnosticResults.reactInfo = reactInfo;
    
    console.groupEnd();
  }

  // 检查路由状态
  checkRouterStatus(): void {
    console.group('🛣️ 路由状态检查');
    
    const routerInfo = {
      currentPath: window.location.pathname,
      currentHash: window.location.hash,
      currentSearch: window.location.search,
      historyLength: window.history.length
    };
    
    console.log('🛣️ 路由信息:', routerInfo);
    this.diagnosticResults.routerInfo = routerInfo;
    
    console.groupEnd();
  }

  // 检查认证状态
  checkAuthStatus(): void {
    console.group('🔐 认证状态检查');
    
    const authInfo = {
      hasAccessToken: !!localStorage.getItem('accessToken'),
      hasCurrentUser: !!localStorage.getItem('currentUser'),
      localStorageKeys: Object.keys(localStorage),
      sessionStorageKeys: Object.keys(sessionStorage)
    };
    
    console.log('🔐 认证信息:', authInfo);
    this.diagnosticResults.authInfo = authInfo;
    
    console.groupEnd();
  }

  // 检查网络请求
  async checkNetworkRequests(): Promise<void> {
    console.group('🌐 网络请求检查');
    
    try {
      // 测试基本的网络连接
      const testResponse = await fetch('/vite.svg', { method: 'HEAD' });
      console.log('✅ 基本网络连接正常:', testResponse.status);
      
      // 测试API连接
      try {
        const apiResponse = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            'Accept': '*/*'
          }
        });
        console.log('🔗 API连接状态:', apiResponse.status);
      } catch (apiError) {
        console.warn('⚠️ API连接失败:', apiError);
      }
      
    } catch (error) {
      console.error('❌ 网络连接失败:', error);
    }
    
    console.groupEnd();
  }

  // 生成完整诊断报告
  generateReport(): void {
    console.group('📊 完整诊断报告');
    console.log('诊断结果:', this.diagnosticResults);
    
    // 分析可能的问题
    this.analyzeIssues();
    
    console.groupEnd();
  }

  // 分析可能的问题
  private analyzeIssues(): void {
    const issues: string[] = [];
    
    // 检查DOM问题
    if (!this.diagnosticResults.domState?.hasRoot) {
      issues.push('❌ 缺少root元素');
    }
    
    // 检查React渲染问题
    if (!this.diagnosticResults.reactInfo?.hasReactRoot) {
      issues.push('❌ React组件未正确渲染');
    }
    
    // 检查资源加载问题
    const failedScripts = this.diagnosticResults.resourceStatus?.scripts?.filter(s => !s.loaded);
    if (failedScripts?.length > 0) {
      issues.push(`❌ ${failedScripts.length}个脚本未加载`);
    }
    
    // 检查错误
    if (this.diagnosticResults.errors?.length > 0) {
      issues.push(`❌ 发现${this.diagnosticResults.errors.length}个错误`);
    }
    
    if (issues.length === 0) {
      console.log('✅ 未发现明显问题');
    } else {
      console.error('🚨 发现的问题:', issues);
    }
  }
}

// 自动诊断函数
export const runPageDiagnostics = async (): Promise<void> => {
  const diagnostics = PageDiagnostics.getInstance();
  
  console.log('🔍 开始页面诊断...');
  
  diagnostics.checkPageLoadStatus();
  diagnostics.checkReactRendering();
  diagnostics.checkRouterStatus();
  diagnostics.checkAuthStatus();
  await diagnostics.checkNetworkRequests();
  diagnostics.generateReport();
  
  console.log('✅ 诊断完成');
};