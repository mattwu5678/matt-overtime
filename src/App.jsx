import React, { useState, useMemo, useEffect } from 'react';
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  Search, 
  Settings, 
  PlusCircle, 
  Check, 
  X, 
  Filter,
  User,
  Calendar,
  ChevronRight,
  AlertCircle,
  Menu,
  LogOut,
  ArrowRight,
  UserPlus,
  Briefcase,
  Timer,
  Info,
  Coins,
  History,
  Hash,
  ExternalLink,
  PartyPopper,
  Loader2,
  Navigation,
  ClipboardList,
  MessageSquare,
  RotateCcw,
  Trash2
} from 'lucide-react';

// 預設員工資料庫
const EMPLOYEE_DB = [
  { id: '1024', name: '王大錘', department: '行政管理部' },
  { id: '1025', name: '李華', department: '工程部' },
  { id: '2011', name: '張三', department: '會計部' },
  { id: '3001', name: '陳小明', department: '業務部' },
];

// 模擬當前登入者資訊
const CURRENT_LOGGED_USER = { id: '1024', name: '王大錘' };

const INITIAL_DATA = [
  { 
    id: '20240520-001', 
    employeeId: '1024',
    applicant: '王大錘',
    type: '事前', 
    category: '一般上班日',
    reimbursementType: '補休',
    startDateTime: '2024-05-20 18:00', 
    endDateTime: '2024-05-20 20:00', 
    totalHours: '2.0',
    reason: '專案上線準備', 
    status: '待簽核', 
    department: '行政管理部',
    submittedAt: '2024/05/20 17:30:15'
  },
  { 
    id: '20240518-002', 
    employeeId: '1025',
    applicant: '李華',
    type: '事後', 
    category: '休息日',
    reimbursementType: '計薪',
    startDateTime: '2024-05-18 22:00', 
    endDateTime: '2024-05-19 02:30', 
    totalHours: '4.5',
    reason: '修復緊急跨日 Bug', 
    status: '已核准', 
    department: '工程部',
    comment: '同意，辛苦了。',
    submittedAt: '2024/05/19 09:00:22'
  },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [records, setRecords] = useState(INITIAL_DATA);
  const [isSupervisor, setIsSupervisor] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [approvalComments, setApprovalComments] = useState({});
  
  // 生成流水號邏輯 (嚴格使用系統當前日期，不隨表單日期變動)
  const currentSerialNumber = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const systemDatePrefix = `${year}${month}${day}`;
    
    const todayCount = records.filter(r => r.id.startsWith(systemDatePrefix)).length;
    const sequence = String(todayCount + 1).padStart(3, '0');
    return `${systemDatePrefix}-${sequence}`;
  }, [records]);

  const [formData, setFormData] = useState({
    employeeId: CURRENT_LOGGED_USER.id,
    employeeName: CURRENT_LOGGED_USER.name,
    type: '事前',
    category: '一般上班日',
    reimbursementType: '補休',
    startDate: '',
    startHour: '18',
    startMinute: '00',
    endDate: '',
    endHour: '20',
    endMinute: '00',
    reason: '',
  });

  const handleEmployeeIdChange = (id) => {
    const found = EMPLOYEE_DB.find(emp => emp.id === id);
    setFormData(prev => ({
      ...prev,
      employeeId: id,
      employeeName: found ? found.name : prev.employeeName
    }));
  };

  const handleEmployeeNameChange = (name) => {
    const found = EMPLOYEE_DB.find(emp => emp.name === name);
    setFormData(prev => ({
      ...prev,
      employeeName: name,
      employeeId: found ? found.id : prev.employeeId
    }));
  };

  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: prev.startDate }));
    }
  }, [formData.startDate]);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  const calculatedHours = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return "0.0";
    const start = new Date(`${formData.startDate}T${formData.startHour}:${formData.startMinute}:00`);
    const end = new Date(`${formData.endDate}T${formData.endHour}:${formData.endMinute}:00`);
    const diffMs = end - start;
    if (diffMs <= 0) return "0.0";
    return (diffMs / (1000 * 60 * 60)).toFixed(1);
  }, [formData.startDate, formData.startHour, formData.startMinute, formData.endDate, formData.endHour, formData.endMinute]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundEmp = EMPLOYEE_DB.find(emp => emp.id === formData.employeeId) || { department: '其他部門' };
    
    const newRecord = {
      id: currentSerialNumber,
      employeeId: formData.employeeId,
      applicant: formData.employeeName,
      type: formData.type,
      category: formData.category,
      reimbursementType: formData.reimbursementType,
      startDateTime: `${formData.startDate} ${formData.startHour}:${formData.startMinute}`,
      endDateTime: `${formData.endDate} ${formData.endHour}:${formData.endMinute}`,
      totalHours: calculatedHours,
      reason: formData.reason,
      status: '待簽核',
      department: foundEmp.department,
      submittedAt: new Date().toLocaleString('zh-TW', { hour12: false }) // 包含年月日與時間
    };
    
    setRecords([newRecord, ...records]);
    
    setFormData({ 
      employeeId: CURRENT_LOGGED_USER.id, employeeName: CURRENT_LOGGED_USER.name, 
      type: '事前', category: '一般上班日', reimbursementType: '補休', 
      startDate: '', startHour: '18', startMinute: '00', 
      endDate: '', endHour: '20', endMinute: '00', reason: '' 
    });
    
    setTimeout(() => {
      const element = document.getElementById('submission-tracking');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleApprove = (id, newStatus) => {
    const comment = approvalComments[id] || '';
    setRecords(records.map(r => r.id === id ? { 
      ...r, 
      status: newStatus, 
      comment: comment,
      approvedAt: new Date().toLocaleString('zh-TW', { hour12: false })
    } : r));
    
    const newComments = { ...approvalComments };
    delete newComments[id];
    setApprovalComments(newComments);
  };

  const handleWithdraw = (id) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const handleDateClick = (e) => {
    try {
      if (e.currentTarget && typeof e.currentTarget.showPicker === 'function') {
        e.currentTarget.showPicker();
      }
    } catch (err) {}
  };

  // 獲取當前登入者單據，確保所有紀錄都帶出
  const mySubmissions = useMemo(() => {
    return records.filter(r => r.employeeId === CURRENT_LOGGED_USER.id);
  }, [records]);

  const renderContent = () => {
    switch (activeTab) {
      case 'apply':
        return (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-left font-sans">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <PlusCircle size={24} className="text-blue-600" /> 加班申請單
                </h2>
                <div className="text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 uppercase tracking-wider shadow-inner font-mono">
                  <Hash size={16} /> 申請單號：{currentSerialNumber}
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8 font-sans">
                <div className="space-y-4">
                  <label className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600"/> 申報性質
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div className="flex gap-4 shrink-0">
                      {['事前', '事後'].map(t => (
                        <button
                          key={t} type="button" 
                          onClick={() => setFormData({...formData, type: t})}
                          className={`px-8 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-base font-bold ${
                            formData.type === t 
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {t}加班
                        </button>
                      ))}
                    </div>
                    <div className="md:ml-auto flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 px-5 py-3 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-right-2">
                      <AlertCircle size={18} />
                      {formData.type === '事前' ? '請於加班前完成送出' : '請於加班後 3 日內完成申請'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-base font-bold text-slate-500">員工編號 (可修改)</label>
                    <input
                      type="text" required maxLength={4} placeholder="例如：1024"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono text-lg"
                      value={formData.employeeId} 
                      onChange={(e) => handleEmployeeIdChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-bold text-slate-500">員工姓名 (可修改)</label>
                    <input
                      type="text" required placeholder="請輸入姓名"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                      value={formData.employeeName} 
                      onChange={(e) => handleEmployeeNameChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-slate-700">補償方式</label>
                    <div className="flex gap-4">
                      {['補休', '計薪'].map(r => (
                        <button
                          key={r} type="button" 
                          onClick={() => setFormData({...formData, reimbursementType: r})}
                          className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-base font-bold ${formData.reimbursementType === r ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-lg font-bold text-slate-700 flex items-center gap-2">加班類別</label>
                    <select
                      required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-lg"
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="一般上班日">一般上班日</option>
                      <option value="國定假日">國定假日</option>
                      <option value="休息日">休息日</option>
                      <option value="出差加班">出差加班</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-sans">
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-base mb-4 uppercase tracking-widest">起始日期與時間</div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-52 relative">
                        <input
                          type="date" required onClick={handleDateClick}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-lg cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all outline-none font-sans"
                          value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-1 gap-3 font-sans">
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-lg font-mono focus:ring-2 focus:ring-blue-500" value={formData.startHour} onChange={(e) => setFormData({...formData, startHour: e.target.value})}>
                          {hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}
                        </select>
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-lg font-mono focus:ring-2 focus:ring-blue-500" value={formData.startMinute} onChange={(e) => setFormData({...formData, startMinute: e.target.value})}>
                          <option value="00">00 分</option>
                          <option value="30">30 分</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-sans">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-base mb-4 uppercase tracking-widest">結束日期與時間</div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-52 relative font-sans">
                        <input
                          type="date" required onClick={handleDateClick}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-lg cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all outline-none font-sans"
                          value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-1 gap-3 font-sans">
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-lg font-mono focus:ring-2 focus:ring-blue-500" value={formData.endHour} onChange={(e) => setFormData({...formData, endHour: e.target.value})}>
                          {hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}
                        </select>
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-lg font-mono focus:ring-2 focus:ring-blue-500" value={formData.endMinute} onChange={(e) => setFormData({...formData, endMinute: e.target.value})}>
                          <option value="00">00 分</option>
                          <option value="30">30 分</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl text-white shadow-xl">
                  <div className="flex items-center gap-4">
                    <Timer className="text-blue-400" size={32} />
                    <div className="text-left font-sans">
                      <p className="text-base text-slate-400 font-bold uppercase tracking-wider">自動結算總時數</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl font-black font-mono text-blue-400 tracking-tighter">{calculatedHours}</span>
                    <span className="ml-2 text-base font-bold text-slate-400 font-sans">小時</span>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-lg font-bold text-slate-700">加班事由說明</label>
                  <textarea
                    rows="4" required placeholder="請詳細描述加班原因..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-lg font-sans"
                    value={formData.reason} 
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  ></textarea>
                </div>

                <div className="pt-4 font-sans">
                  <button
                    type="submit" disabled={parseFloat(calculatedHours) <= 0}
                    className={`w-full font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xl ${parseFloat(calculatedHours) > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <CheckCircle size={24} /> 提交加班申請案
                  </button>
                  {parseFloat(calculatedHours) <= 0 && formData.startDate && (
                    <p className="text-base text-red-500 mt-3 text-center font-bold tracking-wide font-sans">⚠️ 結束時間必須晚於開始時間。</p>
                  )}
                </div>
              </form>

              {/* 加班申請注意事項 */}
              <div className="mt-12 p-8 bg-amber-50 border border-amber-200 rounded-2xl text-left font-sans shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-6 border-b border-amber-200 pb-3 tracking-wider text-lg">
                  <AlertCircle size={24} />
                  <span>加班申請注意事項</span>
                </div>
                <ul className="space-y-4 text-base text-amber-900/80 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black font-sans">A</span>
                    <span>加班申請須事前由直屬主管核准，始得進行加班；並於事後呈主管審核確認。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black font-sans">B</span>
                    <span>此單由各部門編序號並於加班後<span className="text-amber-900 font-bold underline mx-1">七個工作日內</span>交至財務行政部辦理，逾期不受理。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black font-sans">C</span>
                    <span>此加班工時將依比例換算補修時數或薪資。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black font-sans">D</span>
                    <span>每月加班時數不得超過 <span className="text-red-600 font-bold">46 小時</span>。</span>
                  </li>
                </ul>
              </div>

              {/* 單據追蹤清單 */}
              {mySubmissions.length > 0 && (
                <div id="submission-tracking" className="mt-12 animate-in zoom-in-95 fade-in slide-in-from-top-6 duration-700 text-left font-sans">
                  <div className="mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={24} className="text-emerald-600" />
                      <span className="text-base font-black text-emerald-600 uppercase tracking-widest">您的申請單據資訊追蹤</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[...mySubmissions].reverse().map((record, index) => (
                      <div key={record.id} className={`bg-white border-2 ${index === 0 ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200 shadow-sm'} rounded-3xl p-6 relative overflow-hidden transition-all hover:border-emerald-300`}>
                        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`${index === 0 ? 'bg-emerald-500' : 'bg-slate-400'} text-white p-2.5 rounded-xl shadow-lg`}>
                              <CheckCircle size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                              <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">{record.id}</span>
                              <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-wide uppercase">單據建立於：{record.submittedAt || '歷史紀錄'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 xl:max-w-3xl">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-xs font-black text-slate-400 uppercase mb-1">大名</p>
                              <p className="text-base font-black text-slate-700">{record.applicant}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-xs font-black text-slate-400 uppercase mb-1">異動時間</p>
                              <p className="text-base font-bold text-slate-700 leading-tight">
                                {record.submittedAt || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-xs font-black text-slate-400 uppercase mb-1">狀態</p>
                              <div className="flex items-center justify-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${record.status === '待簽核' ? 'bg-orange-400 animate-pulse' : record.status === '已駁回' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                <p className={`text-base font-black uppercase ${record.status === '待簽核' ? 'text-orange-600' : record.status === '已駁回' ? 'text-red-600' : 'text-green-600'}`}>{record.status}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {record.status === '待簽核' && (
                              <button 
                                onClick={() => handleWithdraw(record.id)}
                                className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl text-base font-black transition-all border border-red-100 active:scale-95 shadow-sm font-sans"
                                title="撤回此申請單"
                              >
                                <RotateCcw size={18} /> 抽單
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'approve':
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left font-sans">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center font-sans">
              <h2 className="text-2xl font-bold text-slate-800">待簽核加班清單</h2>
              <span className="px-5 py-2 bg-orange-100 text-orange-700 rounded-full text-base font-bold shadow-sm">
                目前有 {records.filter(r => r.status === '待簽核').length} 筆待處理
              </span>
            </div>
            {records.filter(r => r.status === '待簽核').length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-xl font-medium">目前沒有任何待簽核的加班申請案</div>
            ) : (
              records.filter(r => r.status === '待簽核').map(record => (
                <div key={record.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold font-mono tracking-wider shadow-inner">單號: {record.id}</span>
                        <h3 className="font-bold text-2xl text-slate-800 tracking-tight">{record.applicant}</h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-base font-mono font-bold bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-600 font-sans">始：</span>
                          <span className="text-slate-700">{record.startDateTime}</span>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 mx-1" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-orange-600 font-sans">終：</span>
                          <span className="text-slate-700">{record.endDateTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-lg text-sm font-bold border ${record.reimbursementType === '補休' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{record.reimbursementType}</span>
                        <div className="flex items-center gap-2 bg-slate-800 text-white px-