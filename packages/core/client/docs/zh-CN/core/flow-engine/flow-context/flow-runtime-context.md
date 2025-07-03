# FlowRuntimeContext

`FlowRuntimeContext` 是流引擎在每次执行流（Flow）时创建的运行时上下文对象。它贯穿整个流执行周期，负责管理流程级别的数据、状态、步骤结果和日志等。通过 `ctx`，可以在各个步骤中访问和操作本次流程实例的上下文，实现流程控制、数据传递和复杂业务编排。

---

## 生命周期与作用范围

- 每次通过 `model.applyFlow('flowKey', inputArgs)` 或 `model.dispatchEvent('eventName', inputArgs)` 执行流时，都会创建一个新的 `FlowRuntimeContext`。
- 该 context 仅在本次流执行的生命周期内有效，流执行结束后自动销毁。
- 在整个流的所有步骤中，`FlowRuntimeContext` 保持唯一，负责流程级别的数据、状态和共享变量。

---

## 主要属性与方法

| 属性/方法         | 说明                                                                                  |
|------------------|---------------------------------------------------------------------------------------|
| `ctx.traceId`    | 本次流执行的唯一标识，便于日志追踪和问题排查。                                         |
| `ctx.flowKey`    | 当前执行的流程 key。                                                                   |
| `ctx.app`        | 当前应用实例，可用于访问应用级别的服务和资源。                                         |
| `ctx.engine`     | 当前 flowEngine 实例，流引擎的核心对象。                                               |
| `ctx.model`      | 当前流关联的数据模型实例，通常用于在流步骤中访问和操作业务数据。                        |
| `ctx.exit()`     | 立即终止整个流的执行，后续步骤不再执行。适用于遇到致命错误或业务条件不满足时主动中断流。|
| `ctx.logger`     | 日志记录工具，支持 `info`、`warn`、`error`、`debug` 等方法。用于输出调试信息和业务日志。|
| `ctx.steps`      | 存储每个步骤的详细信息，结构为 `{ 步骤名: { params, uiSchema, result } }`。             |
| `ctx.currentStep`| 当前正在执行的步骤对象，包含 stepKey、params、uiSchema、result 等。                    |
| `ctx.inputArgs`  | 流入口参数，执行 flow 时传入的参数对象。                                               |

---

## 常见场景示例

### 1. 终止流

当遇到不可恢复的错误或业务条件不满足时，可调用 `ctx.exit()` 立即终止流。

```ts
async handler(ctx, params) {
  if (params.shouldExit) {
    ctx.exit();
  }
  // ...其他逻辑...
}
```

### 2. 访问步骤参数、结果和 UI 配置

通过 `ctx.steps` 可以方便地获取任意步骤的参数、结果和 uiSchema，实现步骤间的数据依赖和 UI 组合。

```ts
// 访问 step1 的参数、uiSchema 和结果
const { params, uiSchema, result } = ctx.steps.step1;
```

### 3. 访问当前步骤

在 handler 或 UI 层可直接访问当前步骤的上下文：

```ts
const { stepKey, params, uiSchema, result } = ctx.currentStep;
```

### 4. 日志记录示例

日志记录有助于流调试和问题追踪。推荐在关键步骤、异常处理等场景下使用。

```ts
ctx.logger.info('步骤开始', { step: ctx.currentStep.stepKey, params: ctx.currentStep.params });
ctx.logger.error('发生错误', error);
```

### 5. 在 uiSchema 组件中使用

```ts
import { useFlowRuntimeContext } from '@nocobase/flow-engine';

function MyComponent() {
  const ctx = useFlowRuntimeContext();
  // 现在可以访问 ctx.steps, ctx.currentStep, ctx.inputArgs, ctx.exit() 等
  const { params, uiSchema, result } = ctx.currentStep;
}
```
