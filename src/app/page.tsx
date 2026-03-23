'use client';

import { useState } from 'react';
import { MATERIAL_RULES, PACKAGING_TYPES } from '../lib/ppwr-rules';
import { runComplianceCheck, ProductData, getStatusColor, getStatusText } from '../lib/compliance-calculator';

export default function Home() {
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: 'food',
    packagingType: 'primary_non_food',
    material: 'pet',
    secondaryMaterial: '',
    packagingLength: 0,
    packagingWidth: 0,
    packagingHeight: 0,
    productVolume: undefined as number | undefined,
    productWeight: undefined as number | undefined,
    recycledContentPercent: undefined as number | undefined,
    pfasContentPpm: undefined as number | undefined,
    compostable: false,
    targetMarket: ['DE'],
    exportDate: ''
  });

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = runComplianceCheck(formData as ProductData);
      setReport(result);
    } catch (error) {
      console.error('检查失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🇪🇺 PPWR 包装合规检查工具
          </h1>
          <p className="mt-2 text-gray-600">
            帮助中国企业快速评估产品包装是否符合欧盟 PPWR 法规 (EU 2025/40)
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 表单区域 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📦 产品信息</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：有机绿茶 500g"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  产品类别 *
                </label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => handleChange('productCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="food">食品</option>
                  <option value="beverage">饮料</option>
                  <option value="cosmetics">化妆品</option>
                  <option value="electronics">电子产品</option>
                  <option value="textiles">纺织品</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 包装信息 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📦 包装信息</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      包装类型 *
                    </label>
                    <select
                      value={formData.packagingType}
                      onChange={(e) => handleChange('packagingType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PACKAGING_TYPES.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      主要材质 *
                    </label>
                    <select
                      value={formData.material}
                      onChange={(e) => handleChange('material', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MATERIAL_RULES.map(mat => (
                        <option key={mat.id} value={mat.id}>
                          {mat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      再生料含量 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.recycledContentPercent || ''}
                      onChange={(e) => handleChange('recycledContentPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：30"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.compostable}
                      onChange={(e) => handleChange('compostable', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      可工业堆肥 (EN 13432 认证)
                    </label>
                  </div>
                </div>
              </div>

              {/* 尺寸信息 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📏 尺寸信息</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      长度 (mm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.packagingLength || ''}
                      onChange={(e) => handleChange('packagingLength', e.target.value ? parseFloat(e.target.value) : 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      宽度 (mm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.packagingWidth || ''}
                      onChange={(e) => handleChange('packagingWidth', e.target.value ? parseFloat(e.target.value) : 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      高度 (mm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.packagingHeight || ''}
                      onChange={(e) => handleChange('packagingHeight', e.target.value ? parseFloat(e.target.value) : 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品体积 (cm³)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.productVolume || ''}
                    onChange={(e) => handleChange('productVolume', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="用于计算空余空间"
                  />
                </div>
              </div>

              {/* 出口信息 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🚢 出口信息</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标市场
                  </label>
                  <select
                    value={formData.targetMarket[0]}
                    onChange={(e) => handleChange('targetMarket', [e.target.value])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DE">德国</option>
                    <option value="FR">法国</option>
                    <option value="IT">意大利</option>
                    <option value="ES">西班牙</option>
                    <option value="NL">荷兰</option>
                    <option value="PL">波兰</option>
                    <option value="EU">欧盟全境</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预计出口日期
                  </label>
                  <input
                    type="date"
                    value={formData.exportDate}
                    onChange={(e) => handleChange('exportDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '检查中...' : '🔍 开始合规检查'}
              </button>
            </form>
          </div>

          {/* 结果区域 */}
          <div>
            {!report ? (
              <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg">填写左侧表单后点击检查</p>
                  <p className="text-sm mt-2">系统将自动评估 PPWR 合规风险</p>
                </div>
              </div>
            ) : (
              <ComplianceReport report={report} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ComplianceReport({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      {/* 总体状态 */}
      <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
        report.overallStatus === 'compliant' ? 'border-green-500' :
        report.overallStatus === 'warning' ? 'border-yellow-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {getStatusText(report.overallStatus)}
            </h2>
            <p className="text-gray-600 mt-1">产品：{report.productName}</p>
            <p className="text-sm text-gray-500 mt-1">
              检查时间：{new Date(report.checkDate).toLocaleString('zh-CN')}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(report.overallStatus)}`}>
            {report.overallStatus === 'compliant' ? '✅ 合规' :
             report.overallStatus === 'warning' ? '⚠️ 警告' : '❌ 不合规'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{report.highRiskCount}</div>
            <div className="text-sm text-red-700">高风险</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{report.mediumRiskCount}</div>
            <div className="text-sm text-yellow-700">中风险</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{report.lowRiskCount}</div>
            <div className="text-sm text-blue-700">低风险</div>
          </div>
        </div>
      </div>

      {/* 材质信息 */}
      {report.materialInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 材质信息</h3>
          <div className="space-y-2">
            <p><span className="text-gray-600">材质名称：</span>{report.materialInfo.name}</p>
            <p><span className="text-gray-600">材质类别：</span>{report.materialInfo.category}</p>
            <p><span className="text-gray-600">可回收等级：</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                ['A', 'B'].includes(report.materialInfo.recyclabilityGrade) ? 'bg-green-100 text-green-700' :
                report.materialInfo.recyclabilityGrade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {report.materialInfo.recyclabilityGrade || '未知'}
              </span>
            </p>
            <p><span className="text-gray-600">可回收性：</span>
              {report.materialInfo.recyclable ? '✅ 可回收' : '❌ 不可回收'}
            </p>
          </div>
        </div>
      )}

      {/* 详细检查结果 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 详细检查结果</h3>
        <div className="space-y-3">
          {report.results.map((result: any, index: number) => (
            <div
              key={result.checkId}
              className={`p-4 rounded-lg border-l-4 ${
                result.passed ? 'border-green-500 bg-green-50' :
                result.severity === 'high' ? 'border-red-500 bg-red-50' :
                result.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{result.checkName}</h4>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.action && (
                    <p className="text-sm text-blue-600 mt-2">💡 {result.action}</p>
                  )}
                </div>
                <div className="ml-4">
                  {result.passed ? (
                    <span className="text-green-600 text-xl">✅</span>
                  ) : (
                    <span className="text-red-600 text-xl">❌</span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                生效日期：{new Date(result.effectiveDate).toLocaleDateString('zh-CN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 改进建议 */}
      {report.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 改进建议</h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-gray-700 flex items-start">
                <span className="mr-2 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 免责声明 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">⚠️ 免责声明</p>
        <p>
          本工具提供的检查结果仅供参考，不构成法律意见。PPWR 法规复杂且可能更新，
          建议在正式出口前咨询专业合规顾问或第三方检测机构。
        </p>
      </div>
    </div>
  );
}
