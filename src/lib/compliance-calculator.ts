// PPWR 合规检查计算器

import {
  MATERIAL_RULES,
  PACKAGING_TYPES,
  COMPLIANCE_CHECKS,
  getMaterialById,
  getPackagingTypeById,
  calculateVoidSpace,
  calculatePackagingVolume,
  assessMinimization
} from './ppwr-rules';

export interface ProductData {
  // 产品信息
  productName: string;
  productCategory: string;
  
  // 包装信息
  packagingType: string;
  material: string;
  secondaryMaterial?: string;
  
  // 尺寸信息 (mm)
  packagingLength: number;
  packagingWidth: number;
  packagingHeight: number;
  
  // 产品信息
  productVolume?: number; // cm³
  productWeight?: number; // g
  packagingWeight?: number; // g
  
  // 材质属性
  recycledContentPercent?: number;
  pfasContentPpm?: number;
  compostable?: boolean;
  
  // 过度包装检查
  hasDoubleWall?: boolean;
  hasFalseBottom?: boolean;
  hasMisleadingDesign?: boolean;
  
  // 填充材料
  usesFillerMaterial?: boolean;
  fillerMaterialType?: string;
  
  // 其他
  targetMarket: string[]; // 目标欧盟国家
  exportDate?: string; // 预计出口日期
}

export interface CheckResult {
  checkId: string;
  checkName: string;
  passed: boolean;
  severity: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  effectiveDate: string;
  article?: string;
}

export interface ComplianceReport {
  productId: string;
  productName: string;
  checkDate: string;
  overallStatus: 'compliant' | 'warning' | 'non_compliant';
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  results: CheckResult[];
  recommendations: string[];
  materialInfo?: {
    name: string;
    category: string;
    recyclabilityGrade?: string;
    recyclable: boolean;
  };
  packagingInfo?: {
    name: string;
    category: string;
    drsRequired?: boolean;
  };
  voidSpacePercent?: number;
  voidSpaceCompliant?: boolean;
  minimizationAssessment?: {
    passed: boolean;
    issues: string[];
    recommendations: string[];
  };
  overpackagingDetected?: boolean;
}

