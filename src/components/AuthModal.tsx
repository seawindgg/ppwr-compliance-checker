'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    productCategory: 'food',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // 注册
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              company: formData.company,
              product_category: formData.productCategory,
            }
          }
        });

        if (authError) throw authError;

        // 如果注册成功，创建用户档案
        if (authData.user) {
          // 请先在 Supabase SQL Editor 中执行以下 SQL 修复触发器：
          // DROP TRIGGER IF EXISTS set_profile_user_id ON user_profiles;
          // DROP FUNCTION IF EXISTS set_profile_user_id();
          // CREATE OR REPLACE FUNCTION set_profile_user_id()
          // RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER AS $$
          // BEGIN
          //   IF NEW.id IS NULL THEN
          //     NEW.id := auth.uid();
          //   END IF;
          //   RETURN NEW;
          // END;
          // $$
          // CREATE TRIGGER set_profile_user_id
          //   BEFORE INSERT ON user_profiles
          //   FOR EACH ROW
          //   EXECUTE FUNCTION set_profile_user_id();
          
          // 然后插入用户档案
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              name: formData.name,
              company: formData.company,
              email: formData.email,
              product_category: formData.productCategory,
            });

          if (profileError) {
            console.error('创建用户档案失败:', profileError);
            console.error('请执行上面的 SQL 修复触发器后再试');
          }
        }

        // 注册成功后自动登录
        onSuccess();
      } else {
        // 登录
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (loginError) throw loginError;
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🇪🇺</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'register' ? '免费注册' : '登录'}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            {mode === 'register' 
              ? '注册后可保存检查记录、下载 PPWR 法规全文' 
              : '欢迎回来，继续您的合规检查'}
          </p>
        </div>

        {/* 价值主张 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-blue-900 mb-2">✨ 注册后可享受：</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 保存历史评估记录，随时查看</li>
            <li>• 下载 PPWR 中英文全文</li>
            <li>• 接收法规更新预警通知</li>
            <li>• 预约 15 分钟免费合规咨询</li>
          </ul>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  公司名称 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="您的公司名称"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 公司名称帮助我们为您提供更精准的合规建议
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主要出口产品类别 *
                </label>
                <select
                  value={formData.productCategory}
                  onChange={(e) => setFormData({...formData, productCategory: e.target.value})}
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
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱 *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码 *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="至少 6 位字符"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '处理中...' : (mode === 'register' ? '🚀 免费注册并检查' : '🔑 登录并检查')}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="text-center mt-4">
          <button
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {mode === 'register' 
              ? '已有账号？点击登录' 
              : '没有账号？免费注册'}
          </button>
        </div>
      </div>
    </div>
  );
}
