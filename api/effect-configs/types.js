/**
 * 特效配置类型定义
 * 
 * 定义特效参数处理的核心类型和接口
 */

/**
 * 参数定义
 * @typedef {Object} ParamDefinition
 * @property {string} type - 参数类型：'string' | 'number' | 'boolean' | 'object' | 'array'
 * @property {*} defaultValue - 默认值
 * @property {Function} [parser] - 自定义解析函数
 * @property {Function} [validator] - 自定义验证函数
 * @property {string} [description] - 参数描述
 * @property {boolean} [required] - 是否必填
 */

/**
 * 特效配置
 * @typedef {Object} EffectConfig
 * @property {string} id - 特效 ID
 * @property {string} name - 特效名称
 * @property {string} compositionId - Remotion 组合 ID
 * @property {string} path - 特效项目路径
 * @property {Object.<string, ParamDefinition>} params - 参数定义映射
 * @property {Function} [customProcessor] - 自定义参数处理函数
 * @property {Function} [validator] - 自定义验证函数
 * @property {Function} [durationCalculator] - 时长计算函数
 */

module.exports = {};
