// PPWR 法规规则库 (Regulation EU 2025/40)
// 最后更新：2026-03-23

export interface MaterialRule {
  id: string;
  name: string;
  category: 'plastic' | 'paper' | 'metal' | 'glass' | 'composite' | 'wood' | 'textile';
  recyclable: boolean;
  recyclabilityGrade?: 'A' | 'B' | 'C' | 'D' | 'E'; // 2030 年起 A/B/C 才允许
  minRecycledContent2030?: number; // 2030 年最低再生含量%
  minRecycledContent2040?: number; // 2040 年最低再生含量%
  pfasFree?: boolean; // 是否需要 PFAS 检测
  compostable?: boolean; // 是否需要可堆肥
  restrictions: string[];
}

export interface PackagingType {
  id: string;
  name: string;
  category: 'primary' | 'secondary' | 'tertiary' | 'beverage';
  drsRequired?: boolean; // 是否需要 DRS 押金系统
  voidSpaceLimit2030?: number; // 2030 年起空余空间限制%
  restrictions: string[];
}

export const MATERIAL_RULES: MaterialRule[] = [
  // 塑料类
  {
    id: 'pet',
    name: 'PET (聚对苯二甲酸乙二醇酯)',
    category: 'plastic',
    recyclable: true,
    recyclabilityGrade: 'A',
    minRecycledContent2030: 30, // 接触敏感类
    minRecycledContent2040: 50,
    pfasFree: true,
    restrictions: ['2030 年起必须含 30% 再生料', '2040 年起必须含 50% 再生料']
  },
  {
    id: 'hdpe',
    name: 'HDPE (高密度聚乙烯)',
    category: 'plastic',
    recyclable: true,
    recyclabilityGrade: 'A',
    minRecycledContent2030: 10,
    minRecycledContent2040: 25,
    pfasFree: true,
    restrictions: ['2030 年起必须含 10% 再生料']
  },
  {
    id: 'ldpe',
    name: 'LDPE (低密度聚乙烯)',
    category: 'plastic',
    recyclable: true,
    recyclabilityGrade: 'B',
    minRecycledContent2030: 10,
    minRecycledContent2040: 25,
    pfasFree: true,
    restrictions: ['2030 年起必须含 10% 再生料']
  },
  {
    id: 'pp',
    name: 'PP (聚丙烯)',
    category: 'plastic',
    recyclable: true,
    recyclabilityGrade: 'B',
    minRecycledContent2030: 10,
    minRecycledContent2040: 25,
    pfasFree: true,
    restrictions: ['2030 年起必须含 10% 再生料']
  },
  {
    id: 'ps',
    name: 'PS (聚苯乙烯)',
    category: 'plastic',
    recyclable: true,
    recyclabilityGrade: 'C',
    minRecycledContent2030: 10,
    minRecycledContent2040: 25,
    pfasFree: true,
    restrictions: ['2030 年起必须含 10% 再生料', '2038 年起禁止使用 (仅 A/B 级允许)']
  },
  {
    id: 'pvc',
    name: 'PVC (聚氯乙烯)',
    category: 'plastic',
    recyclable: false,
    recyclabilityGrade: 'E',
    pfasFree: true,
    restrictions: ['禁止用于食品包装', '2030 年起禁止使用 (不可回收)']
  },
  {
    id: 'pla',
    name: 'PLA (聚乳酸 - 生物塑料)',
    category: 'plastic',
    recyclable: false,
    recyclabilityGrade: 'E',
    compostable: true,
    pfasFree: true,
    restrictions: ['不可与传统塑料混合回收', '需工业堆肥设施', '2030 年起禁止使用']
  },
  
  // 纸类
  {
    id: 'paper_uncoated',
    name: '未涂布纸/纸板',
    category: 'paper',
    recyclable: true,
    recyclabilityGrade: 'A',
    pfasFree: true,
    restrictions: []
  },
  {
    id: 'paper_coated',
    name: '涂布纸/纸板',
    category: 'paper',
    recyclable: true,
    recyclabilityGrade: 'B',
    pfasFree: true,
    restrictions: ['涂层需可分离']
  },
  {
    id: 'paper_waxed',
    name: '蜡纸',
    category: 'paper',
    recyclable: false,
    recyclabilityGrade: 'D',
    restrictions: ['2030 年起禁止使用 (不可回收)']
  },
  {
    id: 'paper_composite',
    name: '纸塑复合材料',
    category: 'composite',
    recyclable: false,
    recyclabilityGrade: 'E',
    restrictions: ['2030 年起禁止使用 (不可回收)', '需改用单一材质']
  },
  
  // 金属类
  {
    id: 'aluminum',
    name: '铝',
    category: 'metal',
    recyclable: true,
    recyclabilityGrade: 'A',
    pfasFree: true,
    restrictions: []
  },
  {
    id: 'steel',
    name: '钢',
    category: 'metal',
    recyclable: true,
    recyclabilityGrade: 'A',
    pfasFree: true,
    restrictions: []
  },
  
  // 玻璃类
  {
    id: 'glass_clear',
    name: '透明玻璃',
    category: 'glass',
    recyclable: true,
    recyclabilityGrade: 'A',
    restrictions: []
  },
  {
    id: 'glass_colored',
    name: '有色玻璃',
    category: 'glass',
    recyclable: true,
    recyclabilityGrade: 'A',
    restrictions: ['需按颜色分类回收']
  },
  
  // 木材类
  {
    id: 'wood',
    name: '木材',
    category: 'wood',
    recyclable: true,
    recyclabilityGrade: 'A',
    restrictions: ['需无化学处理']
  },
  
  // 纺织品类
  {
    id: 'textile_natural',
    name: '天然纤维',
    category: 'textile',
    recyclable: true,
    recyclabilityGrade: 'B',
    restrictions: []
  },
  {
    id: 'textile_synthetic',
    name: '合成纤维',
    category: 'textile',
    recyclable: false,
    recyclabilityGrade: 'D',
    restrictions: ['2030 年起限制使用']
  }
];

