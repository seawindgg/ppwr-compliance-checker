'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../lib/supabase-client';

interface UserProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  product_category: string;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'company'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 管理员邮箱列表（可配置）
  const ADMIN_EMAILS = [
    'kevinpeng99@gmail.com',  // 涛哥的邮箱
    // 可以添加更多管理员邮箱
  ];

  // 检查管理员权限
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && ADMIN_EMAILS.includes(session.user.email)) {
        setIsAdmin(true);
        loadUsers();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  // 加载所有用户
  const loadUsers = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });
      
      if (error) {
        console.error('加载用户失败:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 登录处理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      // 检查是否是管理员
      if (data.user && ADMIN_EMAILS.includes(data.user.email)) {
        setIsAdmin(true);
        loadUsers();
      } else {
        setLoginError('❌ 你没有管理员权限');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      setLoginError(err.message || '登录失败');
    }
  };

  // 筛选和搜索用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || user.product_category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 导出 CSV
  const exportCSV = () => {
    const headers = ['姓名', '邮箱', '公司', '产品类别', '注册时间'];
    const rows = filteredUsers.map(user => [
      user.name || '',
      user.email || '',
      user.company || '',
      user.product_category || '',
      new Date(user.created_at).toLocaleString('zh-CN')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `用户数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 退出登录
  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUsers([]);
  };

  // 统计信息
  const stats = {
    total: users.length,
    byCategory: {
      food: users.filter(u => u.product_category === 'food').length,
      beverage: users.filter(u => u.product_category === 'beverage').length,
      cosmetics: users.filter(u => u.product_category === 'cosmetics').length,
      electronics: users.filter(u => u.product_category === 'electronics').length,
      textiles: users.filter(u => u.product_category === 'textiles').length,
      toys: users.filter(u => u.product_category === 'toys').length,
      other: users.filter(u => u.product_category === 'other').length,
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-900">管理员登录</h1>
            <p className="text-gray-600 mt-2">仅限授权管理员访问</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                管理员邮箱
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-300 rounded-md p-3">
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              🔑 登录管理后台
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-700">
              ← 返回首页
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 用户管理后台
              </h1>
              <p className="mt-2 text-gray-600">
                PPWR 合规检查工具 - 注册用户管理
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">管理员</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">总用户数</div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">食品类</div>
            <div className="text-3xl font-bold text-green-600">{stats.byCategory.food}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">饮料类</div>
            <div className="text-3xl font-bold text-purple-600">{stats.byCategory.beverage}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">其他类别</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.byCategory.cosmetics + stats.byCategory.electronics + stats.byCategory.textiles + stats.byCategory.toys + stats.byCategory.other}
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 搜索姓名、邮箱、公司..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有类别</option>
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
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as any);
                  setSortOrder(order as any);
                  loadUsers();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">注册时间 ↓</option>
                <option value="created_at-asc">注册时间 ↑</option>
                <option value="name-asc">姓名 ↑</option>
                <option value="name-desc">姓名 ↓</option>
                <option value="company-asc">公司 ↑</option>
                <option value="company-desc">公司 ↓</option>
              </select>
            </div>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📥 导出 CSV
            </button>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              注册用户列表 ({filteredUsers.length} 条)
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">⏳</div>
              <p>加载中...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>没有找到匹配的用户</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      邮箱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      公司
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品类别
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.company || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.product_category === 'food' ? 'bg-green-100 text-green-700' :
                          user.product_category === 'beverage' ? 'bg-purple-100 text-purple-700' :
                          user.product_category === 'cosmetics' ? 'bg-pink-100 text-pink-700' :
                          user.product_category === 'electronics' ? 'bg-blue-100 text-blue-700' :
                          user.product_category === 'textiles' ? 'bg-yellow-100 text-yellow-700' :
                          user.product_category === 'toys' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.product_category === 'food' ? '食品' :
                           user.product_category === 'beverage' ? '饮料' :
                           user.product_category === 'cosmetics' ? '化妆品' :
                           user.product_category === 'electronics' ? '电子产品' :
                           user.product_category === 'textiles' ? '纺织品' :
                           user.product_category === 'toys' ? '玩具' : '其他'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 返回首页 */}
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-700">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
