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
    department: '行政管理部' 
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
    comment: '同意，辛苦了。'
  },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('apply');
  const [records, setRecords] = useState(INITIAL_DATA);
  const [isSupervisor, setIsSupervisor] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [approvalComments, setApprovalComments] = useState({});
  
  // 生成流水號邏輯
  const currentSerialNumber = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    // 序號根據當前 records 長度遞增
    const sequence = String(records.length + 1).padStart(3, '0');
    return `${datePrefix}-${sequence}`;
  }, [records.length]);

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
      submittedAt: new Date().toLocaleString()
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
      approvedAt: new Date().toLocaleString()
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

  // 獲取當前登入者所有提交過的單據 (用於資訊欄)
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
                <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 uppercase tracking-wider shadow-inner font-mono">
                  <Hash size={14} /> 申請單號：{currentSerialNumber}
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8 font-sans">
                <div className="space-y-4">
                  <label className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600"/> 申報性質
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
                    <label className="text-sm font-bold text-slate-500">員工編號 (可修改)</label>
                    <input
                      type="text" required maxLength={4} placeholder="例如：1024"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-mono text-base"
                      value={formData.employeeId} 
                      onChange={(e) => handleEmployeeIdChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500">員工姓名 (可修改)</label>
                    <input
                      type="text" required placeholder="請輸入姓名"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-base"
                      value={formData.employeeName} 
                      onChange={(e) => handleEmployeeNameChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base font-bold text-slate-700">補償方式</label>
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
                    <label className="text-base font-bold text-slate-700 flex items-center gap-2">加班類別</label>
                    <select
                      required className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-base"
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
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-4 uppercase tracking-widest">起始日期與時間</div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-52 relative">
                        <input
                          type="date" required onClick={handleDateClick}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-base cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all outline-none font-sans"
                          value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-1 gap-3 font-sans">
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-base font-mono focus:ring-2 focus:ring-blue-500" value={formData.startHour} onChange={(e) => setFormData({...formData, startHour: e.target.value})}>
                          {hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}
                        </select>
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-base font-mono focus:ring-2 focus:ring-blue-500" value={formData.startMinute} onChange={(e) => setFormData({...formData, startMinute: e.target.value})}>
                          <option value="00">00 分</option>
                          <option value="30">30 分</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-sans">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-4 uppercase tracking-widest">結束日期與時間</div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-52 relative font-sans">
                        <input
                          type="date" required onClick={handleDateClick}
                          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-base cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all outline-none font-sans"
                          value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-1 gap-3 font-sans">
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-base font-mono focus:ring-2 focus:ring-blue-500" value={formData.endHour} onChange={(e) => setFormData({...formData, endHour: e.target.value})}>
                          {hourOptions.map(h => <option key={h} value={h}>{h} 時</option>)}
                        </select>
                        <select className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl text-base font-mono focus:ring-2 focus:ring-blue-500" value={formData.endMinute} onChange={(e) => setFormData({...formData, endMinute: e.target.value})}>
                          <option value="00">00 分</option>
                          <option value="30">30 分</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-900 rounded-2xl text-white shadow-xl">
                  <div className="flex items-center gap-4">
                    <Timer className="text-blue-400" size={28} />
                    <div className="text-left font-sans">
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">自動結算總時數</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black font-mono text-blue-400 tracking-tighter">{calculatedHours}</span>
                    <span className="ml-2 text-base font-bold text-slate-400 font-sans">小時</span>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-base font-bold text-slate-700">加班事由說明</label>
                  <textarea
                    rows="4" required placeholder="請詳細描述加班原因..."
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-base font-sans"
                    value={formData.reason} 
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  ></textarea>
                </div>

                <div className="pt-4 font-sans">
                  <button
                    type="submit" disabled={parseFloat(calculatedHours) <= 0}
                    className={`w-full font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg ${parseFloat(calculatedHours) > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                  >
                    <CheckCircle size={24} /> 提交加班申請案
                  </button>
                  {parseFloat(calculatedHours) <= 0 && formData.startDate && (
                    <p className="text-sm text-red-500 mt-3 text-center font-bold tracking-wide font-sans">⚠️ 結束時間必須晚於開始時間。</p>
                  )}
                </div>
              </form>

              {/* 加班申請注意事項 */}
              <div className="mt-12 p-8 bg-amber-50 border border-amber-200 rounded-2xl text-left font-sans shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-6 border-b border-amber-200 pb-3 tracking-wider text-base">
                  <AlertCircle size={22} />
                  <span>加班申請注意事項</span>
                </div>
                <ul className="space-y-4 text-base text-amber-900/80 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">A</span>
                    <span>加班申請須事前由直屬主管核准，始得進行加班；並於事後呈主管審核確認。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">B</span>
                    <span>此單由各部門編序號並於加班後<span className="text-amber-900 font-bold underline mx-1">七個工作日內</span>交至財務行政部辦理，逾期不受理。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">C</span>
                    <span>此加班工時將依比例換算補修時數或薪資。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 bg-amber-200 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">D</span>
                    <span>每月加班時數不得超過 <span className="text-red-600 font-bold">46 小時</span>。</span>
                  </li>
                </ul>
              </div>

              {/* 提交成功後的單據追蹤清單 - 直接從 records 篩選出目前登入者的所有單據 */}
              {mySubmissions.length > 0 && (
                <div id="submission-tracking" className="mt-12 animate-in zoom-in-95 fade-in slide-in-from-top-6 duration-700 text-left font-sans">
                  <div className="mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={20} className="text-emerald-600" />
                      <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">您的申請單據資訊</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[...mySubmissions].reverse().map((record, index) => (
                      <div key={record.id} className={`bg-white border-2 ${index === 0 ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200 shadow-sm'} rounded-3xl p-6 relative overflow-hidden transition-all hover:border-emerald-300`}>
                        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`${index === 0 ? 'bg-emerald-500' : 'bg-slate-400'} text-white p-2 rounded-xl shadow-lg`}>
                              <CheckCircle size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                              <span className="text-lg font-black text-slate-800 tracking-tight">申請單提交成功</span>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wide uppercase font-mono">ID: {record.id} | {record.submittedAt || '歷史紀錄'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 xl:max-w-4xl">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">單號</p>
                              <p className="text-xs font-mono font-black text-slate-700">{record.id}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">大名</p>
                              <p className="text-xs font-black text-slate-700">{record.applicant}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">異動時間</p>
                              <p className="text-[10px] font-bold text-slate-700 leading-tight">{(record.submittedAt || '').split(' ')[1] || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center shadow-inner">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">狀態</p>
                              <div className="flex items-center justify-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${record.status === '待簽核' ? 'bg-orange-400 animate-pulse' : record.status === '已駁回' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                <p className={`text-xs font-black uppercase ${record.status === '待簽核' ? 'text-orange-600' : record.status === '已駁回' ? 'text-red-600' : 'text-green-600'}`}>{record.status}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {record.status === '待簽核' && (
                              <button 
                                onClick={() => handleWithdraw(record.id)}
                                className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-black transition-all border border-red-100 active:scale-95 shadow-sm"
                                title="撤回此申請單"
                              >
                                <RotateCcw size={14} /> 抽單
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
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">待簽核加班清單</h2>
              <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold shadow-sm">
                目前有 {records.filter(r => r.status === '待簽核').length} 筆待處理
              </span>
            </div>
            {records.filter(r => r.status === '待簽核').length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-lg font-medium">目前沒有任何待簽核的加班申請案</div>
            ) : (
              records.filter(r => r.status === '待簽核').map(record => (
                <div key={record.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex flex-col space-y-4">
                    {/* 頂部資訊列：將名字與時間放在同一行，節省空間 */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-bold font-mono tracking-wider shadow-inner">單號: {record.id}</span>
                        <h3 className="font-bold text-xl text-slate-800 tracking-tight">{record.applicant}</h3>
                      </div>
                      
                      {/* 時間區塊：緊隨名字之後 */}
                      <div className="flex items-center gap-3 text-sm font-mono font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-600">始：</span>
                          <span className="text-slate-700">{record.startDateTime}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 mx-1" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-orange-600">終：</span>
                          <span className="text-slate-700">{record.endDateTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${record.reimbursementType === '補休' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{record.reimbursementType}</span>
                        <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold font-mono">
                          <Timer size={14} className="text-blue-400" /> {record.totalHours} 小時
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl text-base text-slate-600 border-l-4 border-slate-300 italic shadow-inner font-sans">
                      事由：{record.reason}
                    </div>
                  </div>

                  {/* 簽核意見與按鈕區 */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-500" /> 簽核意見 {(!approvalComments[record.id] || approvalComments[record.id].trim() === '') && <span className="text-[10px] text-red-500 font-bold">(駁回時必填)</span>}
                      </label>
                      <textarea
                        rows="2"
                        placeholder="請輸入核准或駁回之具體意見..."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-sans"
                        value={approvalComments[record.id] || ''}
                        onChange={(e) => setApprovalComments({...approvalComments, [record.id]: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="flex gap-3 w-full xl:w-auto font-sans">
                      <button 
                        onClick={() => handleApprove(record.id, '已核准')} 
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 text-base"
                      >
                        <Check size={20} /> 核准
                      </button>
                      <button 
                        disabled={!approvalComments[record.id] || approvalComments[record.id].trim() === ''}
                        onClick={() => handleApprove(record.id, '已駁回')} 
                        className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all text-base ${(!approvalComments[record.id] || approvalComments[record.id].trim() === '') ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60' : 'bg-white hover:bg-red-50 text-red-500 border border-red-100 shadow-md active:scale-95'}`}
                      >
                        <X size={20} /> 駁回
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'query':
        return (
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500 text-left font-sans">
            <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/50 font-sans">
              <h2 className="font-bold text-xl text-slate-800 tracking-tight">加班紀錄查詢與彙整</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="搜尋姓名、工號..." className="pl-12 pr-5 py-3 bg-white border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-blue-500 w-80 shadow-sm transition-all font-sans" />
              </div>
            </div>
            <div className="overflow-x-auto font-sans">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase font-black border-b border-slate-100 bg-slate-50/30">
                    <th className="px-8 py-6 text-left tracking-widest">單號</th>
                    <th className="px-8 py-6 text-left tracking-widest">姓名 / 工號</th>
                    <th className="px-8 py-6 text-left tracking-widest">加班時段</th>
                    <th className="px-8 py-6 text-left tracking-widest">時數 / 補償</th>
                    <th className="px-8 py-6 text-center tracking-widest">狀態</th>
                    <th className="px-8 py-6 text-right tracking-widest">動作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6 font-mono text-xs font-bold text-slate-500">{record.id}</td>
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-800 text-base">{record.applicant}</div>
                        <div className="text-xs text-slate-400 font-mono tracking-wider mt-0.5 opacity-60">#{record.employeeId}</div>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs leading-relaxed">
                        <div className="text-slate-700 font-black tracking-tighter">始：{record.startDateTime}</div>
                        <div className="text-slate-400 font-bold tracking-tighter">迄：{record.endDateTime}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-mono font-black text-base tracking-tighter">{record.totalHours}H</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-black border uppercase ${record.reimbursementType === '補休' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{record.reimbursementType}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-sans">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black shadow-sm uppercase ${record.status === '已核准' ? 'bg-green-50 text-green-600' : record.status === '待簽核' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>{record.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="text-slate-200 group-hover:text-blue-600 transition-all transform group-hover:translate-x-1"><ChevronRight size={24} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 text-left font-sans">
            <div className="lg:col-span-1 text-center font-sans">
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 shadow-md">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6 border-2 border-blue-200 font-black text-xl shadow-inner uppercase tracking-tighter">Admin</div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">王大錘 經理</h3>
                <p className="text-slate-400 text-xs mt-1 mb-8 font-mono font-bold uppercase tracking-[0.2em] opacity-60">工號: 1024</p>
                <button 
                  onClick={() => setIsSupervisor(!isSupervisor)}
                  className={`w-full py-3.5 rounded-2xl font-black transition-all border-2 text-base shadow-sm ${isSupervisor ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {isSupervisor ? '權限級別：管理員' : '權限級別：一般員工'}
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6 font-sans">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 shadow-sm">
                <h3 className="font-black text-base text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide font-sans"><Settings size={20} className="text-blue-600" /> 系統參數設定</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="text-sm font-bold text-slate-700">自動生成單據流水號</div>
                    <span className="text-xs font-black text-blue-600 bg-white border border-blue-100 px-4 py-1 rounded-lg font-mono shadow-sm">{currentSerialNumber}</span>
                  </div>
                  <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="text-sm font-bold text-slate-700">預設登入者自動帶入</div>
                    <span className="text-xs font-black text-green-600 bg-white border border-green-100 px-4 py-1 rounded-lg shadow-sm">ENABLED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-900">
      <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 z-50 ${isSidebarOpen ? 'w-72' : 'w-24'} shadow-2xl font-sans`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 font-sans">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="bg-blue-600 p-2.5 rounded-xl shrink-0 shadow-lg shadow-blue-900/20">
              <FileText size={24} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300 font-sans">
                <h1 className="text-base font-black tracking-[0.1em] text-slate-100 uppercase">內部管理系統</h1>
              </div>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-500 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-8 space-y-8 font-sans">
           {isSidebarOpen && (
             <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-inner font-sans">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">系統狀態</h4>
               <div className="space-y-4">
                 <div className="flex items-center justify-between text-xs font-bold">
                   <span className="text-slate-500 uppercase tracking-widest">使用者</span>
                   <span className="text-blue-400 font-black">{CURRENT_LOGGED_USER.name}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold">
                   <span className="text-slate-500 uppercase tracking-widest">權限級別</span>
                   <span className={isSupervisor ? "text-green-400 font-black" : "text-slate-400 font-black"}>{isSupervisor ? "管理人員" : "一般權限"}</span>
                 </div>
               </div>
             </div>
           )}
        </div>

        <div className="p-4 border-t border-slate-800/50 font-sans">
          <div className={`flex items-center p-4 bg-slate-800/30 rounded-2xl ${!isSidebarOpen && 'justify-center'} border border-slate-800/50 font-sans`}>
            <User size={22} className="text-blue-400 shrink-0" />
            {isSidebarOpen && (
              <div className="ml-4 overflow-hidden text-left animate-in fade-in duration-300 font-sans">
                <p className="text-[10px] font-black text-slate-500 font-mono tracking-widest uppercase opacity-60">EMP ID #{CURRENT_LOGGED_USER.id}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden font-sans">
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md z-40 px-10 flex items-center justify-between shadow-sm font-sans">
          <div className="flex items-center gap-2 h-full font-sans">
            <TabItem active={activeTab === 'apply'} label="加班申請" onClick={() => setActiveTab('apply')} />
            {isSupervisor && (
              <TabItem active={activeTab === 'approve'} label="主管簽核" onClick={() => setActiveTab('approve')} badge={records.filter(r => r.status === '待簽核').length} />
            )}
            <TabItem active={activeTab === 'query'} label="紀錄查詢" onClick={() => setActiveTab('query')} />
            <TabItem active={activeTab === 'settings'} label="系統設定" onClick={() => setActiveTab('settings')} />
          </div>
          
          <div className="flex items-center gap-6 font-sans">
            <div className="text-xs text-slate-400 font-mono font-black tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 shadow-inner">{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</div>
            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 shadow-sm active:scale-90 font-sans">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 font-sans">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const TabItem = ({ active, label, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`h-full px-8 flex items-center gap-3 transition-all relative font-black text-sm tracking-widest uppercase font-sans ${
      active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-800'
    }`}
  >
    {label}
    {badge > 0 && (
      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[20px] text-center font-black animate-pulse shadow-sm shadow-red-200 font-sans">
        {badge}
      </span>
    )}
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-full shadow-[0_-2px_12px_rgba(37,99,235,0.4)]"></div>
    )}
  </button>
);

export default App;