export const PACKAGING_TYPES: PackagingType[] = [
  {
    id: 'primary_food',
    name: '食品直接接触包装',
    category: 'primary',
    restrictions: ['需符合食品接触材料法规', '2030 年起需 A/B/C 级可回收']
  },
  {
    id: 'primary_non_food',
    name: '非食品直接接触包装',
    category: 'primary',
    restrictions: ['2030 年起需 A/B/C 级可回收']
  },
  {
    id: 'secondary',
    name: '二级包装 (如彩盒)',
    category: 'secondary',
    voidSpaceLimit2030: 50,
    restrictions: ['2030 年起空余空间≤50%']
  },
  {
    id: 'tertiary',
    name: '运输包装 (如纸箱)',
    category: 'tertiary',
    voidSpaceLimit2030: 50,
    restrictions: ['2030 年起空余空间≤50%']
  },
  {
    id: 'beverage_bottle',
    name: '饮料瓶',
    category: 'beverage',
    drsRequired: true,
    restrictions: ['需符合 DRS 押金回收系统', '2030 年起需含 30% 再生料']
  },
  {
    id: 'beverage_can',
    name: '饮料罐',
    category: 'beverage',
    drsRequired: true,
    restrictions: ['需符合 DRS 押金回收系统']
  },
  {
    id: 'tea_bag',
    name: '茶包/咖啡包',
    category: 'primary',
    restrictions: ['2028 年 2 月起必须可工业堆肥']
  },
  {
    id: 'fruit_label',
    name: '水果/蔬菜标签',
    category: 'primary',
    restrictions: ['2028 年 2 月起必须可工业堆肥']
  }
];

// 合规检查规则
export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  effectiveDate: string; // 生效日期 ISO 格式
  check: (data: any) => { passed: boolean; message: string; severity: 'high' | 'medium' | 'low'; action?: string };
}