export function runComplianceCheck(data: ProductData): ComplianceReport {
  const results: CheckResult[] = [];
  const recommendations: string[] = [];
  
  // 获取材质和包装类型信息
  const material = getMaterialById(data.material);
  const packagingType = getPackagingTypeById(data.packagingType);
  
  // 计算包装体积和空隙率
  const packagingVolume = calculatePackagingVolume(
    data.packagingLength,
    data.packagingWidth,
    data.packagingHeight
  );
  const voidSpacePercent = data.productVolume 
    ? calculateVoidSpace(data.productVolume, packagingVolume)
    : undefined;
  
  // 评估包装最小化
  const minimizationAssessment = assessMinimization({
    packagingWeight: data.packagingWeight,
    productWeight: data.productWeight,
    hasUnnecessaryLayers: data.hasMisleadingDesign,
    hasExcessivePadding: data.usesFillerMaterial,
    usesRightSizedBox: voidSpacePercent !== undefined && voidSpacePercent <= 50
  });
  
  // 准备检查数据
  const checkData: any = {
    ...data,
    materialCategory: material?.category,
    recyclabilityGrade: material?.recyclabilityGrade,
    minRecycledContent2030: material?.minRecycledContent2030,
    drsRequired: packagingType?.drsRequired || data.packagingType.includes('beverage'),
    voidSpacePercent,
    packagingCategory: packagingType?.category,
    pfasFree: material?.pfasFree,
    compostable: data.compostable || material?.compostable,
    hasMinimization: minimizationAssessment.passed
  };
  
  // 运行所有合规检查
  for (const check of COMPLIANCE_CHECKS) {
    try {
      const result = check.check(checkData);
      results.push({
        checkId: check.id,
        checkName: check.name,
        ...result,
        effectiveDate: check.effectiveDate,
        article: check.article
      });
      
      // 收集建议
      if (!result.passed) {
        if (result.severity === 'high') {
          recommendations.push(`❗ [紧急] ${check.name}: ${result.message}`);
          if (result.action) {
            recommendations.push(`   → ${result.action}`);
          }
        } else if (result.severity === 'medium') {
          recommendations.push(`⚠️ [注意] ${check.name}: ${result.message}`);
          if (result.action) {
            recommendations.push(`   → ${result.action}`);
          }
        }
      }
    } catch (error) {
      results.push({
        checkId: check.id,
        checkName: check.name,
        passed: false,
        severity: 'medium',
        message: `检查失败：${error instanceof Error ? error.message : '未知错误'}`,
        effectiveDate: check.effectiveDate,
        article: check.article
      });
    }
  }
  
  // 添加材质特定建议
  if (material) {
    if (!material.recyclable) {
      recommendations.push(`💡 建议：${material.name}不可回收，考虑改用可回收材质`);
      material.restrictions.forEach(r => {
        recommendations.push(`   → ${r}`);
      });
    }
    if (material.minRecycledContent2030 && !data.recycledContentPercent) {
      recommendations.push(`💡 建议：确认再生料含量 (2030 年起需≥${material.minRecycledContent2030}%)`);
    }
  }
  
  // 添加包装类型特定建议
  if (packagingType) {
    packagingType.restrictions.forEach(r => {
      if (!recommendations.includes(`   → ${r}`)) {
        recommendations.push(`📦 ${packagingType.name}: ${r}`);
      }
    });
  }
  
  // 添加最小化评估建议
  if (!minimizationAssessment.passed) {
    minimizationAssessment.recommendations.forEach(rec => {
      recommendations.push(`♻️ ${rec}`);
    });
  }
  
  // 计算总体状态
  const highRiskCount = results.filter(r => !r.passed && r.severity === 'high').length;
  const mediumRiskCount = results.filter(r => !r.passed && r.severity === 'medium').length;
  const lowRiskCount = results.filter(r => !r.passed && r.severity === 'low').length;
  
  let overallStatus: 'compliant' | 'warning' | 'non_compliant' = 'compliant';
  if (highRiskCount > 0) {
    overallStatus = 'non_compliant';
  } else if (mediumRiskCount > 0) {
    overallStatus = 'warning';
  }
  
  // 检测过度包装
  const overpackagingDetected = data.hasDoubleWall || data.hasFalseBottom || data.hasMisleadingDesign;
  
  return {
    productId: `PPWR-${Date.now()}`,
    productName: data.productName,
    checkDate: new Date().toISOString(),
    overallStatus,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    results,
    recommendations,
    materialInfo: material ? {
      name: material.name,
      category: material.category,
      recyclabilityGrade: material.recyclabilityGrade,
      recyclable: material.recyclable
    } : undefined,
    packagingInfo: packagingType ? {
      name: packagingType.name,
      category: packagingType.category,
      drsRequired: packagingType.drsRequired
    } : undefined,
    voidSpacePercent,
    voidSpaceCompliant: voidSpacePercent !== undefined && voidSpacePercent <= 50,
    minimizationAssessment,
    overpackagingDetected
  };
}

export function getStatusColor(status: 'compliant' | 'warning' | 'non_compliant'): string {
  switch (status) {
    case 'compliant':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'non_compliant':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

export function getStatusText(status: 'compliant' | 'warning' | 'non_compliant'): string {
  switch (status) {
    case 'compliant':
      return '✅ 基本合规';
    case 'warning':
      return '⚠️ 存在风险';
    case 'non_compliant':
      return '❌ 不合规';
  }
}

export function getSeverityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-blue-600 bg-blue-50';
  }
}

export function getSeverityText(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return '高风险';
    case 'medium':
      return '中风险';
    case 'low':
      return '低风险';
  }
}
