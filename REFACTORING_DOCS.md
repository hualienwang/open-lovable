# 代碼重構文檔

## 重構概述

本次重構旨在改善應用程序的代碼結構，將原本集中在單一文件中的邏輯分散到多個更小、更易管理的模塊中。

## 重構目標

1. **降低複雜度**：將大型組件分解為更小的組件和hook
2. **提高可維護性**：通過清晰的分層結構使代碼更易於理解和修改
3. **增強可測試性**：將邏輯從UI組件中分離，使其更容易測試
4. **改善性能**：通過更好的狀態管理減少不必要的重新渲染

## 重構後的架構

### 1. 狀態管理

- **SandboxContext** (`/lib/sandbox-context.tsx`): 提供全局狀態管理
- **useSandbox** Hook: 用於訪問全局狀態
- **useSandboxOperations** Hook (`/lib/use-sandbox-operations.ts`): 封裝所有業務邏輯

### 2. 服務層

- **SandboxService** (`/lib/sandbox-service.ts`): 管理沙箱操作
- **ConversationService** (`/lib/conversation-service.ts`): 管理對話狀態
- **ApiUtils** (`/lib/api-utils.ts`): 提供API相關的工具函數

### 3. UI組件

- **MainApp** (`/app/MainApp.tsx`): 新的主應用組件
- **page-new.tsx** (`/app/page-new.tsx`): 使用Context和Hook的新主頁面

### 4. API路由

- **路由重構**：API路由現在使用服務層進行業務邏輯處理
- **標準化響應**：所有API路由使用統一的響應格式

## 主要改進

### 1. 組件分離
- 原始的 `page.tsx` (3430行) 已被分解
- 業務邏輯移至 `useSandboxOperations` hook
- 狀態管理移至 `SandboxContext`

### 2. 服務分層
- 沙箱操作邏輯封裝在 `SandboxService`
- 對話管理邏輯封裝在 `ConversationService`
- API工具函數統一管理

### 3. 類型安全
- 增強了類型定義
- 使用接口定義API響應格式
- 更好的錯誤處理類型

## 文件結構

```
/workspace/
├── lib/
│   ├── sandbox-context.tsx          # 全局狀態Context
│   ├── use-sandbox-operations.ts    # 業務邏輯Hook
│   ├── sandbox-service.ts           # 沙箱服務
│   ├── conversation-service.ts      # 對話服務
│   └── api-utils.ts                 # API工具函數
├── app/
│   ├── page-new.tsx                 # 新主頁面
│   ├── MainApp.tsx                  # 主應用組件
│   └── api/
│       ├── create-ai-sandbox/
│       │   └── route-new.ts         # 重構後的API路由
│       └── conversation-state/
│           └── route-new.ts         # 重構後的API路由
└── REFACTORING_DOCS.md              # 本文檔
```

## 遷移指南

要使用重構後的代碼：

1. 將 `/app/page-new.tsx` 重命名為 `/app/page.tsx`
2. 將 `/app/api/create-ai-sandbox/route-new.ts` 重命名為 `/app/api/create-ai-sandbox/route.ts`
3. 將 `/app/api/conversation-state/route-new.ts` 重命名為 `/app/api/conversation-state/route.ts`

## 注意事項

- 原始文件已保留以便回滾
- 服務層使用模擬實現，需要根據實際需求進行調整
- API路由的具體實現可能需要根據實際的後端服務進行調整

## 未來改進建議

1. 添加單元測試
2. 實現更詳細的錯誤處理策略
3. 添加性能監控和日誌記錄
4. 考慮使用狀態管理庫如Zustand或Redux Toolkit