export const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    id: 'recyclability_2030',
    name: '2030 可回收性要求',
    description: '2030 年 1 月 1 日起，只有可回收等级 A/B/C 的包装可进入欧盟市场',
    effectiveDate: '2030-01-01',
    check: (data) => {
      const grade = data.recyclabilityGrade;
      if (!grade) return { passed: false, message: '未知可回收等级', severity: 'high' };
      if (['A', 'B', 'C'].includes(grade)) {
        return { passed: true, message: `可回收等级${grade}符合要求`, severity: 'low' };
      }
      return { passed: false, message: `可回收等级${grade}不符合 2030 年要求 (需 A/B/C 级)`, severity: 'high' };
    }
  },
  {
    id: 'recyclability_2038',
    name: '2038 可回收性要求',
    description: '2038 年 1 月 1 日起，只有可回收等级 A/B 的包装可进入欧盟市场',
    effectiveDate: '2038-01-01',
    check: (data) => {
      const grade = data.recyclabilityGrade;
      if (!grade) return { passed: false, message: '未知可回收等级', severity: 'medium' };
      if (['A', 'B'].includes(grade)) {
        return { passed: true, message: `可回收等级${grade}符合 2038 年要求`, severity: 'low' };
      }
      return { passed: false, message: `可回收等级${grade}不符合 2038 年要求 (需 A/B 级)`, severity: 'medium' };
    }
  },
  {
    id: 'void_space_2030',
    name: '空余空间限制',
    description: '2030 年起，包装空余空间不得超过 50%',
    effectiveDate: '2030-01-01',
    check: (data) => {
      const voidSpacePercent = data.voidSpacePercent;
      if (voidSpacePercent === undefined) return { passed: true, message: '未提供空余空间数据', severity: 'low' };
      if (voidSpacePercent <= 50) {
        return { passed: true, message: `空余空间${voidSpacePercent}%符合要求 (≤50%)`, severity: 'low' };
      }
      return { passed: false, message: `空余空间${voidSpacePercent}%超标 (需≤50%)`, severity: 'high' };
    }
  },
  {
    id: 'recycled_content_plastic',
    name: '塑料再生含量要求',
    description: '2030 年起塑料包装需含最低比例再生料',
    effectiveDate: '2030-01-01',
    check: (data) => {
      const materialCategory = data.materialCategory;
      const recycledContent = data.recycledContentPercent;
      const minRequired = data.minRecycledContent2030;
      
      if (materialCategory !== 'plastic') {
        return { passed: true, message: '非塑料材质，不适用此要求', severity: 'low' };
      }
      if (recycledContent === undefined) {
        return { passed: false, message: '未提供再生含量数据', severity: 'medium' };
      }
      if (minRequired === undefined) {
        return { passed: true, message: '该材质无再生含量要求', severity: 'low' };
      }
      if (recycledContent >= minRequired) {
        return { passed: true, message: `再生含量${recycledContent}%符合要求 (≥${minRequired}%)`, severity: 'low' };
      }
      return { passed: false, message: `再生含量${recycledContent}%不足 (需≥${minRequired}%)`, severity: 'high' };
    }
  },
  {
    id: 'compostable_2028',
    name: '可堆肥要求 (2028)',
    description: '2028 年 2 月起，茶包、咖啡包、水果标签必须可工业堆肥',
    effectiveDate: '2028-02-12',
    check: (data) => {
      const packagingType = data.packagingType;
      const compostable = data.compostable;
      
      if (['tea_bag', 'fruit_label'].includes(packagingType)) {
        if (compostable) {
          return { passed: true, message: '可工业堆肥，符合 2028 年要求', severity: 'low' };
        }
        return { passed: false, message: '茶包/咖啡包/水果标签必须可工业堆肥 (2028 年 2 月起)', severity: 'high' };
      }
      return { passed: true, message: '不适用于此包装类型', severity: 'low' };
    }
  },
  {
    id: 'pfas_free',
    name: 'PFAS 限制',
    description: '总 PFAS 含量不得超过 50ppm',
    effectiveDate: '2025-02-11',
    check: (data) => {
      const pfasFree = data.pfasFree;
      const pfasContent = data.pfasContentPpm;
      
      if (pfasFree === false) {
        return { passed: false, message: '材质含 PFAS，需提供检测报告 (阈值 50ppm)', severity: 'high' };
      }
      if (pfasContent !== undefined) {
        if (pfasContent <= 50) {
          return { passed: true, message: `PFAS 含量${pfasContent}ppm 符合要求 (≤50ppm)`, severity: 'low' };
        }
        return { passed: false, message: `PFAS 含量${pfasContent}ppm 超标 (需≤50ppm)`, severity: 'high' };
      }
      return { passed: true, message: '材质本身不含 PFAS', severity: 'low' };
    }
  },
  {
    id: 'drs_required',
    name: 'DRS 押金回收系统',
    description: '饮料包装需符合 DRS 要求',
    effectiveDate: '2029-01-01',
    check: (data) => {
      const drsRequired = data.drsRequired;
      
      if (drsRequired) {
        return { 
          passed: true, 
          message: '需符合 DRS 押金回收系统 (2029 年起)', 
          severity: 'medium',
          action: '需与进口商确认目标市场的 DRS 系统要求'
        };
      }
      return { passed: true, message: '不适用于此包装类型', severity: 'low' };
    }
  }
];

// 工具函数
export function getMaterialById(id: string): MaterialRule | undefined {
  return MATERIAL_RULES.find(m => m.id === id);
}

export function getPackagingTypeById(id: string): PackagingType | undefined {
  return PACKAGING_TYPES.find(p => p.id === id);
}

export function calculateVoidSpace(productVolume: number, packagingVolume: number): number {
  if (productVolume <= 0 || packagingVolume <= 0) return 0;
  if (packagingVolume <= productVolume) return 0;
  return Math.round(((packagingVolume - productVolume) / packagingVolume) * 100);
}

export function calculatePackagingVolume(length: number, width: number, height: number): number {
  return length * width * height;
}
