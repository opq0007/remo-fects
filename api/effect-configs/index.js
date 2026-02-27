/**
 * 特效配置注册表
 * 
 * 统一管理所有特效的配置，提供配置查询和参数处理功能
 * 新增特效只需在此处注册配置文件即可，无需修改 render.js 和 server.js
 */

const path = require('path');

// 导入所有特效配置
const effectConfigs = {
  'text-rain-effect': require('./text-rain-effect'),
  'text-ring-effect': require('./text-ring-effect'),
  'text-firework-effect': require('./text-firework-effect'),
  'text-breakthrough-effect': require('./text-breakthrough-effect'),
  'tai-chi-bagua-effect': require('./tai-chi-bagua-effect'),
  'text-grow-explode-effect': require('./text-grow-explode-effect')
};

// 导入公共参数处理
const { buildCommonParams } = require('./common-params');

/**
 * 获取所有已注册的特效列表
 * @returns {Array<{id: string, name: string, compositionId: string}>}
 */
function getProjectList() {
  return Object.entries(effectConfigs).map(([id, config]) => ({
    id,
    name: config.config.name,
    compositionId: config.config.compositionId
  }));
}

/**
 * 获取特效配置
 * @param {string} projectId - 特效 ID
 * @returns {Object|null}
 */
function getEffectConfig(projectId) {
  return effectConfigs[projectId] || null;
}

/**
 * 获取特效基础信息
 * @param {string} projectId - 特效 ID
 * @returns {Object|null}
 */
function getProjectInfo(projectId) {
  const config = effectConfigs[projectId];
  if (!config) return null;
  
  return {
    id: projectId,
    name: config.config.name,
    compositionId: config.config.compositionId,
    path: config.config.path
  };
}

/**
 * 验证参数
 * @param {string} projectId - 特效 ID
 * @param {Object} params - 待验证的参数
 * @returns {{ valid: boolean, error?: string }}
 */
function validateParams(projectId, params) {
  const config = effectConfigs[projectId];
  if (!config) {
    return { valid: false, error: `项目不存在: ${projectId}` };
  }
  
  if (config.validate) {
    return config.validate(params);
  }
  
  return { valid: true };
}

/**
 * 构建渲染参数
 * 将请求参数转换为完整的渲染参数
 * 
 * @param {string} projectId - 特效 ID
 * @param {Object} reqParams - 请求参数
 * @param {Object} options - 附加选项
 * @param {string} [options.backgroundFile] - 背景文件名
 * @returns {Object}
 */
function buildRenderParams(projectId, reqParams, options = {}) {
  const config = effectConfigs[projectId];
  if (!config) {
    throw new Error(`项目不存在: ${projectId}`);
  }
  
  // 1. 构建公共参数
  const commonParams = buildCommonParams({
    ...reqParams,
    ...options
  });
  
  // 2. 构建特效特有参数
  let result;
  if (config.buildRenderParams) {
    result = config.buildRenderParams(reqParams, commonParams);
  } else {
    result = { ...commonParams };
    // 如果没有自定义处理器，使用默认参数定义
    for (const [name, def] of Object.entries(config.params || {})) {
      if (reqParams[name] !== undefined && reqParams[name] !== null && reqParams[name] !== '') {
        result[name] = def.parser ? def.parser(reqParams[name]) : reqParams[name];
      } else if (def.defaultValue !== undefined) {
        result[name] = typeof def.defaultValue === 'function' ? def.defaultValue() : def.defaultValue;
      }
    }
  }
  
  // 3. 添加项目元信息
  result.projectId = projectId;
  result.projectPath = config.config.path;
  result.compositionId = config.config.compositionId;
  
  return result;
}

/**
 * 注册新的特效配置
 * 允许动态注册新的特效
 * 
 * @param {string} projectId - 特效 ID
 * @param {Object} config - 特效配置对象
 */
function registerEffect(projectId, config) {
  if (effectConfigs[projectId]) {
    console.warn(`特效 ${projectId} 已存在，将被覆盖`);
  }
  effectConfigs[projectId] = config;
  console.log(`已注册特效: ${projectId}`);
}

/**
 * 获取所有已注册的特效 ID
 * @returns {string[]}
 */
function getRegisteredEffectIds() {
  return Object.keys(effectConfigs);
}

/**
 * 检查特效是否已注册
 * @param {string} projectId - 特效 ID
 * @returns {boolean}
 */
function hasEffect(projectId) {
  return projectId in effectConfigs;
}

module.exports = {
  effectConfigs,
  getProjectList,
  getEffectConfig,
  getProjectInfo,
  validateParams,
  buildRenderParams,
  registerEffect,
  getRegisteredEffectIds,
  hasEffect
};
