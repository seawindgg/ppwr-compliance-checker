'use client';

import { useState, useEffect } from 'react';
import { MATERIAL_RULES, PACKAGING_TYPES } from '../lib/ppwr-rules';
import { runComplianceCheck, ProductData, getStatusColor, getStatusText } from '../lib/compliance-calculator';
import { getSupabaseClient, CheckRecord } from '../lib/supabase-client';
import AuthModal from '../components/AuthModal';

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
    packagingWeight: undefined as number | undefined,
    recycledContentPercent: undefined as number | undefined,
    pfasContentPpm: undefined as number | undefined,
    compostable: false,
    hasDoubleWall: false,
    hasFalseBottom: false,
    hasMisleadingDesign: false,
    usesFillerMaterial: false,
    fillerMaterialType: '',
    targetMarket: ['DE'],
    exportDate: ''
  });

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'dimensions' | 'material' | 'overpackaging'>('basic');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkHistory, setCheckHistory] = useState<CheckRecord[]>([]);

  // 检查登录状态
  useEffect(() => {
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        loadCheckHistory(session.user.id);
      }
    };
    checkUser();
  }, []);

  const loadCheckHistory = async (userId: string) => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('check_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setCheckHistory(data);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      // 自动提交检查
      submitCheck();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查登录状态
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // 未登录，显示注册/登录弹窗
      setShowAuthModal(true);
      return;
    }
    
    // 已登录，直接检查
    submitCheck();
  };

  const submitCheck = async () => {
    setLoading(true);
    
    try {
      const result = runComplianceCheck(formData as ProductData);
      setReport(result);
      
      // 保存检查记录到数据库
      if (user) {
        const supabase = getSupabaseClient();
        await supabase.from('check_records').insert({
          user_id: user.id,
          product_name: formData.productName,
          product_category: formData.productCategory,
          packaging_type: formData.packagingType,
          material: formData.material,
          void_space_percent: result.voidSpacePercent || null,
          overall_status: result.overallStatus,
          high_risk_count: result.highRiskCount,
          medium_risk_count: result.mediumRiskCount,
          low_risk_count: result.lowRiskCount,
        } as any);
        loadCheckHistory(user.id);
      }
    } catch (error) {
      console.error('检查失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'basic', label: '📦 基本信息', icon: '📦' },
    { id: 'dimensions', label: '📏 尺寸信息', icon: '📏' },
    { id: 'material', label: '🧪 材质属性', icon: '🧪' },
    { id: 'overpackaging', label: '⚠️ 过度包装检查', icon: '⚠️' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🇪🇺 PPWR 包装合规检查工具
              </h1>
              <p className="mt-2 text-gray-600">
                帮助中国企业快速评估产品包装是否符合欧盟 PPWR 法规 (EU 2025/40)
              </p>
            </div>
            <div>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">已登录</p>
                  </div>
                  <button
                    onClick={async () => {
                      const supabase = getSupabaseClient();
                      await supabase.auth.signOut();
                      setUser(null);
                      setCheckHistory([]);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  🔑 登录 / 注册
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Article 10: 包装最小化
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Article 24: 空隙率≤50%
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              Article 26: 禁止过度包装
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 表单区域 */}
          <div className="bg-white rounded-lg shadow p-6">
            {/* Tab 导航 */}
            <div className="flex flex-wrap gap-2 mb-6 border-b">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
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
                      <option value="toys">玩具</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

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
                    <p className="mt-1 text-xs text-gray-500">
                      💡 提示：二级包装、运输包装、电商包装需符合 50% 空隙率限制
                    </p>
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      预计出口日期
                    </label>
                    <input
                      type="date"
                      value={formData.exportDate}
                      onChange={(e) => handleChange('exportDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      ⏰ 关键日期：2026-08-12 (主要条款生效) | 2030-01-01 (50% 空隙率强制执行)
                    </p>
                  </div>
                </div>
              )}

              {/* 尺寸信息 Tab */}
              {activeTab === 'dimensions' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                      📐 PPWR Article 24 空隙率计算
                    </h3>
                    <p className="text-xs text-blue-700 mb-3">
                      空隙率 = (包装内部体积 - 产品体积) / 包装内部体积 × 100%
                    </p>
                    <p className="text-xs text-blue-700">
                      ⚠️ 2030 年起，组合包装/运输包装/电商包装的空隙率不得超过 50%
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      包装尺寸 (mm) *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.packagingLength || ''}
                          onChange={(e) => handleChange('packagingLength', e.target.value ? parseFloat(e.target.value) : 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="长度"
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">长度</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.packagingWidth || ''}
                          onChange={(e) => handleChange('packagingWidth', e.target.value ? parseFloat(e.target.value) : 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="宽度"
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">宽度</p>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.packagingHeight || ''}
                          onChange={(e) => handleChange('packagingHeight', e.target.value ? parseFloat(e.target.value) : 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="高度"
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">高度</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      产品体积 (cm³)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.productVolume || ''}
                      onChange={(e) => handleChange('productVolume', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="用于计算空隙率"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 提示：产品体积可通过排水法测量，或根据产品尺寸计算
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        产品重量 (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.productWeight || ''}
                        onChange={(e) => handleChange('productWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="净重"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        包装重量 (g)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.packagingWeight || ''}
                        onChange={(e) => handleChange('packagingWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="皮重"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 材质属性 Tab */}
              {activeTab === 'material' && (
                <div className="space-y-4">
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
                    <p className="mt-1 text-xs text-gray-500">
                      📊 2030 年要求：PET 接触敏感 30% | 其他塑料 10-35%
                    </p>
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
                  <p className="text-xs text-gray-500 -mt-3">
                    ⚠️ 2028 年 2 月起，茶包/咖啡包/水果标签必须可堆肥
                  </p>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">化学物质检测</h4>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        PFAS 含量 (ppm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.pfasContentPpm || ''}
                        onChange={(e) => handleChange('pfasContentPpm', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="阈值：50ppm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        🚫 PPWR 规定总 PFAS 含量不得超过 50ppm
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 过度包装检查 Tab */}
              {activeTab === 'overpackaging' && (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-red-900 mb-2">
                      ⚠️ PPWR Article 10(2) 禁止的过度包装设计
                    </h3>
                    <p className="text-xs text-red-700 mb-3">
                      以下设计元素自 2026 年 8 月 12 日起被明确禁止：
                    </p>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• 双壁包装 (Double walls)</li>
                      <li>• 假底部设计 (False bottoms)</li>
                      <li>• 其他人为增加产品感知体积的设计</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.hasDoubleWall}
                        onChange={(e) => handleChange('hasDoubleWall', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">双壁包装</span>
                        <p className="text-xs text-gray-500">包装有双层壁结构，人为增加体积感</p>
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.hasFalseBottom}
                        onChange={(e) => handleChange('hasFalseBottom', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">假底部设计</span>
                        <p className="text-xs text-gray-500">包装底部有隐藏隔层，使产品看起来更多</p>
                      </label>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={formData.hasMisleadingDesign}
                        onChange={(e) => handleChange('hasMisleadingDesign', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">误导性设计元素</span>
                        <p className="text-xs text-gray-500">其他人为增加产品感知体积的设计</p>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">📦 填充材料使用</h4>
                    
                    <div className="flex items-start mb-3">
                      <input
                        type="checkbox"
                        checked={formData.usesFillerMaterial}
                        onChange={(e) => handleChange('usesFillerMaterial', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        <span className="font-medium">使用填充材料</span>
                        <p className="text-xs text-gray-500">如气泡膜、空气袋、泡沫等</p>
                      </label>
                    </div>

                    {formData.usesFillerMaterial && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          填充材料类型
                        </label>
                        <select
                          value={formData.fillerMaterialType}
                          onChange={(e) => handleChange('fillerMaterialType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">请选择</option>
                          <option value="bubble_wrap">气泡膜</option>
                          <option value="air_cushion">空气袋/气柱</option>
                          <option value="foam">泡沫填充物</option>
                          <option value="paper_shred">纸屑</option>
                          <option value="styrofoam">聚苯乙烯泡沫粒</option>
                          <option value="other">其他</option>
                        </select>
                        <p className="mt-1 text-xs text-amber-600">
                          ⚠️ 注意：填充材料所占空间需计入空隙率，不能"充数"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="border-t pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '检查中...' : '🔍 开始合规检查'}
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  检查约需 1-2 秒，将生成详细合规报告
                </p>
              </div>
            </form>
          </div>

          {/* 结果区域 */}
          <div>
            {!report ? (
              <div className="bg-white rounded-lg shadow p-6">
                {checkHistory.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 最近检查记录</h3>
                    <div className="space-y-3">
                      {checkHistory.map((record) => (
                        <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{record.product_name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              record.overall_status === 'compliant' ? 'bg-green-100 text-green-700' :
                              record.overall_status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {record.overall_status === 'compliant' ? '✅ 合规' :
                               record.overall_status === 'warning' ? '⚠️ 警告' : '❌ 不合规'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>类别：{record.product_category} | 材质：{record.material}</p>
                            {record.void_space_percent !== null && (
                              <p>空隙率：{record.void_space_percent}%</p>
                            )}
                            <p>检查时间：{new Date(record.created_at).toLocaleString('zh-CN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg">填写左侧表单后点击检查</p>
                    <p className="text-sm mt-2">系统将自动评估 PPWR 合规风险</p>
                    <div className="mt-6 text-left text-xs space-y-2">
                      <p className="flex items-center">
                        <span className="mr-2">✅</span>
                        Article 10: 包装最小化原则
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📐</span>
                        Article 24: 空隙率≤50%
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">⚠️</span>
                        Article 10(2): 禁止过度包装
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">♻️</span>
                        Article 5: 可回收等级要求
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ComplianceReport report={report} />
            )}
          </div>
        </div>
      </div>

      {/* 注册/登录弹窗 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
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

      {/* 空隙率结果 */}
      {report.voidSpacePercent !== undefined && (
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
          report.voidSpaceCompliant ? 'border-green-500' : 'border-red-500'
        }`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📐 Article 24 空隙率评估</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">计算空隙率</p>
              <p className={`text-3xl font-bold ${
                report.voidSpaceCompliant ? 'text-green-600' : 'text-red-600'
              }`}>
                {report.voidSpacePercent}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">PPWR 要求</p>
              <p className="text-3xl font-bold text-gray-900">≤50%</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                report.voidSpaceCompliant ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(report.voidSpacePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {report.voidSpaceCompliant 
              ? '✅ 空隙率符合要求，可安全出口' 
              : '❌ 空隙率超标，需减小包装尺寸或增大产品体积'}
          </p>
        </div>
      )}

      {/* 过度包装检测 */}
      {report.overpackagingDetected && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            ⚠️ 检测到禁止的过度包装设计
          </h3>
          <p className="text-red-700 mb-4">
            以下设计元素违反 PPWR Article 10(2)，自 2026 年 8 月 12 日起禁止在欧盟市场销售：
          </p>
          <ul className="space-y-2">
            {report.results
              .filter((r: any) => r.checkId === 'overpackaging_prohibition' && !r.passed)
              .map((r: any, i: number) => (
                <li key={i} className="flex items-start text-red-800">
                  <span className="mr-2">❌</span>
                  <span>{r.message}</span>
                </li>
              ))}
          </ul>
          <p className="text-sm text-red-700 mt-4 font-medium">
            💡 建议：立即重新设计包装，移除禁止的设计元素
          </p>
        </div>
      )}

      {/* 材质信息 */}
      {report.materialInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 材质信息</h3>
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
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{result.checkName}</h4>
                    {result.article && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        {result.article}
                      </span>
                    )}
                  </div>
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

      {/* 最小化评估 */}
      {report.minimizationAssessment && !report.minimizationAssessment.passed && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            ⚠️ 包装最小化评估未通过
          </h3>
          <p className="text-yellow-700 mb-4">
            根据 PPWR Article 10，包装重量和体积需限制在确保产品保护、Handling 和销售所需的最低限度。
          </p>
          {report.minimizationAssessment.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-yellow-900 mb-2">发现的问题：</h4>
              <ul className="space-y-1">
                {report.minimizationAssessment.issues.map((issue: string, i: number) => (
                  <li key={i} className="text-yellow-800 text-sm">❌ {issue}</li>
                ))}
              </ul>
            </div>
          )}
          {report.minimizationAssessment.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">改进建议：</h4>
              <ul className="space-y-1">
                {report.minimizationAssessment.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-yellow-800 text-sm">💡 {rec}</li>
                ))}
              </ul>
            </div>
          )}
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
